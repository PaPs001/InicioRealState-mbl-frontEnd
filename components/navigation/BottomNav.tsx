import { type ReactNode } from 'react'
import { Text, TouchableOpacity, useWindowDimensions, View } from 'react-native'
import { usePathname, useRouter } from 'expo-router'

import { useBottomNavHidden } from '@/lib/navigation/bottom-nav-visibility'
import { styles } from './BottomNav.styles'

const NAV_HORIZONTAL_PADDING = 8
const INDICATOR_WIDTH = 74

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
  const itemWidth = (width - NAV_HORIZONTAL_PADDING * 2) / Math.max(items.length, 1)

  const handlePress = (item: BottomNavItem) => {
    if (item.disabled) return
    item.onPress?.()

    if (item.href && pathname !== item.href) {
      router.push(item.href as never)
    }
  }

  if (isHidden) return null

  return (
    <View style={styles.bottomNav}>
      <View
        style={[
          styles.navActiveScoop,
          { transform: [{ translateX: getIndicatorX(itemWidth, activeIndex) }] },
        ]}
      />
      {items.map((item, index) => (
        <NavItem
          active={activeIndex === index}
          disabled={item.disabled || (!item.href && !item.onPress)}
          icon={item.icon}
          key={item.key}
          label={item.label}
          onPress={() => handlePress(item)}
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

  return (
    <TouchableOpacity
      style={styles.navItem}
      activeOpacity={0.85}
      disabled={disabled}
      onPress={onPress}
    >
      <View>
        {icon(color, size)}
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
