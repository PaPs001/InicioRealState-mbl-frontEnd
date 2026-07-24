import { Text, TouchableOpacity, View } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { usePathname, useRouter } from 'expo-router'
import { Building2, ChevronLeft } from 'lucide-react-native'
import { styles } from './developments-soon.styles'

export default function CoordinatorDevelopmentsSoonScreen() {
  const router = useRouter()
  const pathname = usePathname()
  const routeBase = pathname.startsWith('/userAdviser') ? '/userAdviser' : '/userCoordinator'

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'bottom']}>
      <View style={styles.container}>
        <TouchableOpacity style={styles.backButton} activeOpacity={0.85} onPress={() => router.replace(`${routeBase}/properties` as never)}>
          <ChevronLeft size={25} color="#19191f" />
        </TouchableOpacity>

        <View style={styles.messageBlock}>
          <View style={styles.iconWrap}>
            <Building2 size={34} color="#0c6740" />
          </View>
          <Text style={styles.title}>Muy pronto</Text>
          <Text style={styles.subtitle}>El listado de desarrollos estara disponible mas adelante.</Text>
        </View>
      </View>

    </SafeAreaView>
  )
}
