import { Pressable, StyleSheet, Text, View } from 'react-native'
import { ComponentType, useState } from 'react'
import { OperationMode } from '../types'
import { generalColors, userColors } from '@/theme'
import { SvgProps } from 'react-native-svg'

type SettingsOptionProps<T extends string> = {
  label: string
  description: string
  value: T
  selectedValue: T
  onSelect: (value: T) => void
  position: 'left' | 'center' | 'right',
  icon: ComponentType<SvgProps>
  height: number
  width: number
}

export function SettingsOption<T extends string>({
  label,
  description,
  value,
  selectedValue,
  onSelect,
  position,
  icon: Icon,
  height,
  width
}: SettingsOptionProps<T>) {
  const isSelected = value === selectedValue
  const optionColors: Record<string, string> = {
    rent: generalColors.rentColor,
    sale: generalColors.saleColor,
    both: generalColors.general
  }

  const selectedColor = optionColors[value] ?? userColors.adviser.primary 
  return (
    <Pressable
      accessibilityState={{ checked: isSelected }}
      onPress={() => onSelect(value)}
      style={[
        styles.container,

        position === 'left' && styles.leftOption,
        position === 'center' && styles.centerOption,
        position === 'right' && styles.rightOption,

        isSelected && {backgroundColor: selectedColor},
      ]}
    >
      <View style={styles.containerIcons}>
        <Icon
        width={height}
        height={width}
          strokeWidth={.5}
          stroke={isSelected ? '#ffff' : '#CBB375'}/>
        <Text style={[styles.label, isSelected && styles.labelSelected]}>
          {label}
        </Text>
      </View>
    </Pressable>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    minHeight: 45,
    backgroundColor: generalColors.white,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 8,
    borderColor: '#ded6ca',
  },
  containerIcons:{
    flexDirection: 'row',
    alignItems: 'center',
    alignContent: 'center',
    gap: 5
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
    backgroundColor: userColors.coordinator.primary,
  },

  label: {
    color: '#b88b3d',
    fontSize: 11,
    lineHeight: 20,
    fontWeight: '600',
    textTransform: 'uppercase',
  },

  labelSelected: {
    color: '#ffffff',
  },
});
