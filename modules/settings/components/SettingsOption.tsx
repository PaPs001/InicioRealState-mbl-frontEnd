import { Pressable, StyleSheet, Text, View } from 'react-native'
import { useState } from 'react'
import { OperationMode } from '../types'

type SettingsOptionProps<T extends string> = {
  label: string
  description: string
  value: T
  selectedValue: T
  onSelect: (value: T) => void
  position: 'left' | 'center' | 'right'
}

export function SettingsOption<T extends string>({
  label,
  description,
  value,
  selectedValue,
  onSelect,
  position,
}: SettingsOptionProps<T>) {
  const isSelected = value === selectedValue

  return (
    <Pressable
      accessibilityState={{ checked: isSelected }}
      onPress={() => onSelect(value)}
      style={[
        styles.container,

        position === 'left' && styles.leftOption,
        position === 'center' && styles.centerOption,
        position === 'right' && styles.rightOption,

        isSelected && styles.containerSelected,
      ]}
    >
      <Text style={[styles.label, isSelected && styles.labelSelected]}>
        {label}
      </Text>
    </Pressable>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    minHeight: 52,
    backgroundColor: '#ffffff',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 8,
    borderColor: '#ded6ca',
  },

  leftOption: {
    borderWidth: 1,
    borderTopLeftRadius: 12,
    borderBottomLeftRadius: 12,
  },

  centerOption: {
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderRightWidth: 1,
  },

  rightOption: {
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderRightWidth: 1,
    borderTopRightRadius: 12,
    borderBottomRightRadius: 12,
  },

  containerSelected: {
    backgroundColor: '#0c6740',
  },

  label: {
    color: '#b88b3d',
    fontSize: 14,
    lineHeight: 20,
    fontWeight: '600',
    textTransform: 'uppercase',
  },

  labelSelected: {
    color: '#ffffff',
  },
});
