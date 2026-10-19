import { useCallback, useEffect, useMemo, useRef } from 'react'
import { Text, View } from 'react-native'
import { Gesture, GestureDetector } from 'react-native-gesture-handler'
import Animated, {
  Extrapolation,
  SharedValue,
  interpolate,
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from 'react-native-reanimated'

import { wheelNumberSelectorStyles as styles } from './styles/WheelNumberSelector.styles'

const WHEEL_VISIBLE_ITEMS = 7
const WHEEL_CENTER_INDEX = Math.floor(WHEEL_VISIBLE_ITEMS / 2)
const WHEEL_RENDER_BUFFER = 3
const WHEEL_RENDERED_ITEMS = WHEEL_VISIBLE_ITEMS + WHEEL_RENDER_BUFFER * 2
const WHEEL_ITEM_WIDTH = 48
const WHEEL_ITEM_HEIGHT = 34
const WHEEL_VELOCITY_FACTOR = 0.12
const WHEEL_SPRING_CONFIG = {
  damping: 18,
  stiffness: 180,
}

type WheelNumberSelectorProps = {
  options: number[]
  value: number
  hasSelectedValue: boolean
  onChange: (value: number) => void
}

export function WheelNumberSelector({
  options,
  value,
  hasSelectedValue,
  onChange,
}: WheelNumberSelectorProps) {
  const translateY = useSharedValue(0)
  const consumedDragSteps = useSharedValue(0)
  const latestValueRef = useRef(value)
  const visibleOptions = useMemo(
    () => getWheelOptions(options, value),
    [options, value],
  )
  const trackStyle = useAnimatedStyle(() => ({
    transform: [
      { translateY: -WHEEL_RENDER_BUFFER * WHEEL_ITEM_HEIGHT },
      { translateY: translateY.value },
    ],
  }))

  useEffect(() => {
    latestValueRef.current = value
  }, [value])

  const applyWheelMovement = useCallback((offset: number) => {
    if (offset === 0) return

    const nextValue = getRelativeOption(options, latestValueRef.current, offset)
    latestValueRef.current = nextValue
    onChange(nextValue)
  }, [onChange, options])

  const panGesture = useMemo(
    () => Gesture.Pan()
      .activeOffsetY([-8, 8])
      .failOffsetX([-12, 12])
      .onBegin(() => {
        consumedDragSteps.value = 0
        translateY.value = 0
      })
      .onUpdate(event => {
        const dragSteps = Math.trunc(event.translationY / WHEEL_ITEM_HEIGHT)
        const stepDelta = dragSteps - consumedDragSteps.value

        if (stepDelta !== 0) {
          consumedDragSteps.value = dragSteps
          runOnJS(applyWheelMovement)(-stepDelta)
        }

        const remainingTranslation = event.translationY - dragSteps * WHEEL_ITEM_HEIGHT
        translateY.value = clampWheelTranslation(remainingTranslation)
      })
      .onEnd(event => {
        const velocitySteps = event.velocityY * WHEEL_VELOCITY_FACTOR / WHEEL_ITEM_HEIGHT
        const extraSteps = Math.round(translateY.value / WHEEL_ITEM_HEIGHT + velocitySteps)

        runOnJS(applyWheelMovement)(-extraSteps)

        consumedDragSteps.value = 0
        translateY.value = withSpring(0, WHEEL_SPRING_CONFIG)
      }),
    [applyWheelMovement, consumedDragSteps, translateY],
  )
  const tapGesture = useMemo(
    () => Gesture.Tap()
      .onEnd(event => {
        const centerY = WHEEL_ITEM_HEIGHT * WHEEL_CENTER_INDEX + WHEEL_ITEM_HEIGHT / 2
        const offset = Math.round((event.y - centerY) / WHEEL_ITEM_HEIGHT)

        runOnJS(applyWheelMovement)(offset)
      }),
    [applyWheelMovement],
  )
  const gesture = useMemo(
    () => Gesture.Exclusive(panGesture, tapGesture),
    [panGesture, tapGesture],
  )

  return (
    <GestureDetector gesture={gesture}>
      <View style={styles.viewport} collapsable={false}>
        <Animated.View
          style={[
            styles.track,
            { height: WHEEL_RENDERED_ITEMS * WHEEL_ITEM_HEIGHT },
            trackStyle,
          ]}
        >
          {visibleOptions.map((option, index) => (
            <WheelNumberItem
              key={`${option}-${index}`}
              option={option}
              index={index}
              translateY={translateY}
              isSelected={false}
            />
          ))}
        </Animated.View>
        <View pointerEvents="none" style={styles.centerOverlay}>
          <View
            style={[
              styles.option,
              { width: WHEEL_ITEM_WIDTH, height: WHEEL_ITEM_HEIGHT },
              hasSelectedValue && styles.optionActive,
            ]}
          >
            <Text
              style={[
                styles.optionText,
                hasSelectedValue && styles.optionTextActive,
              ]}
            >
              {String(value).padStart(2, '0')}
            </Text>
          </View>
        </View>
      </View>
    </GestureDetector>
  )
}

type WheelNumberItemProps = {
  option: number
  index: number
  isSelected: boolean
  translateY: SharedValue<number>
}

export function WheelNumberItem({
  option,
  index,
  isSelected,
  translateY,
}: WheelNumberItemProps) {
  const animatedStyle = useAnimatedStyle(() => {
    const distanceFromCenter = Math.abs(
      index - WHEEL_RENDER_BUFFER - WHEEL_CENTER_INDEX + translateY.value / WHEEL_ITEM_HEIGHT,
    )

    return {
      transform: [
        {
          scale: interpolate(
            distanceFromCenter,
            [0, WHEEL_CENTER_INDEX],
            [1.16, 0.82],
            Extrapolation.CLAMP,
          ),
        },
      ],
      opacity: interpolate(
        distanceFromCenter,
        [0, WHEEL_CENTER_INDEX],
        [1, 0.36],
        Extrapolation.CLAMP,
      ),
    }
  })

  return (
    <Animated.View
      style={[
        styles.option,
        { width: WHEEL_ITEM_WIDTH, height: WHEEL_ITEM_HEIGHT },
        isSelected && styles.optionActive,
        animatedStyle,
      ]}
    >
      <Animated.Text
        style={[
          styles.optionText,
          isSelected && styles.optionTextActive,
        ]}
      >
        {String(option).padStart(2, '0')}
      </Animated.Text>
    </Animated.View>
  )
}

function getWheelOptions(options: number[], value: number) {
  const selectedIndex = Math.max(options.indexOf(value), 0)

  return Array.from({ length: WHEEL_RENDERED_ITEMS }, (_, index) => (
    getRelativeOption(
      options,
      options[selectedIndex],
      index - WHEEL_RENDER_BUFFER - WHEEL_CENTER_INDEX,
    )
  ))
}

function getRelativeOption(options: number[], value: number, offset: number) {
  const selectedIndex = Math.max(options.indexOf(value), 0)
  const nextIndex = (selectedIndex + offset + options.length) % options.length

  return options[nextIndex]
}

function clampWheelTranslation(value: number) {
  'worklet'

  const limit = WHEEL_RENDER_BUFFER * WHEEL_ITEM_HEIGHT

  return Math.min(Math.max(value, -limit), limit)
}
