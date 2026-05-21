import React from 'react'
import { View, ActivityIndicator, StyleSheet, ViewStyle } from 'react-native'
import { colors } from '@/lib/theme'

export interface LoadingProps {
  /** Tamano del indicador */
  size?: 'small' | 'large'
  /** Color del indicador */
  color?: string
  /** Si debe ocupar todo el contenedor */
  fullScreen?: boolean
  /** Estilo adicional */
  style?: ViewStyle
}

export function Loading({
  size = 'large',
  color = colors.accent,
  fullScreen = false,
  style,
}: LoadingProps) {
  if (fullScreen) {
    return (
      <View style={[styles.fullScreen, style]}>
        <ActivityIndicator size={size} color={color} />
      </View>
    )
  }

  return (
    <View style={[styles.container, style]}>
      <ActivityIndicator size={size} color={color} />
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    padding: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  fullScreen: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
})

export default Loading
