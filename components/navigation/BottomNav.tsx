import { useEffect, useState, type ReactNode } from 'react'
import { Text, TouchableOpacity, useWindowDimensions, View } from 'react-native'
import { usePathname, useRouter } from 'expo-router'
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withSequence,
  withTiming,
} from 'react-native-reanimated'

import { useBottomNavHidden } from '@/lib/navigation/bottom-nav-visibility'
import { styles } from './BottomNav.styles'

const NAV_HORIZONTAL_PADDING = 8
const INDICATOR_WIDTH = 74
const ANIMATION_MS = 170

export type BottomNavItem = {
  key: string
  label: string
  href?: string
  icon: (color: string, size: number) => ReactNode
  size: number
  isActive?: (pathname: string) => boolean
  onPress?: () => void
  disabled?: boolean
}

type BottomNavProps = {
  items: BottomNavItem[]
  defaultActiveIndex?: number
}

export function BottomNav({ items, defaultActiveIndex = 0 }: BottomNavProps) {
  const router = useRouter()
  const pathname = usePathname()
  const isHidden = useBottomNavHidden()
  const { width } = useWindowDimensions()
  const activeIndex = getActiveIndex(items, pathname, defaultActiveIndex)
  const [pendingActiveIndex, setPendingActiveIndex] = useState<number | null>(null)
  const visualActiveIndex = pendingActiveIndex ?? activeIndex
  const itemWidth = (width - NAV_HORIZONTAL_PADDING * 2) / Math.max(items.length, 1)
  const translateX = useSharedValue(getIndicatorX(itemWidth, visualActiveIndex))
  const scaleX = useSharedValue(1)
  const scaleY = useSharedValue(1)

  const indicatorStyle = useAnimatedStyle(() => ({
    transform: [
      { translateX: translateX.value },
      { scaleX: scaleX.value },
      { scaleY: scaleY.value },
    ],
  }))

  useEffect(() => {
    if (pendingActiveIndex !== null && activeIndex === pendingActiveIndex) {
      setPendingActiveIndex(null)
    }
  }, [activeIndex, pendingActiveIndex])

  useEffect(() => {
    const targetX = getIndicatorX(itemWidth, visualActiveIndex)
    const currentX = translateX.value
    const direction = targetX >= currentX ? 1 : -1

    scaleX.value = withSequence(
      withTiming(0.84, { duration: 90, easing: Easing.out(Easing.quad) }),
      withTiming(1.28, { duration: 120, easing: Easing.out(Easing.quad) }),
      withTiming(0.92, { duration: 90, easing: Easing.out(Easing.quad) }),
      withTiming(1, { duration: 110, easing: Easing.out(Easing.quad) }),
    )
    scaleY.value = withSequence(
      withTiming(1.08, { duration: 90, easing: Easing.out(Easing.quad) }),
      withTiming(1, { duration: 110, easing: Easing.out(Easing.quad) }),
    )
    translateX.value = withSequence(
      withTiming(currentX - direction * 14, { duration: 90, easing: Easing.out(Easing.quad) }),
      withTiming(targetX + direction * 10, { duration: ANIMATION_MS, easing: Easing.out(Easing.cubic) }),
      withTiming(targetX - direction * 5, { duration: 90, easing: Easing.out(Easing.quad) }),
      withTiming(targetX, { duration: 110, easing: Easing.out(Easing.quad) }),
    )
  }, [itemWidth, scaleX, scaleY, translateX, visualActiveIndex])

  const handlePress = (item: BottomNavItem, index: number) => {
    if (item.disabled) return
    setPendingActiveIndex(index)
    item.onPress?.()

    if (item.href && pathname !== item.href) {
      router.push(item.href as never)
    }
  }

  if (isHidden) return null

  return (
    <View style={styles.bottomNav}>
      <Animated.View style={[styles.navActiveScoop, indicatorStyle]} />
      {items.map((item, index) => (
        <NavItem
          active={visualActiveIndex === index}
          disabled={item.disabled || (!item.href && !item.onPress)}
          icon={item.icon}
          key={item.key}
          label={item.label}
          onPress={() => handlePress(item, index)}
          size={item.size}
        />
      ))}
    </View>
  )
}

function getIndicatorX(itemWidth: number, index: number) {
  return NAV_HORIZONTAL_PADDING + itemWidth * index + itemWidth / 2 - INDICATOR_WIDTH / 2
}

function getActiveIndex(items: BottomNavItem[], pathname: string, defaultActiveIndex: number) {
  const activeIndex = items.findIndex((item) => {
    if (item.isActive) return item.isActive(pathname)
    if (!item.href) return false
    return pathname === item.href || pathname.startsWith(`${item.href}/`)
  })

  return activeIndex >= 0 ? activeIndex : defaultActiveIndex
}

function NavItem({
  icon,
  label,
  size,
  active = false,
  disabled = false,
  onPress,
}: {
  icon: (color: string, size: number) => ReactNode
  label: string
  size: number
  active?: boolean
  disabled?: boolean
  onPress?: () => void
}) {
  const color = active ? '#c59b55' : '#767676'
  const iconSize = active ? size * 1.5 : size

  return (
    <TouchableOpacity
      style={active ? styles.navItemActive : styles.navItem}
      activeOpacity={0.85}
      disabled={disabled}
      onPress={onPress}
    >
      <View style={active ? styles.navActiveButton : undefined}>
        {icon(color, iconSize)}
      </View>
      {active ? null : (
        <Text
          style={styles.navLabel}
          numberOfLines={1}
          adjustsFontSizeToFit
          minimumFontScale={0.82}
        >
          {label}
        </Text>
      )}
    </TouchableOpacity>
  )
}
