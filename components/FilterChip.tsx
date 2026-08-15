import { TouchableOpacity, StyleSheet, Text } from "react-native"

export function FilterChip({
  label,
  active,
  activeColor,
  onPress,
}: {
  label: string
  active: boolean
  activeColor?: string
  onPress: () => void
}) {
  return (
    <TouchableOpacity
      style={[
        styles.filterChip,
        active && styles.filterChipActive,
        active && activeColor ? { backgroundColor: activeColor } : null,
      ]}
      activeOpacity={0.85}
      onPress={onPress}
    >
      <Text style={[styles.filterChipText, active && styles.filterChipTextActive]}>{label}</Text>
    </TouchableOpacity>
  )
}

const styles = StyleSheet.create({
  filterChip: {
    flex: 1,
    minWidth: 0,
    height: 30,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  filterChipActive: {
    backgroundColor: '#0c6740',
  },
  filterChipText: {
    color: '#0c6740',
    fontSize: 12,
    fontWeight: '600',
  },
  filterChipTextActive: {
    color: '#ffffff',
  },
})
