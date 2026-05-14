import { View, StyleSheet } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useLocalSearchParams } from 'expo-router'
import { colors } from '@/lib/theme'
import OwnerForm from './components/forms/OwnerForm'
import RenterForm from './components/forms/RenterForm'
import AsesorForm from './components/forms/AsesorForm'
import CompradorForm from './components/forms/CompradorForm'

export default function RegisterScreen() {
  const { clientType } = useLocalSearchParams<{ clientType?: string }>()

  const renderForm = () => {
    switch (clientType) {
      case 'owner':
        return <OwnerForm />
      case 'renter':
        return <RenterForm />
      case 'advisor':
        return <AsesorForm />
      case 'tenant':
        return <CompradorForm />
      default:
        return <View style={styles.fallback} />
    }
  }

  return (
    <SafeAreaView style={styles.container}>
      {renderForm()}
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  fallback: {
    flex: 1,
    backgroundColor: colors.background,
  },
})
