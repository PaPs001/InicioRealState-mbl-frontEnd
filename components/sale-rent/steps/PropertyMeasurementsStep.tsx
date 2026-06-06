import { Text, TextInput, View } from 'react-native'

import { advisorTheme } from '../theme'
import { styles } from './shared'

type PropertyMeasurementsStepProps = {
  constructionArea: string
  propertyArea: string
  propertyLength: string
  propertyWidth: string
  setConstructionArea: (value: string) => void
  setPropertyArea: (value: string) => void
  setPropertyLength: (value: string) => void
  setPropertyWidth: (value: string) => void
}

export function PropertyMeasurementsStep(props: PropertyMeasurementsStepProps) {
  const { constructionArea, propertyArea, propertyLength, propertyWidth, setConstructionArea, setPropertyArea, setPropertyLength, setPropertyWidth } = props

  return (
    <View style={styles.stepContent}>
      <Text style={styles.stepQuestion}>Medidas del inmueble (opcional)</Text>

      <View style={styles.measurementsGrid}>
        <View style={styles.measurementItem}>
          <Text style={styles.measurementLabel}>Largo (m)</Text>
          <TextInput style={styles.measurementInput} placeholder="0" placeholderTextColor={advisorTheme.textMuted} keyboardType="numeric" value={propertyLength} onChangeText={setPropertyLength} />
        </View>
        <View style={styles.measurementItem}>
          <Text style={styles.measurementLabel}>Ancho (m)</Text>
          <TextInput style={styles.measurementInput} placeholder="0" placeholderTextColor={advisorTheme.textMuted} keyboardType="numeric" value={propertyWidth} onChangeText={setPropertyWidth} />
        </View>
        <View style={styles.measurementItem}>
          <Text style={styles.measurementLabel}>Area total (m2)</Text>
          <TextInput style={styles.measurementInput} placeholder="0" placeholderTextColor={advisorTheme.textMuted} keyboardType="numeric" value={propertyArea} onChangeText={setPropertyArea} />
        </View>
        <View style={styles.measurementItem}>
          <Text style={styles.measurementLabel}>Construccion (m2)</Text>
          <TextInput style={styles.measurementInput} placeholder="0" placeholderTextColor={advisorTheme.textMuted} keyboardType="numeric" value={constructionArea} onChangeText={setConstructionArea} />
        </View>
      </View>
    </View>
  )
}
