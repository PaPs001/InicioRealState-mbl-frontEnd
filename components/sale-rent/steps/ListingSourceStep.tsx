import { StyleSheet, Text, TouchableOpacity, View } from 'react-native'
import { Building2, Check, Users } from 'lucide-react-native'

import { borderRadius, spacing, typography } from '@/lib/theme'
import { advisorTheme } from '../theme'

type ListingSourceStepProps = {
  listingSource: 'internal' | 'external' | null
  onChange: (value: 'internal' | 'external') => void
}

export function ListingSourceStep({ listingSource, onChange }: ListingSourceStepProps) {
  return (
    <View style={styles.stepContent}>
      <Text style={styles.stepQuestion}>De donde proviene el inmueble?</Text>

      <TouchableOpacity
        style={[styles.optionCard, listingSource === 'internal' && styles.optionCardActive]}
        onPress={() => onChange('internal')}
      >
        <View style={styles.optionIcon}>
          <Building2 size={32} color={listingSource === 'internal' ? advisorTheme.accent : advisorTheme.textMuted} />
        </View>
        <View style={styles.optionInfo}>
          <Text style={[styles.optionTitle, listingSource === 'internal' && styles.optionTitleActive]}>Listado Interno</Text>
          <Text style={styles.optionDescription}>Propiedad del catálogo de Inicio Real Estate</Text>
        </View>
        {listingSource === 'internal' && <Check size={24} color={advisorTheme.accent} />}
      </TouchableOpacity>

      <TouchableOpacity
        style={[styles.optionCard, listingSource === 'external' && styles.optionCardActive]}
        onPress={() => onChange('external')}
      >
        <View style={styles.optionIcon}>
          <Users size={32} color={listingSource === 'external' ? advisorTheme.accent : advisorTheme.textMuted} />
        </View>
        <View style={styles.optionInfo}>
          <Text style={[styles.optionTitle, listingSource === 'external' && styles.optionTitleActive]}>Listado Externo</Text>
          <Text style={styles.optionDescription}>Propiedad de otra inmobiliaria o particular</Text>
        </View>
        {listingSource === 'external' && <Check size={24} color={advisorTheme.accent} />}
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
