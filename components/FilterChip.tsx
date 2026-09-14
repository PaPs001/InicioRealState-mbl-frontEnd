import { TouchableOpacity, StyleSheet, Text } from "react-native"

export function FilterChip({
  label,
  active,
  activeColor,
  onPress,
  disabled = false,
}: {
  label: string
  active: boolean
  activeColor?: string
  onPress: () => void
  disabled?: boolean
}) {
  return (
    <TouchableOpacity
      style={[
        styles.filterChip,
        active && styles.filterChipActive,
        active && activeColor ? { backgroundColor: activeColor } : null,
        disabled && styles.filterChipDisabled,
      ]}
      activeOpacity={0.85}
      onPress={onPress}
      disabled={disabled}
    >
      <Text style={[
          styles.filterChipText,
          active && styles.filterChipTextActive,
          disabled && styles.filterChipTextDisabled,
        ]}
      >
        {label}
      </Text>
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
  filterChipDisabled: {
    backgroundColor: '#E5E7EB',
    opacity: 0.7,
  },
  filterChipTextDisabled: {
    color: '#6B7280',
  },
})
