import { StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native'

import type { PropertyCatalogItemResponse } from '@/lib/api/endpoints/catalog'
import { formatCurrency } from '@/lib/utils'
import { borderRadius, spacing, typography } from '@/lib/theme'
import { advisorTheme } from '../theme'

type InternalPriceStepProps = {
  customAmount: string
  priceOption: 'original' | 'min' | 'custom'
  selectedPropertyRaw: PropertyCatalogItemResponse | null
  transactionType: 'sale' | 'rent' | null
  onChangeCustomAmount: (value: string) => void
  onChangePriceOption: (value: 'original' | 'min' | 'custom') => void
}

export function InternalPriceStep({
  customAmount,
  priceOption,
  selectedPropertyRaw,
  transactionType,
  onChangeCustomAmount,
  onChangePriceOption,
}: InternalPriceStepProps) {
  return (
    <View style={styles.stepContent}>
      <Text style={styles.stepQuestion}>
        {transactionType === 'sale' ? 'Precio de venta acordado' : 'Renta mensual acordada'}
      </Text>

      {selectedPropertyRaw && (
        <View style={styles.selectedPropertyInfo}>
          <Text style={styles.selectedPropertyName}>{selectedPropertyRaw.name}</Text>
          <Text style={styles.selectedPropertyLocation}>{selectedPropertyRaw.zonaText}</Text>
        </View>
      )}

      <TouchableOpacity
        style={[styles.priceOptionCard, priceOption === 'original' && styles.priceOptionCardActive]}
        onPress={() => onChangePriceOption('original')}
      >
        <View style={styles.radioOuter}>
          {priceOption === 'original' && <View style={styles.radioInner} />}
        </View>
        <View style={styles.priceOptionInfo}>
          <Text style={styles.priceOptionLabel}>Precio Original</Text>
          <Text style={styles.priceOptionValue}>{formatCurrency(selectedPropertyRaw?.maxPrice || 0)}</Text>
        </View>
      </TouchableOpacity>

      {selectedPropertyRaw?.minPrice != null && selectedPropertyRaw.minPrice > 0 && (
        <TouchableOpacity
          style={[styles.priceOptionCard, priceOption === 'min' && styles.priceOptionCardActive]}
          onPress={() => onChangePriceOption('min')}
        >
          <View style={styles.radioOuter}>
            {priceOption === 'min' && <View style={styles.radioInner} />}
          </View>
          <View style={styles.priceOptionInfo}>
            <Text style={styles.priceOptionLabel}>Precio Minimo</Text>
            <Text style={styles.priceOptionValue}>{formatCurrency(selectedPropertyRaw.minPrice)}</Text>
          </View>
        </TouchableOpacity>
      )}

      <TouchableOpacity
        style={[styles.priceOptionCard, priceOption === 'custom' && styles.priceOptionCardActive]}
        onPress={() => onChangePriceOption('custom')}
      >
        <View style={styles.radioOuter}>
          {priceOption === 'custom' && <View style={styles.radioInner} />}
        </View>
        <View style={styles.priceOptionInfo}>
          <Text style={styles.priceOptionLabel}>Precio Personalizado</Text>
        </View>
      </TouchableOpacity>

      {priceOption === 'custom' && (
        <View style={styles.customPriceInput}>
          <Text style={styles.currencySymbol}>$</Text>
          <TextInput
            style={styles.priceInput}
            placeholder="0.00"
            placeholderTextColor={advisorTheme.textMuted}
            keyboardType="numeric"
            value={customAmount}
            onChangeText={onChangeCustomAmount}
          />
          <Text style={styles.currencyLabel}>MXN</Text>
        </View>
      )}
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
  selectedPropertyInfo: {
    backgroundColor: advisorTheme.surface,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    marginBottom: spacing.sm,
  },
  selectedPropertyName: {
    fontSize: typography.body.fontSize,
    fontWeight: '600',
    color: advisorTheme.text,
  },
  selectedPropertyLocation: {
    fontSize: typography.caption.fontSize,
    color: advisorTheme.textMuted,
    marginTop: 2,
  },
  priceOptionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: advisorTheme.surface,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    borderWidth: 2,
    borderColor: 'transparent',
    gap: spacing.md,
  },
  priceOptionCardActive: {
    borderColor: advisorTheme.accent,
    backgroundColor: advisorTheme.accent + '10',
  },
  radioOuter: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: advisorTheme.textMuted,
    justifyContent: 'center',
    alignItems: 'center',
  },
  radioInner: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: advisorTheme.accent,
  },
  priceOptionInfo: {
    flex: 1,
  },
  priceOptionLabel: {
    fontSize: typography.body.fontSize,
    color: advisorTheme.text,
  },
  priceOptionValue: {
    fontSize: typography.h4.fontSize,
    fontWeight: '700',
    color: advisorTheme.accent,
    marginTop: 2,
  },
  customPriceInput: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: advisorTheme.surface,
    borderRadius: borderRadius.md,
    paddingHorizontal: spacing.md,
    height: 56,
  },
  currencySymbol: {
    fontSize: typography.h4.fontSize,
    color: advisorTheme.textMuted,
    marginRight: spacing.xs,
  },
  priceInput: {
    flex: 1,
    fontSize: typography.h4.fontSize,
    color: advisorTheme.text,
  },
  currencyLabel: {
    fontSize: typography.body.fontSize,
    color: advisorTheme.textMuted,
  },
})
