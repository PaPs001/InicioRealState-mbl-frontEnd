import { ImageBackground, ScrollView, Text, TouchableOpacity, View, type ImageSourcePropType } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useRouter } from 'expo-router'
import { LinearGradient } from 'expo-linear-gradient'

import LogoIRSPrincipal from '@/app/assets/logoIRSprincipal.svg'
import { RegistrationBackButton } from '@/components/auth/RegistrationBackButton'
import { getRegisterEntryRoute, registerEntryOptions, type RegisterClientType } from '@/lib/services/register-entry'
import { registerNewStyles } from './register-new.styles'

const optionImages: Record<RegisterClientType, ImageSourcePropType> = {
  tenant: require('../../assets/login-new-hero.png'),
  owner: require('../../assets/login-new-hero.png'),
  renter: require('../../assets/login-new-hero.png'),
  advisor: require('../../assets/register-owner-welcome-team.png'),
}

const optionDisplayText: Partial<Record<RegisterClientType, { title: string; description: string }>> = {
  advisor: {
    title: 'Equipo INICIO',
    description: 'Asesores, coordinacion y ventas',
  },
}

const optionOrder: RegisterClientType[] = ['tenant', 'owner', 'renter', 'advisor']

export default function RegisterNewScreen() {
  const router = useRouter()
  const orderedOptions = optionOrder
    .map((id) => registerEntryOptions.find((option) => option.id === id))
    .filter((option): option is (typeof registerEntryOptions)[number] => Boolean(option))

  const handleSelectUserType = (clientType: RegisterClientType) => {
    router.push(getRegisterEntryRoute(clientType))
  }

  return (
    <SafeAreaView style={registerNewStyles.safeArea} edges={['left', 'right', 'bottom']}>
      <RegistrationBackButton />
      <ScrollView contentContainerStyle={registerNewStyles.scrollContent} showsVerticalScrollIndicator={false}>
        <View style={registerNewStyles.logo}>
          <LogoIRSPrincipal width={146} height={48} />
        </View>

        <View style={registerNewStyles.header}>
          <Text style={registerNewStyles.title}>Elige tu tipo de usuario</Text>
          <Text style={registerNewStyles.subtitle}>
            Personalizaremos tu experiencia segun tu perfil
          </Text>
        </View>

        <View style={registerNewStyles.options}>
          {orderedOptions.map((option) => {
            const displayText = optionDisplayText[option.id] ?? option

            return (
              <TouchableOpacity
                key={option.id}
                style={registerNewStyles.optionCard}
                onPress={() => handleSelectUserType(option.id)}
                activeOpacity={0.84}
              >
                <View style={registerNewStyles.optionCopy}>
                  <Text style={registerNewStyles.optionTitle}>{displayText.title}</Text>
                  <Text style={registerNewStyles.optionDescription}>{displayText.description}</Text>
                </View>
                <ImageBackground
                  source={optionImages[option.id]}
                  style={registerNewStyles.optionImage}
                  imageStyle={registerNewStyles.optionImageInner}
                  resizeMode="cover"
                >
                  <LinearGradient
                    colors={['#fffdf9', 'rgba(255,253,249,0.65)', 'rgba(255, 253, 249, 0)']}
                    start={{ x: 0, y: 0 }}
                    end={{ x: .9, y: 0 }}
                    style={registerNewStyles.imageFade}
                  />
                </ImageBackground>
              </TouchableOpacity>
            )
          })}
        </View>
      </ScrollView>
    </SafeAreaView>
  )
}
