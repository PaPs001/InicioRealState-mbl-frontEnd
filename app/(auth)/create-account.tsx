import { useState } from 'react'
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
} from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useRouter } from 'expo-router'
import { colors, spacing, typography, borderRadius, shadows } from '@/lib/theme'
import { ArrowLeft, BriefcaseBusiness, Building2, House, KeyRound } from 'lucide-react-native'

type ClientType = 'owner' | 'renter' | 'tenant' | 'advisor'

const clientTypeOptions: Array<{
  value: ClientType
  title: string
  description: string
  icon: typeof Building2
}> = [
  {
    value: 'owner',
    title: 'Ya tiene propiedad',
    description: 'Tiene una propiedad y quiere explorar sus opciones.',
    icon: House,
  },
  {
    value: 'renter',
    title: 'Está rentando',
    description: 'Busca apoyo para una renta o seguimiento de su proceso.',
    icon: KeyRound,
  },
  {
    value: 'tenant',
    title: 'Busca propiedad',
    description: 'Quiere comprar o encontrar una propiedad disponible.',
    icon: Building2,
  },
  {
    value: 'advisor',
    title: 'Es asesor',
    description: 'Accederá al flujo pensado para asesores inmobiliarios.',
    icon: BriefcaseBusiness,
  },
]

export default function CreateAccountScreen() {
  const router = useRouter()
  const [selectedClientType, setSelectedClientType] = useState<ClientType | null>(null)

  const handleContinue = () => {
    if (!selectedClientType) {
      return
    }

    //console.log('[create-account] tipo enviado:', selectedClientType)
    //Alert.alert('Debug', `Tipo enviado: ${selectedClientType}`)

    router.push(`/register?clientType=${selectedClientType}`)
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <ArrowLeft size={20} color={colors.accent} />
          <Text style={styles.backButtonText}>regresar </Text>
        </TouchableOpacity>

        <View style={styles.header}>
          <Text style={styles.eyebrow}>Crear cuenta</Text>
          <Text style={styles.title}>¿Qué tipo de cliente eres?</Text>
          <Text style={styles.subtitle}>
            Selecciona la opción que mejor describa tu perfil para continuar con el registro.
          </Text>
        </View>

        <View style={styles.optionsContainer}>
          {clientTypeOptions.map((option) => {
            const Icon = option.icon
            const isSelected = selectedClientType === option.value

            return (
              <TouchableOpacity
                key={option.value}
                style={[styles.optionCard, isSelected && styles.optionCardSelected]}
                onPress={() => setSelectedClientType(option.value)}
                activeOpacity={0.85}
              >
                <View style={[styles.iconWrapper, isSelected && styles.iconWrapperSelected]}>
                  <Icon size={22} color={isSelected ? colors.primaryDark : colors.accent} />
                </View>

                <View style={styles.optionContent}>
                  <Text style={[styles.optionTitle, isSelected && styles.optionTitleSelected]}>
                    {option.title}
                  </Text>
                  <Text style={styles.optionDescription}>{option.description}</Text>
                </View>

                <View style={[styles.radioOuter, isSelected && styles.radioOuterSelected]}>
                  {isSelected && <View style={styles.radioInner} />}
                </View>
              </TouchableOpacity>
            )
          })}
        </View>
        {/*<Text style={styles.debugText}>
          Seleccionado: {selectedClientType ?? 'ninguno'}
        </Text>*/}
        <TouchableOpacity style={[
            styles.continueButton,
            !selectedClientType && styles.continueButtonDisabled,
          ]}
          disabled={!selectedClientType}
          onPress={handleContinue}
        >
          <Text style={styles.textContinueButton}>
            Continuar
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  textContinueButton: {
    fontSize: typography.body.fontSize,
    fontWeight: '700',
    color: colors.primaryDark,
    textAlign: 'center',
  },
  continueButton: {
    alignSelf: 'center',
    marginTop: spacing.xl,
    backgroundColor: colors.accent,
    paddingVertical: spacing.sm,
    width: '50%',
    borderRadius: borderRadius.xl,
  },
  continueButtonDisabled: {
    opacity: 0.45,
  },
  debugText: {
    marginTop: spacing.lg,
    color: colors.textMuted,
    fontSize: typography.bodySmall.fontSize,
    textAlign: 'center',
  },
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scrollContent: {
    padding: spacing.lg,
    paddingBottom: spacing.xl,
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginBottom: spacing.xl,
  },
  backButtonText: {
    color: colors.accent,
    fontSize: typography.bodySmall.fontSize,
  },
  header: {
    marginBottom: spacing.xl,
  },
  eyebrow: {
    color: colors.primary,
    fontSize: typography.caption.fontSize,
    fontWeight: '700',
    letterSpacing: 1,
    marginBottom: spacing.sm,
    textTransform: 'uppercase',
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
    lineHeight: 22,
  },
  optionsContainer: {
    gap: spacing.md,
  },
  optionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: borderRadius.xl,
    padding: spacing.lg,
    gap: spacing.md,
    ...shadows.md,
  },
  optionCardSelected: {
    borderColor: colors.accent,
    backgroundColor: '#f6efe1',
  },
  iconWrapper: {
    width: 48,
    height: 48,
    borderRadius: borderRadius.lg,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconWrapperSelected: {
    backgroundColor: colors.accent,
  },
  optionContent: {
    flex: 1,
  },
  optionTitle: {
    color: colors.text,
    fontSize: typography.body.fontSize,
    fontWeight: '700',
    marginBottom: spacing.xs,
  },
  optionTitleSelected: {
    color: colors.primary,
  },
  optionDescription: {
    color: colors.textSecondary,
    fontSize: typography.bodySmall.fontSize,
    lineHeight: 20,
  },
  radioOuter: {
    width: 22,
    height: 22,
    borderRadius: borderRadius.full,
    borderWidth: 2,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  radioOuterSelected: {
    borderColor: colors.accent,
  },
  radioInner: {
    width: 10,
    height: 10,
    borderRadius: borderRadius.full,
    backgroundColor: colors.accent,
  },
})
