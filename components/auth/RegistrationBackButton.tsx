import { StyleSheet, TouchableOpacity, type ViewStyle } from 'react-native'
import { useRouter } from 'expo-router'
import { ArrowLeft } from 'lucide-react-native'

type RegistrationBackButtonProps = {
  style?: ViewStyle
}

export function RegistrationBackButton({ style }: RegistrationBackButtonProps) {
  const router = useRouter()

  return (
    <TouchableOpacity
      style={[styles.button, style]}
      onPress={() => router.back()}
      activeOpacity={0.82}
      accessibilityRole="button"
      accessibilityLabel="Volver"
    >
      <ArrowLeft size={23} color="#064936" strokeWidth={1.8} />
    </TouchableOpacity>
  )
}

const styles = StyleSheet.create({
  button: {
    position: 'absolute',
    top: 18,
    left: 18,
    zIndex: 20,
    width: 42,
    height: 42,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 21,
    backgroundColor: 'rgba(255, 253, 249, 0.92)',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.12,
    shadowRadius: 6,
    elevation: 3,
  },
})
