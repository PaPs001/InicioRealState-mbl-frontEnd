import { Image, ScrollView, Text, TouchableOpacity, View } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useRouter } from 'expo-router'
import { ArrowRight } from 'lucide-react-native'

import LogoIRSPrincipal from '@/app/assets/logoIRSprincipal.svg'
import { registerOwnerStyles } from './styles'

const plantImage = require('../../../assets/register-owner-plant.png')
const lockImage = require('../../../assets/register-owner-lock.png')

export default function RegisterOwnerScreen() {
  const router = useRouter()

  return (
    <SafeAreaView style={registerOwnerStyles.safeArea} edges={['left', 'right', 'bottom']}>
      <View style={registerOwnerStyles.leftArchBack} />
      <View style={registerOwnerStyles.leftArchFront} />
      <View style={registerOwnerStyles.topRing} />
      <Image source={plantImage} style={registerOwnerStyles.plantImage} resizeMode="cover" />

      <ScrollView contentContainerStyle={registerOwnerStyles.scrollContent} showsVerticalScrollIndicator={false}>
        <View style={registerOwnerStyles.logoWrap}>
          <LogoIRSPrincipal width={146} height={48} />
        </View>

        <View style={registerOwnerStyles.titleBlock}>
          <Text style={registerOwnerStyles.title}>Acceso{'\n'}Propietario</Text>
          <View style={registerOwnerStyles.copyGroup}>
            <Text style={registerOwnerStyles.description}>
              Consulta tu portafolio, propiedades, arrendamientos activos y avances desde un solo lugar
            </Text>
            <Text style={registerOwnerStyles.description}>
              Diseñado para propietarios que tambien construyen patrimonio e inversion
            </Text>
          </View>
        </View>

        <View style={registerOwnerStyles.exclusiveCard}>
          <View style={registerOwnerStyles.exclusiveContent}>
            <View style={registerOwnerStyles.iconCircle}>
              <Image source={lockImage} style={registerOwnerStyles.lockImage} resizeMode="contain" />
            </View>
            <View style={registerOwnerStyles.exclusiveCopy}>
              <Text style={registerOwnerStyles.exclusiveTitle}>Acceso exclusivo</Text>
              <Text style={registerOwnerStyles.exclusiveText}>
                Solo para propietarios y propietarios con perfil inversionista
              </Text>
            </View>
          </View>
        </View>

        <View style={registerOwnerStyles.actions}>
          <TouchableOpacity
            style={registerOwnerStyles.primaryButton}
            onPress={() => router.push('/regSearcher/access')}
            activeOpacity={0.84}
          >
            <Text style={registerOwnerStyles.primaryButtonText}>Comenzar</Text>
            <ArrowRight size={23} color="#cfa84f" strokeWidth={1.7} />
          </TouchableOpacity>

          <TouchableOpacity
            style={registerOwnerStyles.secondaryButton}
            onPress={() => router.push('/register-new')}
            activeOpacity={0.84}
          >
            <Text style={registerOwnerStyles.secondaryButtonText}>Volver al inicio </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  )
}

