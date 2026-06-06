import { StyleSheet, Text, TouchableOpacity, View } from 'react-native'
import { Check, DollarSign, Home } from 'lucide-react-native'

import { borderRadius, spacing, typography } from '@/lib/theme'
import { advisorTheme } from '../theme'

type TransactionTypeStepProps = {
  transactionType: 'sale' | 'rent' | null
  onChange: (value: 'sale' | 'rent') => void
}

export function TransactionTypeStep({ transactionType, onChange }: TransactionTypeStepProps) {
  return (
    <View style={styles.stepContent}>
      <Text style={styles.stepQuestion}>¿Qué tipo de transacción deseas registrar?</Text>

      <TouchableOpacity
        style={[styles.optionCard, transactionType === 'sale' && styles.optionCardActive]}
        onPress={() => onChange('sale')}
      >
        <View style={styles.optionIcon}>
          <DollarSign size={32} color={transactionType === 'sale' ? advisorTheme.accent : advisorTheme.textMuted} />
        </View>
        <View style={styles.optionInfo}>
          <Text style={[styles.optionTitle, transactionType === 'sale' && styles.optionTitleActive]}>Venta</Text>
          <Text style={styles.optionDescription}>Registrar una venta de propiedad</Text>
        </View>
        {transactionType === 'sale' && <Check size={24} color={advisorTheme.accent} />}
      </TouchableOpacity>

      <TouchableOpacity
        style={[styles.optionCard, transactionType === 'rent' && styles.optionCardActive]}
        onPress={() => onChange('rent')}
      >
        <View style={styles.optionIcon}>
          <Home size={32} color={transactionType === 'rent' ? advisorTheme.accent : advisorTheme.textMuted} />
        </View>
        <View style={styles.optionInfo}>
          <Text style={[styles.optionTitle, transactionType === 'rent' && styles.optionTitleActive]}>Renta</Text>
          <Text style={styles.optionDescription}>Registrar una renta de propiedad</Text>
        </View>
        {transactionType === 'rent' && <Check size={24} color={advisorTheme.accent} />}
      </TouchableOpacity>
    </View>
  )
}

const styles = StyleSheet.create({
  stepContent: {
    gap: spacing.md,
  },
  stepQuestion: {
    fontSize: typography.h3.fontSize,
    fontWeight: '700',
    color: advisorTheme.text,
    marginBottom: spacing.sm,
  },
  optionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: advisorTheme.surface,
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    borderWidth: 2,
    borderColor: 'transparent',
    gap: spacing.md,
  },
  optionCardActive: {
    borderColor: advisorTheme.accent,
    backgroundColor: advisorTheme.accent + '10',
  },
  optionIcon: {
    width: 56,
    height: 56,
    borderRadius: borderRadius.md,
    backgroundColor: advisorTheme.surfaceLight,
    justifyContent: 'center',
    alignItems: 'center',
  },
  optionInfo: {
    flex: 1,
  },
  optionTitle: {
    fontSize: typography.body.fontSize,
    fontWeight: '600',
    color: advisorTheme.text,
  },
  optionTitleActive: {
    color: advisorTheme.accent,
  },
  optionDescription: {
    fontSize: typography.caption.fontSize,
    color: advisorTheme.textMuted,
    marginTop: 2,
  },
})
