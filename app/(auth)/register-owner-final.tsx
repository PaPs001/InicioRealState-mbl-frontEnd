import { useState } from 'react'
import { ScrollView, Text, TextInput, TouchableOpacity, View } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useLocalSearchParams, useRouter } from 'expo-router'
import { ArrowRight } from 'lucide-react-native'

import LogoIRSPrincipal from '@/app/assets/logoIRSprincipal.svg'
import {
  getOwnerFinalRegisterParams,
  isOwnerFinalSelectionComplete,
  normalizeOwnerFinalNotes,
  OWNER_FINAL_NOTES_LIMIT,
  ownerPlatformNotificationOptions,
  ownerPreferredChannelOptions,
  type OwnerFinalSelection,
} from '@/lib/services/register-owner-final'
import { registerOwnerFinalStyles } from './register-owner-final.styles'

export default function RegisterOwnerFinalScreen() {
  const router = useRouter()
  const params = useLocalSearchParams<{
    fullName?: string
    email?: string
    phone?: string
    password?: string
    propertyProfile?: string
    primaryInterest?: string
    priority?: string
  }>()
  const [selection, setSelection] = useState<OwnerFinalSelection>({ notes: '' })
  const [showError, setShowError] = useState(false)

  const updateSelection = (field: keyof OwnerFinalSelection, value: string) => {
    setShowError(false)
    setSelection((current) => ({
      ...current,
      [field]: value,
    }))
  }

  const handleFinish = () => {
    if (!isOwnerFinalSelectionComplete(selection)) {
      setShowError(true)
      return
    }

    router.push({
      pathname: '/register',
      params: getOwnerFinalRegisterParams(params, selection),
    })
  }

  const isComplete = isOwnerFinalSelectionComplete(selection)

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
                {ownerPreferredChannelOptions.map((option) => (
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
                {ownerPlatformNotificationOptions.map((option) => (
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
                onChangeText={(value) => updateSelection('notes', normalizeOwnerFinalNotes(value))}
                multiline
                maxLength={OWNER_FINAL_NOTES_LIMIT}
              />
              <Text style={registerOwnerFinalStyles.counter}>
                {selection.notes.length}/{OWNER_FINAL_NOTES_LIMIT}
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
              !isComplete && registerOwnerFinalStyles.finishButtonDisabled,
            ]}
            onPress={handleFinish}
            activeOpacity={0.84}
          >
            <Text style={registerOwnerFinalStyles.finishButtonText}>Finalizar registro</Text>
            <ArrowRight size={23} color="#cfa84f" strokeWidth={1.7} />
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  )
}
