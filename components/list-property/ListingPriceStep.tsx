import { Text, TextInput, View } from 'react-native'
import { DollarSign } from 'lucide-react-native'

import type { ListingType } from './constants'
import { investorColors, styles } from './shared'
import { formatCurrency } from '@/lib/utils'

type ListingPriceStepProps = {
  listingType: ListingType | null
  price: string
  propertyCurrentValue?: number | null
  onChangePrice: (value: string) => void
}

export function ListingPriceStep({ listingType, price, propertyCurrentValue, onChangePrice }: ListingPriceStepProps) {
  return (
    <View style={styles.stepContent}>
      <Text style={styles.stepTitle}>{listingType === 'sale' ? 'Precio de venta' : 'Renta mensual'}</Text>
      <Text style={styles.stepSubtitle}>
        {listingType === 'sale'
          ? 'Define el precio al que quieres vender tu propiedad'
          : 'Define la renta mensual que deseas cobrar'}
      </Text>

      <View style={styles.formGroup}>
        <Text style={styles.inputLabel}>{listingType === 'sale' ? 'Precio de venta' : 'Renta mensual'}</Text>
        <View style={styles.inputWithIcon}>
          <DollarSign size={20} color={investorColors.textMuted} />
          <TextInput
            style={styles.inputInner}
            placeholder="0.00"
            placeholderTextColor={investorColors.textMuted}
            keyboardType="numeric"
            value={price}
            onChangeText={onChangePrice}
          />
          <Text style={styles.inputSuffix}>{listingType === 'sale' ? 'MXN' : 'MXN/mes'}</Text>
        </View>
      </View>

      {propertyCurrentValue ? (
        <View style={styles.suggestionCard}>
          <Text style={styles.suggestionLabel}>Valor estimado actual:</Text>
          <Text style={styles.suggestionValue}>{formatCurrency(propertyCurrentValue)}</Text>
        </View>
      ) : null}
    </View>
  )
}
