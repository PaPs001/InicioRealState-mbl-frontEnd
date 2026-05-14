import { useEffect, useRef } from 'react'
import { View, Text, StyleSheet, Animated, Easing } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { colors, spacing, typography, borderRadius } from '@/lib/theme'

export type RegisterTransitionVariant = 'pulse-orb' | 'soft-arrival'

type RegisterTransitionProps = {
  title?: string
  subtitle?: string
  durationMs?: number
  variant?: RegisterTransitionVariant
  orbColor?: string
  glowColor?: string
  onComplete?: () => void | Promise<void>
}

export default function RegisterTransition({
  title = 'Perfil listo',
  subtitle = 'Estamos preparando tu sesión de inversionista.',
  durationMs = 1900,
  variant = 'pulse-orb',
  orbColor = colors.accent,
  glowColor = '#efe4ca',
  onComplete,
}: RegisterTransitionProps) {
  const fadeAnim = useRef(new Animated.Value(0)).current
  const scaleAnim = useRef(new Animated.Value(0.92)).current
  const pulseAnim = useRef(new Animated.Value(1)).current

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 450,
        easing: Easing.out(Easing.ease),
        useNativeDriver: true,
      }),
      Animated.timing(scaleAnim, {
        toValue: 1,
        duration: 450,
        easing: Easing.out(Easing.back(1.2)),
        useNativeDriver: true,
      }),
    ]).start()

    const pulseLoop = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.06,
          duration: 900,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 900,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
      ])
    )

    pulseLoop.start()

    const timer = setTimeout(() => {
      void onComplete?.()
    }, durationMs)

    return () => {
      pulseLoop.stop()
      clearTimeout(timer)
    }
  }, [durationMs, fadeAnim, onComplete, pulseAnim, scaleAnim])

  return (
    <SafeAreaView style={styles.container}>
      <View style={[styles.backgroundGlow, { backgroundColor: glowColor }]} />
      <Animated.View
        style={[
          styles.card,
          {
            opacity: fadeAnim,
            transform: [{ scale: scaleAnim }],
          },
        ]}
      >
        <Animated.View
          style={[
            styles.orb,
            variant === 'soft-arrival' && styles.orbSoft,
            { backgroundColor: orbColor },
            {
              transform: [{ scale: pulseAnim }],
            },
          ]}
        />
        <Text style={styles.title}>{title}</Text>
        <Text style={styles.subtitle}>{subtitle}</Text>
      </Animated.View>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.lg,
  },
  backgroundGlow: {
    position: 'absolute',
    width: 260,
    height: 260,
    borderRadius: 999,
    backgroundColor: '#efe4ca',
    opacity: 0.55,
  },
  card: {
    width: '100%',
    maxWidth: 320,
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: borderRadius.xl,
    paddingVertical: spacing.xl,
    paddingHorizontal: spacing.lg,
    borderWidth: 1,
    borderColor: colors.border,
  },
  orb: {
    width: 88,
    height: 88,
    borderRadius: 44,
    marginBottom: spacing.lg,
  },
  orbSoft: {
    width: 72,
    height: 72,
    borderRadius: 36,
  },
  title: {
    color: colors.text,
    fontSize: typography.h2.fontSize,
    fontWeight: '700',
    marginBottom: spacing.sm,
  },
  subtitle: {
    color: colors.textSecondary,
    fontSize: typography.body.fontSize,
    textAlign: 'center',
    lineHeight: 24,
  },
})
