import { Image, ScrollView, Text, TouchableOpacity, View } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useLocalSearchParams, useRouter } from 'expo-router'
import { ArrowLeft, ArrowRight } from 'lucide-react-native'

import LogoIRSPrincipal from '@/app/assets/logoIRSprincipal.svg'
import { getRegisterWelcomeParams } from '@/lib/services/register-user-verification'
import { registerOwnerWelcomeStyles } from './welcome.styles'

const teamImage = require('../../../assets/register-owner-welcome-team.png')
const homeIcon = require('../../../assets/register-owner-welcome-home.png')

const features = [
  {
    label: 'Confianza',
    icon: require('../../../assets/register-owner-feature-trust.png'),
  },
  {
    label: 'Patrimonio',
    icon: require('../../../assets/register-owner-feature-wealth.png'),
  },
  {
    label: 'Gestion',
    icon: require('../../../assets/register-owner-feature-management.png'),
  },
  {
    label: 'Acompañamiento',
    icon: require('../../../assets/register-owner-feature-support.png'),
    small: true,
  },
]

export default function RegisterOwnerWelcomeScreen() {
  const router = useRouter()
  const params = useLocalSearchParams<{
    clientType?: string
    fullName?: string
    email?: string
    phone?: string
    password?: string
    emailVerificationToken?: string
  }>()

  const handleContinue = () => {
    router.push({
      pathname: '/regOwnerHouse/profile' as never,
      params: getRegisterWelcomeParams({
        clientType: (params.clientType as never) ?? 'owner',
        registrationAccess: '1',
        fullName: params.fullName,
        email: params.email,
        phone: params.phone,
        password: params.password,
        emailVerificationToken: params.emailVerificationToken,
      }),
    })
  }

  return (
    <SafeAreaView style={registerOwnerWelcomeStyles.safeArea} edges={['left', 'right', 'bottom']}>
      <TouchableOpacity
        style={registerOwnerWelcomeStyles.backButton}
        onPress={() => router.back()}
        activeOpacity={0.84}
        accessibilityRole="button"
        accessibilityLabel="Volver"
      >
        <ArrowLeft size={23} color="#064936" strokeWidth={1.8} />
      </TouchableOpacity>

      <ScrollView contentContainerStyle={registerOwnerWelcomeStyles.scrollContent} showsVerticalScrollIndicator={false}>
        <View style={registerOwnerWelcomeStyles.main}>
          <View style={registerOwnerWelcomeStyles.header}>
            <View style={registerOwnerWelcomeStyles.logoWrap}>
              <LogoIRSPrincipal width={146} height={48} />
            </View>

            <View style={registerOwnerWelcomeStyles.heroCopy}>
              <Text style={registerOwnerWelcomeStyles.title}>Bienvenido a{'\n'}INICIO!</Text>
              <Text style={registerOwnerWelcomeStyles.subtitle}>
                Gracias por confiar en nosotros para acompañar la gestion de tu propiedad y tu patrimonio
              </Text>
            </View>
          </View>

          <View style={registerOwnerWelcomeStyles.featuresRow}>
            {features.map((feature) => (
              <View key={feature.label} style={registerOwnerWelcomeStyles.featureCard}>
                <Image source={feature.icon} style={registerOwnerWelcomeStyles.featureIcon} resizeMode="contain" />
                <Text
                  style={[
                    registerOwnerWelcomeStyles.featureLabel,
                    feature.small && registerOwnerWelcomeStyles.featureLabelSmall,
                  ]}
                >
                  {feature.label}
                </Text>
              </View>
            ))}
          </View>

          <View style={registerOwnerWelcomeStyles.imageSection}>
            <Image source={teamImage} style={registerOwnerWelcomeStyles.teamImage} resizeMode="cover" />
            <View style={registerOwnerWelcomeStyles.messageCard}>
              <Image source={homeIcon} style={registerOwnerWelcomeStyles.messageIcon} resizeMode="contain" />
              <Text style={registerOwnerWelcomeStyles.messageText}>
                En INICIO, tu propiedad recibe atencion cercana y vision a largo plazo
              </Text>
            </View>
          </View>

          <TouchableOpacity
            style={registerOwnerWelcomeStyles.continueButton}
            onPress={handleContinue}
            activeOpacity={0.84}
          >
            <Text style={registerOwnerWelcomeStyles.continueButtonText}>Continuar</Text>
            <ArrowRight
              style={registerOwnerWelcomeStyles.continueIcon}
              size={23}
              color="#cfa84f"
              strokeWidth={1.7}
            />
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  )
}

