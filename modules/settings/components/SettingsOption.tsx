import { Pressable, StyleSheet, Text, View } from 'react-native'

type SettingsOptionProps<T extends string> = {
  label: string
  description: string
  value: T
  selectedValue: T
  onSelect: (value: T) => void
}

export function SettingsOption<T extends string>({
  label,
  description,
  value,
  selectedValue,
  onSelect,
}: SettingsOptionProps<T>) {
  const isSelected = value === selectedValue

  return (
    <Pressable
      accessibilityRole="radio"
      accessibilityState={{ checked: isSelected }}
      onPress={() => onSelect(value)}
      style={[
        styles.container,
        isSelected && styles.containerSelected,
      ]}
    >
      <View style={styles.copy}>
        <Text style={styles.label}>{label}</Text>
        <Text style={styles.description}>{description}</Text>
      </View>
      <View
        style={[
          styles.radio,
          isSelected && styles.radioSelected,
        ]}
      >
        {isSelected ? <View style={styles.radioDot} /> : null}
      </View>
    </Pressable>
  )
}

const styles = StyleSheet.create({
  container: {
    minHeight: 76,
    borderWidth: 1,
    borderColor: '#ded6ca',
    borderRadius: 14,
    backgroundColor: '#ffffff',
    paddingHorizontal: 16,
    paddingVertical: 13,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  containerSelected: {
    borderColor: '#0c6740',
  },
  copy: {
    flex: 1,
  },
  label: {
    color: '#19191f',
    fontSize: 15,
    lineHeight: 20,
    fontWeight: '600',
  },
  description: {
    color: '#697b74',
    marginTop: 3,
    fontSize: 13,
    lineHeight: 18,
  },
  radio: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 2,
    borderColor: '#ded6ca',
    alignItems: 'center',
    justifyContent: 'center',
  },
  radioSelected: {
    borderColor: '#0c6740',
  },
  radioDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#0c6740',
  },
})
