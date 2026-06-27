import { ScrollView, Text, TouchableOpacity, View } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useRouter } from 'expo-router'
import { ArrowLeft, ChevronRight } from 'lucide-react-native'

import LogoIRSPrincipal from '@/app/assets/logoIRSprincipal.svg'
import { getRegisterEntryRoute, registerEntryOptions, type RegisterClientType } from '@/lib/services/register-entry'
import { registerNewStyles } from './register-new.styles'

export default function RegisterNewScreen() {
  const router = useRouter()

  const handleSelectUserType = (clientType: RegisterClientType) => {
    router.push(getRegisterEntryRoute(clientType))
  }

  return (
    <SafeAreaView style={registerNewStyles.safeArea} edges={['left', 'right', 'bottom']}>
      <ScrollView contentContainerStyle={registerNewStyles.scrollContent} showsVerticalScrollIndicator={false}>
        <View style={registerNewStyles.topBar}>
          <TouchableOpacity
            style={registerNewStyles.backButton}
            onPress={() => router.push('/(auth)/login-new')}
            activeOpacity={0.84}
            accessibilityRole="button"
            accessibilityLabel="Volver a la pantalla anterior "
          >
            <ArrowLeft size={20} color="#204c31" strokeWidth={1.8} />
            <Text style={registerNewStyles.backButtonText}>Volver </Text>
          </TouchableOpacity>

          <View style={registerNewStyles.logo}>
            <LogoIRSPrincipal width={146} height={48} />
          </View>
        </View>

        <View style={registerNewStyles.header}>
          <Text style={registerNewStyles.title}>Elige tu tipo de usuario</Text>
          <Text style={registerNewStyles.subtitle}>Personalizaremos tu experiencia segun tu perfil</Text>
        </View>

        <View style={registerNewStyles.options}>
          {registerEntryOptions.map((option) => (
            <TouchableOpacity
              key={option.id}
              style={registerNewStyles.optionCard}
              onPress={() => handleSelectUserType(option.id)}
              activeOpacity={0.84}
            >
              <View style={registerNewStyles.optionDot} />
              <View style={registerNewStyles.optionCopy}>
                <Text style={registerNewStyles.optionTitle}>{option.title}</Text>
                <Text style={registerNewStyles.optionDescription}>{option.description}</Text>
              </View>
              <View style={registerNewStyles.optionArrow}>
                <ChevronRight size={31} color="#bf8638" strokeWidth={1.1} />
              </View>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  )
}
