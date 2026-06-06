import { Text, TextInput, TouchableOpacity, View } from 'react-native'
import { Check } from 'lucide-react-native'

import { advisorTheme } from '../theme'
import { styles } from './shared'

type PropertyPricingStepProps = {
  currency: 'MXN' | 'USD'
  isNegotiable: boolean
  maintenanceCost: string
  propertyPrice: string
  setCurrency: (value: 'MXN' | 'USD') => void
  setIsNegotiable: (value: boolean) => void
  setMaintenanceCost: (value: string) => void
  setPropertyPrice: (value: string) => void
  transactionType: 'sale' | 'rent' | null
}

export function PropertyPricingStep(props: PropertyPricingStepProps) {
  const { currency, isNegotiable, maintenanceCost, propertyPrice, setCurrency, setIsNegotiable, setMaintenanceCost, setPropertyPrice, transactionType } = props

  return (
    <View style={styles.stepContent}>
      <Text style={styles.stepQuestion}>{transactionType === 'sale' ? 'Precio de venta' : 'Renta mensual'}</Text>

      <View style={styles.inputGroup}>
        <Text style={styles.inputLabel}>Precio *</Text>
        <View style={styles.priceInputContainer}>
          <Text style={styles.currencySymbol}>$</Text>
          <TextInput style={styles.priceInputLarge} placeholder="0.00" placeholderTextColor={advisorTheme.textMuted} keyboardType="numeric" value={propertyPrice} onChangeText={setPropertyPrice} />
          <View style={styles.currencyToggle}>
            <TouchableOpacity style={[styles.currencyBtn, currency === 'MXN' && styles.currencyBtnActive]} onPress={() => setCurrency('MXN')}>
              <Text style={[styles.currencyBtnText, currency === 'MXN' && styles.currencyBtnTextActive]}>MXN</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.currencyBtn, currency === 'USD' && styles.currencyBtnActive]} onPress={() => setCurrency('USD')}>
              <Text style={[styles.currencyBtnText, currency === 'USD' && styles.currencyBtnTextActive]}>USD</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>

      <View style={styles.inputGroup}>
        <Text style={styles.inputLabel}>Mantenimiento mensual (opcional)</Text>
        <View style={styles.inputBox}>
          <Text style={styles.inputPrefix}>$</Text>
          <TextInput style={styles.inputField} placeholder="0.00" placeholderTextColor={advisorTheme.textMuted} keyboardType="numeric" value={maintenanceCost} onChangeText={setMaintenanceCost} />
        </View>
      </View>

      <TouchableOpacity style={[styles.toggleOption, isNegotiable && styles.toggleOptionActive]} onPress={() => setIsNegotiable(!isNegotiable)}>
        <View style={[styles.checkbox, isNegotiable && styles.checkboxActive]}>
          {isNegotiable ? <Check size={14} color={advisorTheme.background} /> : null}
        </View>
        <Text style={styles.toggleLabel}>Precio negociable</Text>
      </TouchableOpacity>
    </View>
  )
}
