import React, { useState } from 'react'
import { View, Text, ScrollView, TouchableOpacity, StyleSheet } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useRouter } from 'expo-router'
import { ArrowLeft, RotateCcw } from 'lucide-react-native'
import AnimatedLogo, { AnimationVariant } from '@/app/components/Animations/AnimatedLogo'
import { colors, spacing, typography, borderRadius } from '@/lib/theme'

const variants: { name: AnimationVariant; description: string }[] = [
  { name: 'pulse', description: 'Pulso suave que agranda y reduce' },
  { name: 'breathe', description: 'Respiracion lenta y elegante' },
  { name: 'fade-in', description: 'Aparicion con fade y escala' },
  { name: 'scale-bounce', description: 'Rebote al aparecer (spring)' },
  { name: 'rotate-gentle', description: 'Rotacion suave de lado a lado' },
  { name: 'shimmer', description: 'Efecto de brillo/destello' },
]

export default function AnimationDemoScreen() {
  const router = useRouter()
  const [key, setKey] = useState(0)

  const resetAnimations = () => {
    setKey(prev => prev + 1)
  }

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <ArrowLeft size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Animaciones de Logo</Text>
        <TouchableOpacity style={styles.resetButton} onPress={resetAnimations}>
          <RotateCcw size={20} color={colors.accent} />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content} contentContainerStyle={styles.scrollContent}>
        <Text style={styles.subtitle}>
          Toca el boton de reinicio para ver las animaciones de nuevo
        </Text>

        {/* Grid de animaciones */}
        <View style={styles.grid}>
          {variants.map((variant) => (
            <View key={`${variant.name}-${key}`} style={styles.card}>
              <View style={styles.logoContainer}>
                <AnimatedLogo
                  variant={variant.name}
                  width={100}
                  height={35}
                  loop={variant.name === 'pulse' || variant.name === 'breathe' || variant.name === 'rotate-gentle' || variant.name === 'shimmer'}
                />
              </View>
              <Text style={styles.variantName}>{variant.name}</Text>
              <Text style={styles.variantDesc}>{variant.description}</Text>
            </View>
          ))}
        </View>

        {/* Ejemplo de uso */}
        <View style={styles.codeSection}>
          <Text style={styles.codeSectionTitle}>Ejemplo de uso:</Text>
          <View style={styles.codeBlock}>
            <Text style={styles.codeText}>
              {`import AnimatedLogo from '@/app/components/Animations/AnimatedLogo'

// Uso basico
<AnimatedLogo />

// Con variante
<AnimatedLogo variant="breathe" />

// Personalizado
<AnimatedLogo 
  variant="fade-in" 
  width={150} 
  height={50}
  duration={800}
  loop={false}
/>`}
            </Text>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: borderRadius.full,
    backgroundColor: colors.surface,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: typography.h4.fontSize,
    fontWeight: '600',
    color: colors.text,
  },
  resetButton: {
    width: 40,
    height: 40,
    borderRadius: borderRadius.full,
    backgroundColor: colors.accent + '20',
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    flex: 1,
  },
  scrollContent: {
    padding: spacing.md,
    paddingBottom: spacing.xxl,
  },
  subtitle: {
    fontSize: typography.body.fontSize,
    color: colors.textSecondary,
    textAlign: 'center',
    marginBottom: spacing.lg,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.md,
  },
  card: {
    width: '47%',
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
  },
  logoContainer: {
    height: 60,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  variantName: {
    fontSize: typography.body.fontSize,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 4,
  },
  variantDesc: {
    fontSize: typography.caption.fontSize,
    color: colors.textMuted,
    textAlign: 'center',
  },
  codeSection: {
    marginTop: spacing.xl,
  },
  codeSectionTitle: {
    fontSize: typography.body.fontSize,
    fontWeight: '600',
    color: colors.text,
    marginBottom: spacing.sm,
  },
  codeBlock: {
    backgroundColor: colors.primaryDark,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
  },
  codeText: {
    fontSize: 12,
    fontFamily: 'monospace',
    color: colors.textLight,
    lineHeight: 20,
  },
})
