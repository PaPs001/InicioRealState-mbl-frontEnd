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
import { CalendarDays, Flag, Home, MessageCircle, Users } from 'lucide-react-native'
import { styles } from './CoordinatorBottomNav.styles'

const NAV_HORIZONTAL_PADDING = 8
const NAV_ITEM_COUNT = 5
const INDICATOR_WIDTH = 74
const ANIMATION_MS = 170

export function CoordinatorBottomNav() {
  const router = useRouter()
  const pathname = usePathname()
  const { width } = useWindowDimensions()
  const activeIndex = getActiveIndex(pathname)
  const [pendingActiveIndex, setPendingActiveIndex] = useState<number | null>(null)
  const visualActiveIndex = pendingActiveIndex ?? activeIndex
  const itemWidth = (width - NAV_HORIZONTAL_PADDING * 2) / NAV_ITEM_COUNT
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
      withTiming(1.12, { duration: 90, easing: Easing.out(Easing.quad) }),
      withTiming(0.84, { duration: 120, easing: Easing.out(Easing.quad) }),
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

  const navigateTo = (index: number, href: '/coordinator' | '/coordinator/properties' | '/coordinator/leads') => {
    setPendingActiveIndex(index)
    if (pathname !== href) {
      router.push(href as never)
    }
  }

  return (
    <View style={styles.bottomNav}>
      <Animated.View style={[styles.navActiveScoop, indicatorStyle]} />
      <NavItem
        icon={(color, size) => <Users size={size} color={color} />}
        label="Propiedades"
        size={24}
        active={visualActiveIndex === 0}
        onPress={() => navigateTo(0, '/coordinator/properties')}
      />
      <NavItem
        icon={(color, size) => <CalendarDays size={size} color={color} />}
        label="Citas"
        size={25}
        active={visualActiveIndex === 1}
      />
      <NavItem
        icon={(color, size) => <Home size={size} color={color} />}
        label="Inicio"
        size={27}
        active={visualActiveIndex === 2}
        onPress={() => navigateTo(2, '/coordinator')}
      />
      <NavItem
        icon={(color, size) => <Flag size={size} color={color} />}
        label="Seguimiento"
        size={24}
        active={visualActiveIndex === 3}
        onPress={() => navigateTo(3, '/coordinator/leads')}
      />
      <View style={visualActiveIndex === 4 ? styles.navItemActive : styles.navItem}>
        <View style={styles.badge}>
          <Text style={styles.badgeText}>77</Text>
        </View>
        <MessageCircle size={visualActiveIndex === 4 ? 48 : 24} color={visualActiveIndex === 4 ? '#c59b55' : '#767676'} />
        {visualActiveIndex === 4 ? null : (
          <Text style={styles.navLabel} numberOfLines={1} adjustsFontSizeToFit minimumFontScale={0.82}>
            Chats
          </Text>
        )}
      </View>
    </View>
  )
}

function getIndicatorX(itemWidth: number, index: number) {
  return NAV_HORIZONTAL_PADDING + itemWidth * index + itemWidth / 2 - INDICATOR_WIDTH / 2
}

function getActiveIndex(pathname: string) {
  if (
    pathname.startsWith('/coordinator/properties') ||
    pathname.startsWith('/coordinator/developments-soon')
  ) {
    return 0
  }

  if (pathname.startsWith('/coordinator/leads')) {
    return 3
  }

  if (pathname === '/coordinator' || pathname === '/coordinator/') {
    return 2
  }

  return 2
}

function NavItem({
  icon,
  label,
  size,
  active = false,
  onPress,
}: {
  icon: (color: string, size: number) => ReactNode
  label: string
  size: number
  active?: boolean
  onPress?: () => void
}) {
  const color = active ? '#c59b55' : '#767676'
  const iconSize = active ? size * 2 : size

  return (
    <TouchableOpacity
      style={active ? styles.navItemActive : styles.navItem}
      activeOpacity={0.85}
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
