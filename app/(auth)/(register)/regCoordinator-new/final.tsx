import { useState } from 'react'
import { Alert, ScrollView, Text, TextInput, TouchableOpacity, View } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useLocalSearchParams, useRouter } from 'expo-router'
import { ArrowRight } from 'lucide-react-native'

import LogoIRSPrincipal from '@/app/assets/logoIRSprincipal.svg'
import { useSessionDomain } from '@/contexts/auth/use-session-domain'
import { getRegistrationHomeRoute, registerUserByClientType } from '@/lib/services/registration-flows'
import {
  getRegisterFinalParams,
  isRegisterFinalSelectionComplete,
  normalizeRegisterFinalNotes,
  REGISTER_FINAL_NOTES_LIMIT,
  registerPlatformNotificationOptions,
  registerPreferredChannelOptions,
  type RegisterFinalSelection,
} from '@/lib/services/register-user-final'
import { registerOwnerFinalStyles } from './final.styles'

export default function RegisterOwnerFinalScreen() {
  const router = useRouter()
  const { setAuthSession } = useSessionDomain()
  const params = useLocalSearchParams<{
    clientType?: string
    fullName?: string
    email?: string
    phone?: string
    password?: string
    propertyProfile?: string
    primaryInterest?: string
    priority?: string
  }>()
  const [selection, setSelection] = useState<RegisterFinalSelection>({ notes: '' })
  const [showError, setShowError] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const updateSelection = (field: keyof RegisterFinalSelection, value: string) => {
    setShowError(false)
    setSelection((current) => ({
      ...current,
      [field]: value,
    }))
  }

  const handleFinish = async () => {
    if (!isRegisterFinalSelectionComplete(selection) || isSubmitting) {
      setShowError(true)
      return
    }

    setIsSubmitting(true)
    const finalParams = getRegisterFinalParams(params, selection)
    const result = await registerUserByClientType(
      {
        clientType: finalParams.clientType,
        fullName: finalParams.fullName,
        email: finalParams.email,
        phone: finalParams.phone,
        password: finalParams.password,
        propertyProfile: finalParams.propertyProfile,
        primaryInterest: finalParams.primaryInterest,
        priority: finalParams.priority,
        preferredChannel: finalParams.preferredChannel,
        platformNotification: finalParams.platformNotification,
        registrationNotes: finalParams.registrationNotes,
      },
      setAuthSession,
    )
    setIsSubmitting(false)

    if (!result.success) {
      Alert.alert('No se pudo completar el registro', result.error)
      return
    }

    router.replace(getRegistrationHomeRoute(finalParams.clientType))
  }

  const isComplete = isRegisterFinalSelectionComplete(selection)

  return (
    <SafeAreaView style={registerOwnerFinalStyles.safeArea} edges={['left', 'right', 'bottom']}>
      <ScrollView contentContainerStyle={registerOwnerFinalStyles.scrollContent} showsVerticalScrollIndicator={false}>
        <View style={registerOwnerFinalStyles.main}>
          <View style={registerOwnerFinalStyles.top}>
            <View style={registerOwnerFinalStyles.logoWrap}>
              <LogoIRSPrincipal width={146} height={48} />
            </View>

            <View style={registerOwnerFinalStyles.progressRow}>
              <Text style={registerOwnerFinalStyles.progressLabel}>Paso 4 de 4</Text>
              <View style={registerOwnerFinalStyles.progressTrack}>
                <View style={registerOwnerFinalStyles.progressActive} />
              </View>
            </View>

            <View style={registerOwnerFinalStyles.headerCopy}>
              <Text style={registerOwnerFinalStyles.title}>Tu perfil tambien importa</Text>
              <Text style={registerOwnerFinalStyles.subtitle}>
                Queremos acompañarte con una experiencia clara, confiable y util para tu propiedad y patrimonio.
              </Text>
            </View>
          </View>

          <View style={registerOwnerFinalStyles.formArea}>
            <View style={registerOwnerFinalStyles.optionSection}>
              <Text style={registerOwnerFinalStyles.sectionTitle}>Canales preferidos</Text>
              <View style={registerOwnerFinalStyles.chipsRow}>
                {registerPreferredChannelOptions.map((option) => (
                  <TouchableOpacity
                    key={option.id}
                    style={[
                      registerOwnerFinalStyles.chip,
                      selection.preferredChannel === option.id && registerOwnerFinalStyles.chipSelected,
                    ]}
                    onPress={() => updateSelection('preferredChannel', option.id)}
                    activeOpacity={0.84}
                  >
                    <Text style={registerOwnerFinalStyles.chipText}>{option.label}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            <View style={registerOwnerFinalStyles.optionSection}>
              <Text style={registerOwnerFinalStyles.sectionTitle}>Notificaciones en la plataforma</Text>
              <View style={registerOwnerFinalStyles.chipsRow}>
                {registerPlatformNotificationOptions.map((option) => (
                  <TouchableOpacity
                    key={option.id}
                    style={[
                      registerOwnerFinalStyles.chip,
                      selection.platformNotification === option.id && registerOwnerFinalStyles.chipSelected,
                    ]}
                    onPress={() => updateSelection('platformNotification', option.id)}
                    activeOpacity={0.84}
                  >
                    <Text style={registerOwnerFinalStyles.chipText}>{option.label}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          </View>

          <View style={registerOwnerFinalStyles.notesSection}>
            <View style={registerOwnerFinalStyles.notesIntro}>
              <Text style={registerOwnerFinalStyles.notesTitle}>Cuentanos un poco mas (opcional)</Text>
              <Text style={registerOwnerFinalStyles.notesSubtitle}>
                Que te gustaria consultar o que objetivos tienes con tu propiedad?
              </Text>
            </View>
            <View style={registerOwnerFinalStyles.notesBoxWrap}>
              <TextInput
                style={registerOwnerFinalStyles.notesBox}
                value={selection.notes}
                onChangeText={(value) => updateSelection('notes', normalizeRegisterFinalNotes(value))}
                multiline
                maxLength={REGISTER_FINAL_NOTES_LIMIT}
              />
              <Text style={registerOwnerFinalStyles.counter}>
                {selection.notes.length}/{REGISTER_FINAL_NOTES_LIMIT}
              </Text>
            </View>

            <View style={registerOwnerFinalStyles.trustCard}>
              <View style={registerOwnerFinalStyles.trustDot} />
              <Text style={registerOwnerFinalStyles.trustText}>
                Tu confianza tambien es parte de lo que construimos en INICIO
              </Text>
            </View>
          </View>

          {showError ? (
            <Text style={registerOwnerFinalStyles.errorText}>
              Selecciona un canal y una preferencia de notificaciones para finalizar.
            </Text>
          ) : null}

          <TouchableOpacity
            style={[
              registerOwnerFinalStyles.finishButton,
              (!isComplete || isSubmitting) && registerOwnerFinalStyles.finishButtonDisabled,
            ]}
            onPress={handleFinish}
            activeOpacity={0.84}
          >
            <Text style={registerOwnerFinalStyles.finishButtonText}>{isSubmitting ? 'Registrando...' : 'Finalizar registro'}</Text>
            <ArrowRight size={23} color="#cfa84f" strokeWidth={1.7} />
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  )
}

