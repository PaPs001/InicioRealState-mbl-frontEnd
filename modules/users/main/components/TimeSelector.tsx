import { memo, useCallback, useEffect, useRef, useState } from "react";
import {
  Pressable,
  Text,
  View,
  type NativeScrollEvent,
  type NativeSyntheticEvent,
  type ScrollView as NativeScrollView,
} from "react-native";
import { ScrollView } from "react-native-gesture-handler";

import {
  TIME_ROW_HEIGHT,
  timeSelectorStyles as styles,
} from "./styles/TimeSelector.styles";

type TimeSelectorProps = {
  hour: number;
  minute: number;
  hourOptions: number[];
  minuteOptions: number[];
  onHourChange: (hour: number) => void;
  onMinuteChange: (minute: number) => void;
};

const displayHour = (hour: number) => String(hour % 12 || 12).padStart(2, "0");
const displayMinute = (minute: number) => String(minute).padStart(2, "0");

export function TimeSelector({
  hour,
  minute,
  hourOptions,
  minuteOptions,
  onHourChange,
  onMinuteChange,
}: TimeSelectorProps) {
  const period = hour < 12 ? "AM" : "PM";
  const morningHours = hourOptions.filter(
    (option) => option >= 0 && option < 12,
  );
  const afternoonHours = hourOptions.filter(
    (option) => option >= 12 && option <= 23,
  );
  const hours = period === "AM" ? morningHours : afternoonHours;
  const rememberedHours = useRef({ AM: 8, PM: 14 });

  useEffect(() => {
    rememberedHours.current[period] = hour;
  }, [hour, period]);

  function selectPeriod(nextPeriod: "AM" | "PM") {
    const options = nextPeriod === "AM" ? morningHours : afternoonHours;
    if (!options.length || nextPeriod === period) return;
    const preferred = rememberedHours.current[nextPeriod];
    onHourChange(options.includes(preferred) ? preferred : options[0]);
  }

  return (
    <View style={styles.container}>
      <View style={styles.picker}>
        <View style={styles.clock}>
          <View style={styles.labels}>
            <Text style={styles.label}>Hora</Text>
            <View style={styles.separatorSpace} />
            <Text style={styles.label}>Minutos</Text>
          </View>
          <View style={styles.wheels}>
            <View pointerEvents="none" style={styles.selection} />
            <NumberWheel
              options={hours}
              value={hour}
              onChange={onHourChange}
              format={displayHour}
              label="Hora"
            />
            <View pointerEvents="none" style={styles.separatorContainer}>
              <Text style={styles.separator}>:</Text>
            </View>
            <NumberWheel
              options={minuteOptions}
              value={minute}
              onChange={onMinuteChange}
              format={displayMinute}
              label="Minutos"
            />
          </View>
        </View>
        <View style={styles.periods}>
          {(["AM", "PM"] as const).map((option) => {
            const selected = period === option;
            const disabled = !(option === "AM" ? morningHours : afternoonHours)
              .length;
            return (
              <Pressable
                key={option}
                accessibilityRole="button"
                accessibilityLabel={
                  option === "AM"
                    ? "Horario de medianoche a antes del mediodía"
                    : "Horario de mediodía a antes de medianoche"
                }
                accessibilityState={{ selected, disabled }}
                disabled={disabled}
                onPress={() => selectPeriod(option)}
                style={[
                  styles.periodButton,
                  selected && styles.periodSelected,
                  disabled && styles.disabled,
                ]}
              >
                <Text
                  numberOfLines={1}
                  adjustsFontSizeToFit
                  style={[
                    styles.periodText,
                    selected && styles.periodTextSelected,
                  ]}
                >
                  {option}
                </Text>
              </Pressable>
            );
          })}
        </View>
      </View>
      <Text accessibilityLiveRegion="polite" style={styles.summary}>
        Hora seleccionada: {displayHour(hour)}:{displayMinute(minute)}{" "}
        {period}
      </Text>
    </View>
  );
}

type NumberWheelProps = {
  options: number[];
  value: number;
  onChange: (value: number) => void;
  format: (value: number) => string;
  label: string;
};

