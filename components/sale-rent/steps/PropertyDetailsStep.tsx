import { Text, TextInput, TouchableOpacity, View } from 'react-native'
import { Bath, BedDouble, Car, Check } from 'lucide-react-native'

import { advisorTheme } from '../theme'
import { styles } from './shared'

type PropertyDetailsStepProps = {
  bathrooms: string
  bedrooms: string
  halfBaths: string
  isFullyEquipped: boolean
  isFurnished: boolean
  parking: string
  setBathrooms: (value: string) => void
  setBedrooms: (value: string) => void
  setHalfBaths: (value: string) => void
  setIsFullyEquipped: (value: boolean) => void
  setIsFurnished: (value: boolean) => void
  setParking: (value: string) => void
}

export function PropertyDetailsStep(props: PropertyDetailsStepProps) {
  const {
    bathrooms,
    bedrooms,
    halfBaths,
    isFullyEquipped,
    isFurnished,
    parking,
    setBathrooms,
    setBedrooms,
    setHalfBaths,
    setIsFullyEquipped,
    setIsFurnished,
    setParking,
  } = props

  return (
    <View style={styles.stepContent}>
      <Text style={styles.stepQuestion}>Detalles del inmueble</Text>

      <View style={styles.detailsGrid}>
        <View style={styles.detailItem}>
          <BedDouble size={20} color={advisorTheme.accent} />
          <Text style={styles.detailLabel}>Recámaras *</Text>
          <TextInput style={styles.detailInput} placeholder="0" placeholderTextColor={advisorTheme.textMuted} keyboardType="numeric" value={bedrooms} onChangeText={setBedrooms} />
        </View>

        <View style={styles.detailItem}>
          <Bath size={20} color={advisorTheme.accent} />
          <Text style={styles.detailLabel}>Baños *</Text>
          <TextInput style={styles.detailInput} placeholder="0" placeholderTextColor={advisorTheme.textMuted} keyboardType="numeric" value={bathrooms} onChangeText={setBathrooms} />
        </View>

        <View style={styles.detailItem}>
          <Bath size={20} color={advisorTheme.textMuted} />
          <Text style={styles.detailLabel}>Medios baños</Text>
          <TextInput style={styles.detailInput} placeholder="0" placeholderTextColor={advisorTheme.textMuted} keyboardType="numeric" value={halfBaths} onChangeText={setHalfBaths} />
        </View>

        <View style={styles.detailItem}>
          <Car size={20} color={advisorTheme.accent} />
          <Text style={styles.detailLabel}>Estacionamientos</Text>
          <TextInput style={styles.detailInput} placeholder="0" placeholderTextColor={advisorTheme.textMuted} keyboardType="numeric" value={parking} onChangeText={setParking} />
        </View>
      </View>

      <View style={styles.togglesContainer}>
        <TouchableOpacity style={[styles.toggleOption, isFullyEquipped && styles.toggleOptionActive]} onPress={() => setIsFullyEquipped(!isFullyEquipped)}>
          <View style={[styles.checkbox, isFullyEquipped && styles.checkboxActive]}>
            {isFullyEquipped ? <Check size={14} color={advisorTheme.background} /> : null}
          </View>
          <Text style={styles.toggleLabel}>Totalmente equipada</Text>
        </TouchableOpacity>

        <TouchableOpacity style={[styles.toggleOption, isFurnished && styles.toggleOptionActive]} onPress={() => setIsFurnished(!isFurnished)}>
          <View style={[styles.checkbox, isFurnished && styles.checkboxActive]}>
            {isFurnished ? <Check size={14} color={advisorTheme.background} /> : null}
          </View>
          <Text style={styles.toggleLabel}>Amueblada</Text>
        </TouchableOpacity>
      </View>
    </View>
  )
}
