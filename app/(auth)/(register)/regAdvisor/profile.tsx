import { useState } from 'react'
import { Alert, Image, ScrollView, Text, TouchableOpacity, View, type ImageSourcePropType } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useLocalSearchParams, useRouter } from 'expo-router'
import { ArrowLeft, ArrowRight } from 'lucide-react-native'

import LogoIRSPrincipal from '@/app/assets/logoIRSprincipal.svg'
import {
  getRegisterProfileClientType,
  getRegisterProfileParams,
  getRegisterProfileSections,
  getRegisterProfileValidationErrors,
  isRegisterProfileSelectionComplete,
  type RegisterProfileField,
  type RegisterProfileOption,
  type RegisterProfileSelection,
} from '@/lib/services/register-user-profile'
import { registerOwnerProfileStyles } from './profile.styles'
import { registerOwnerAccessStyles } from './access.styles'

const iconSources: Record<string, ImageSourcePropType> = {
  'register-owner-profile-residential.png': require('../../../assets/register-owner-profile-residential.png'),
  'register-owner-profile-rentals.png': require('../../../assets/register-owner-profile-rentals.png'),
  'register-owner-profile-commercial.png': require('../../../assets/register-owner-profile-commercial.png'),
  'register-owner-profile-mixed.png': require('../../../assets/register-owner-profile-mixed.png'),
  'register-owner-interest-manage.png': require('../../../assets/register-owner-interest-manage.png'),
  'register-owner-interest-rentals.png': require('../../../assets/register-owner-interest-rentals.png'),
  'register-owner-interest-wealth.png': require('../../../assets/register-owner-interest-wealth.png'),
  'register-owner-interest-investment.png': require('../../../assets/register-owner-interest-investment.png'),
  'register-owner-priority-cashflow.png': require('../../../assets/register-owner-priority-cashflow.png'),
  'register-owner-priority-growth.png': require('../../../assets/register-owner-priority-growth.png'),
  'register-owner-priority-security.png': require('../../../assets/register-owner-priority-security.png'),
  'register-owner-priority-expansion.png': require('../../../assets/register-owner-priority-expansion.png'),
}

type OptionGridProps = {
  title: string
  options: RegisterProfileOption[]
  selectedId?: string
  onSelect: (id: string) => void
}

function OptionGrid({ title, options, selectedId, onSelect }: OptionGridProps) {
  return (
    <View style={registerOwnerProfileStyles.section}>
      <View style={registerOwnerProfileStyles.sectionTitleWrap}>
        <Text style={registerOwnerProfileStyles.sectionTitle}>{title}</Text>
      </View>
      <View style={registerOwnerProfileStyles.grid}>
        {options.map((option) => {
          const selected = selectedId === option.id
          const isWide = option.label.length > 14
          const isResidential = option.id === 'residential'

          return (
            <TouchableOpacity
              key={option.id}
              style={[
                registerOwnerProfileStyles.optionCard,
                selected && registerOwnerProfileStyles.optionCardSelected,
              ]}
              onPress={() => onSelect(option.id)}
              activeOpacity={0.84}
            >
              <View
                style={[
                  registerOwnerProfileStyles.optionContent,
                  isWide && registerOwnerProfileStyles.optionContentWide,
                ]}
              >
                <Image
                  source={iconSources[option.icon]}
                  style={[
                    registerOwnerProfileStyles.optionIcon,
                    isResidential && registerOwnerProfileStyles.optionIconResidential,
                  ]}
                  resizeMode="contain"
                />
                <Text style={registerOwnerProfileStyles.optionText}>{option.label}</Text>
              </View>
            </TouchableOpacity>
          )
        })}
      </View>
    </View>
  )
}

export default function RegisterOwnerProfileScreen() {
  const router = useRouter()
  const params = useLocalSearchParams<{
    clientType?: string
    fullName?: string
    email?: string
    phone?: string
    password?: string
    emailVerificationToken?: string
  }>()
  const [selection, setSelection] = useState<RegisterProfileSelection>({})
  const [showError, setShowError] = useState(false)
  const clientType = getRegisterProfileClientType(params.clientType)
  const profileSections = getRegisterProfileSections(clientType)

  const updateSelection = (field: RegisterProfileField, value: string) => {
    setShowError(false)
    setSelection((current) => ({
      ...current,
      [field]: value,
    }))
  }

  const handleContinue = () => {
    if (!isRegisterProfileSelectionComplete(selection)) {
      setShowError(true)
      Alert.alert('Revisa tu perfil', getRegisterProfileValidationErrors(selection, profileSections).join('\n'))
      return
    }

    router.push({
      pathname: '/regAdvisor/final' as never,
      params: getRegisterProfileParams(params, selection),
    })
  }

  const isComplete = isRegisterProfileSelectionComplete(selection)

  return (
    <SafeAreaView style={registerOwnerProfileStyles.safeArea} edges={['left', 'right', 'bottom']}>
      <TouchableOpacity
        style={registerOwnerAccessStyles.backButton}
        onPress={() => router.back()}
        activeOpacity={0.84}
        accessibilityRole="button"
        accessibilityLabel="Volver"
      >
        <ArrowLeft size={23} color="#064936" strokeWidth={1.8} />
      </TouchableOpacity>
      <ScrollView contentContainerStyle={registerOwnerProfileStyles.scrollContent} showsVerticalScrollIndicator={false}>
        <View style={registerOwnerProfileStyles.main}>
          <View style={registerOwnerProfileStyles.header}>
            <View style={registerOwnerProfileStyles.logoWrap}>
              <LogoIRSPrincipal width={146} height={48} />
            </View>

            <View style={registerOwnerProfileStyles.progressRow}>
              <Text style={registerOwnerProfileStyles.progressLabel}>Paso 3 de 4</Text>
              <View style={registerOwnerProfileStyles.progressTrack}>
                <View style={registerOwnerProfileStyles.progressActive} />
              </View>
            </View>

            <View style={registerOwnerProfileStyles.titleBlock}>
              <Text style={registerOwnerProfileStyles.title}>Queremos conocerte mejor</Text>
              <Text style={registerOwnerProfileStyles.subtitle}>
                Asi podemos crear una experiencia{'\n'}hecha a tu medida
              </Text>
            </View>
          </View>

          <View style={registerOwnerProfileStyles.sections}>
            {profileSections.map((section) => (
              <OptionGrid
                key={section.field}
                title={section.title}
                options={section.options}
                selectedId={selection[section.field]}
                onSelect={(id) => updateSelection(section.field, id)}
              />
            ))}
          </View>

          {showError ? (
            <Text style={registerOwnerProfileStyles.errorText}>
              Selecciona una opcion de cada seccion para continuar.
            </Text>
          ) : null}

          <TouchableOpacity
            style={[
              registerOwnerProfileStyles.continueButton,
              !isComplete && registerOwnerProfileStyles.continueButtonDisabled,
            ]}
            onPress={handleContinue}
            activeOpacity={0.84}
          >
            <Text style={registerOwnerProfileStyles.continueButtonText}>Continuar</Text>
            <ArrowRight
              style={registerOwnerProfileStyles.continueIcon}
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