// Native scrolling handles dragging, momentum and snapping without per-frame
// animations for all 60 minute labels. React only changes the highlighted row.
const NumberWheel = memo(function NumberWheel({ options, value, onChange, format, label }: NumberWheelProps) {
  const selectedIndex = Math.max(0, options.indexOf(value))
  const [activeIndex, setActiveIndex] = useState(selectedIndex)
  const scrollRef = useRef<NativeScrollView>(null)
  const offsetRef = useRef(selectedIndex * TIME_ROW_HEIGHT)
  const draggingRef = useRef(false)
  const settleTimer = useRef<ReturnType<typeof setTimeout> | null>(null)
  const committedValue = useRef(value)
  const optionKey = options.join(',')
  const previousOptions = useRef(optionKey)
  const initialOffset = useRef({ x: 0, y: selectedIndex * TIME_ROW_HEIGHT })

  const clearSettleTimer = useCallback(() => {
    if (settleTimer.current !== null) {
      clearTimeout(settleTimer.current)
      settleTimer.current = null
    }
  }, [])

  useEffect(() => clearSettleTimer, [clearSettleTimer])

  useEffect(() => {
    // A locally committed value is already aligned by native snapToInterval.
    // Only reposition for external value/range changes, such as AM/PM.
    if (committedValue.current === value && previousOptions.current === optionKey) return
    clearSettleTimer()
    previousOptions.current = optionKey
    committedValue.current = value
    offsetRef.current = selectedIndex * TIME_ROW_HEIGHT
    setActiveIndex(selectedIndex)
    scrollRef.current?.scrollTo({ y: offsetRef.current, animated: false })
  }, [value, optionKey, selectedIndex, clearSettleTimer])

  const indexAtOffset = useCallback((offset: number) => (
    Math.max(0, Math.min(options.length - 1, Math.round(offset / TIME_ROW_HEIGHT)))
  ), [options.length])

  const commitSelection = useCallback(() => {
    clearSettleTimer()
    if (!options.length) return
    const index = indexAtOffset(offsetRef.current)
    const target = index * TIME_ROW_HEIGHT
    setActiveIndex(index)
    if (Math.abs(offsetRef.current - target) > 0.5) {
      scrollRef.current?.scrollTo({ y: target, animated: false })
    }
    offsetRef.current = target
    const nextValue = options[index]
    if (nextValue !== committedValue.current) {
      committedValue.current = nextValue
      onChange(nextValue)
    }
  }, [options, onChange, indexAtOffset, clearSettleTimer])

  function handleScroll(event: NativeSyntheticEvent<NativeScrollEvent>) {
    offsetRef.current = event.nativeEvent.contentOffset.y
    const index = indexAtOffset(offsetRef.current)
    setActiveIndex(previous => previous === index ? previous : index)
  }

  const selectIndex = useCallback((index: number) => {
    if (!options.length) return
    clearSettleTimer()
    const boundedIndex = Math.max(0, Math.min(options.length - 1, index))
    offsetRef.current = boundedIndex * TIME_ROW_HEIGHT
    setActiveIndex(boundedIndex)
    scrollRef.current?.scrollTo({ y: offsetRef.current, animated: true })
    committedValue.current = options[boundedIndex]
    onChange(options[boundedIndex])
  }, [options, onChange, clearSettleTimer])

  return (
    <ScrollView
      ref={scrollRef}
      style={styles.viewport}
      contentContainerStyle={styles.wheelContent}
      contentOffset={initialOffset.current}
      showsVerticalScrollIndicator={false}
      snapToInterval={TIME_ROW_HEIGHT}
      snapToAlignment="start"
      decelerationRate="fast"
      bounces={false}
      overScrollMode="never"
      scrollEventThrottle={32}
      onScroll={handleScroll}
      onScrollBeginDrag={() => {
        clearSettleTimer()
        draggingRef.current = true
      }}
      onScrollEndDrag={event => {
        offsetRef.current = event.nativeEvent.contentOffset.y
        draggingRef.current = false
        // A short drag may finish without a momentum event.
        settleTimer.current = setTimeout(() => {
          if (!draggingRef.current) commitSelection()
        }, 150)
      }}
      onMomentumScrollBegin={clearSettleTimer}
      onMomentumScrollEnd={event => {
        offsetRef.current = event.nativeEvent.contentOffset.y
        commitSelection()
      }}
      accessible
      accessibilityRole="adjustable"
      accessibilityLabel={label}
      accessibilityValue={{ text: format(value), min: 0, max: Math.max(0, options.length - 1), now: selectedIndex }}
      accessibilityActions={[{ name: 'increment' }, { name: 'decrement' }]}
      onAccessibilityAction={event => selectIndex(selectedIndex + (event.nativeEvent.actionName === 'increment' ? 1 : -1))}
    >
      {options.map((option, index) => (
        <WheelRow key={option} index={index} text={format(option)} selected={index === activeIndex} onSelect={selectIndex} />
      ))}
    </ScrollView>
  )
})

const WheelRow = memo(function WheelRow({ index, text, selected, onSelect }: { index: number; text: string; selected: boolean; onSelect: (index: number) => void }) {
  return (
    <Pressable style={styles.wheelRow} onPress={() => onSelect(index)} accessible={false}>
      <Text numberOfLines={1} style={[styles.number, selected && styles.numberSelected]}>{text}</Text>
    </Pressable>
  )
})


