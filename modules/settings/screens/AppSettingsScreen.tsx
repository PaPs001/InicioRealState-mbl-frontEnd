import { ScrollView, StyleSheet, Text, View } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'

import { SettingsOption } from '../components/SettingsOption'
import { useAppSettings } from '../hooks'
import type { OperationMode } from '../types'

const operationOptions: Array<{
  value: OperationMode
  label: string
  description: string
}> = [
  { value: 'both', label: 'Renta y venta', description: 'Muestra todas las funciones e inventario.' },
  { value: 'rent', label: 'Solamente renta', description: 'Prioriza rentas y sus seguimientos.' },
  { value: 'sale', label: 'Solamente venta', description: 'Prioriza ventas y oportunidades.' },
]

export function AppSettingsScreen() {
  const {
    operationMode,
    setOperationMode,
  } = useAppSettings()

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.title}>Configuración</Text>
        <Text style={styles.intro}>
          Estas preferencias se guardan de manera independiente para tu usuario.
        </Text>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Modo de operación</Text>
          <Text style={styles.sectionDescription}>
            Define qué funciones de negocio aparecen en la aplicación.
          </Text>
          <View accessibilityRole="radiogroup" style={styles.options}>
            {operationOptions.map(option => (
              <SettingsOption
                key={option.value}
                {...option}
                selectedValue={operationMode}
                onSelect={setOperationMode}
              />
            ))}
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  )
}

export default AppSettingsScreen

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#f5f1ec',
  },
  content: {
    width: '100%',
    maxWidth: 640,
    alignSelf: 'center',
    paddingHorizontal: 20,
    paddingTop: 24,
    paddingBottom: 48,
  },
  title: {
    color: '#1e2d32',
    fontSize: 28,
    lineHeight: 34,
    fontWeight: '700',
  },
  intro: {
    color: '#6b7280',
    marginTop: 8,
    fontSize: 14,
    lineHeight: 20,
  },
  section: {
    marginTop: 32,
  },
  sectionTitle: {
    color: '#1e2d32',
    fontSize: 18,
    lineHeight: 24,
    fontWeight: '700',
  },
  sectionDescription: {
    color: '#6b7280',
    marginTop: 4,
    fontSize: 13,
    lineHeight: 18,
  },
  options: {
    marginTop: 14,
    gap: 10,
  },
})
