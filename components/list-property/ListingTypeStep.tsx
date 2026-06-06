import { Text, TouchableOpacity, View } from 'react-native'
import { Check } from 'lucide-react-native'

import type { ListingType } from './constants'
import { investorColors, styles } from './shared'

type ListingTypeStepProps = {
  listingType: ListingType | null
  onChange: (value: ListingType) => void
}

export function ListingTypeStep({ listingType, onChange }: ListingTypeStepProps) {
  return (
    <View style={styles.stepContent}>
      <Text style={styles.stepTitle}>Tipo de listado</Text>
      <Text style={styles.stepSubtitle}>¿Cómo deseas enlistar tu propiedad?</Text>

      <View style={styles.listingOptions}>
        <TouchableOpacity style={[styles.listingOption, listingType === 'sale' && styles.listingOptionSelected]} onPress={() => onChange('sale')}>
          {listingType === 'sale' ? (
            <View style={styles.checkIcon}>
              <Check size={16} color={investorColors.primary} />
            </View>
          ) : null}
          <Text style={[styles.listingOptionTitle, listingType === 'sale' && styles.listingOptionTitleSelected]}>Venta</Text>
          <Text style={styles.listingOptionDesc}>Quiero vender esta propiedad</Text>
        </TouchableOpacity>

        <TouchableOpacity style={[styles.listingOption, listingType === 'rent' && styles.listingOptionSelected]} onPress={() => onChange('rent')}>
          {listingType === 'rent' ? (
            <View style={styles.checkIcon}>
              <Check size={16} color={investorColors.primary} />
            </View>
          ) : null}
          <Text style={[styles.listingOptionTitle, listingType === 'rent' && styles.listingOptionTitleSelected]}>Renta</Text>
          <Text style={styles.listingOptionDesc}>Quiero rentar esta propiedad</Text>
        </TouchableOpacity>
      </View>
    </View>
  )
}
