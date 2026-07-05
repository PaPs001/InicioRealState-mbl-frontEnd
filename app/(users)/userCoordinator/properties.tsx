import { Text, TouchableOpacity, View } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { usePathname, useRouter } from 'expo-router'
import { Building2, ChevronLeft } from 'lucide-react-native'
import { styles } from './properties.styles'

export default function CoordinatorPropertiesScreen() {
  const router = useRouter()
  const pathname = usePathname()
  const routeBase = pathname.startsWith('/userAdviser') ? '/userAdviser' : '/userCoordinator'

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'bottom']}>
      <View style={styles.container}>
        <Text style={styles.title}>Propiedades</Text>
        <Text style={styles.subtitle}>Consulta el inventario completo y filtra por operacion</Text>

        <View style={styles.options}>
          <PropertyOption
            icon={<Building2 size={24} color="#0c6740" />}
            title="Venta y Renta"
            description="Todo el inventario de renta y venta"
            onPress={() => router.push(`${routeBase}/properties-list` as never)}
          />
          <PropertyOption
            icon={<Building2 size={24} color="#0c6740" />}
            title="Desarrollos"
            description="Proyectos y preventas"
            onPress={() => router.push(`${routeBase}/developments-soon` as never)}
          />
        </View>
      </View>

    </SafeAreaView>
  )
}

function PropertyOption({
  icon,
  title,
  description,
  onPress,
}: {
  icon: React.ReactNode
  title: string
  description: string
  onPress: () => void
}) {
  return (
    <TouchableOpacity style={styles.optionCard} activeOpacity={0.86} onPress={onPress}>
      <View style={styles.optionIcon}>{icon}</View>
      <View style={styles.optionText}>
        <Text style={styles.optionTitle}>{title}</Text>
        <Text style={styles.optionDescription}>{description}</Text>
      </View>
    </TouchableOpacity>
  )
}
