import { useState } from 'react'
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { usePathname, useRouter } from 'expo-router'
import { ArrowLeft, ArrowRight, Info, Lock, Mail, Phone, User } from 'lucide-react-native'

import LogoIRSPrincipal from '@/app/assets/logoIRSprincipal.svg'
import { PasswordTextInput } from '@/app/(auth)/shared/PasswordTextInput'
import {
  getInitialRegisterAccessFormData,
  getRegisterAccessParams,
  getRegisterClientTypeFromRoute,
  isRegisterAccessFormValid,
  type RegisterAccessField,
} from '@/lib/services/register-user-access'
import { registerOwnerAccessStyles } from './access.styles'

export default function RegisterOwnerAccessScreen() {
  const router = useRouter()
  const pathname = usePathname()
  const [formData, setFormData] = useState(getInitialRegisterAccessFormData)
  const [showError, setShowError] = useState(false)

  const updateField = (field: RegisterAccessField, value: string) => {
    setShowError(false)
    setFormData((current) => ({
      ...current,
      [field]: value,
    }))
  }

  const handleContinue = () => {
    if (!isRegisterAccessFormValid(formData)) {
      setShowError(true)
      return
    }

    router.push({
      pathname: '/regCoordinator-new/verify',
      params: getRegisterAccessParams(formData, getRegisterClientTypeFromRoute(pathname)),
    })
  }

  const isValid = isRegisterAccessFormValid(formData)

  return (
    <SafeAreaView style={registerOwnerAccessStyles.safeArea} edges={['left', 'right', 'bottom']}>
      <TouchableOpacity
        style={registerOwnerAccessStyles.backButton}
        onPress={() => router.back()}
        activeOpacity={0.84}
        accessibilityRole="button"
        accessibilityLabel="Volver"
      >
        <ArrowLeft size={23} color="#064936" strokeWidth={1.8} />
      </TouchableOpacity>

      <KeyboardAvoidingView
        style={registerOwnerAccessStyles.keyboardView}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <ScrollView
          contentContainerStyle={registerOwnerAccessStyles.scrollContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <View style={registerOwnerAccessStyles.main}>
            <View style={registerOwnerAccessStyles.topSection}>
              <View style={registerOwnerAccessStyles.logoWrap}>
                <LogoIRSPrincipal width={146} height={48} />
              </View>

              <View style={registerOwnerAccessStyles.progressRow}>
                <Text style={registerOwnerAccessStyles.progressLabel}>Paso 1 de 6</Text>
                <View style={registerOwnerAccessStyles.progressTrack}>
                  <View style={registerOwnerAccessStyles.progressActive} />
                </View>
              </View>

              <View style={registerOwnerAccessStyles.header}>
                <Text style={registerOwnerAccessStyles.title}>Crea tu acceso</Text>
                <Text style={registerOwnerAccessStyles.subtitle}>
                  Ingresa tu informacion para activar tu perfil de propietario
                </Text>
              </View>

              <View style={registerOwnerAccessStyles.form}>
                <View style={registerOwnerAccessStyles.inputShell}>
                  <View style={registerOwnerAccessStyles.inputIcon}>
                    <User size={20} color="#697b74" strokeWidth={1.7} />
                  </View>
                  <TextInput
                    style={registerOwnerAccessStyles.input}
                    placeholder="Nombre completo"
                    placeholderTextColor="#697b74"
                    value={formData.fullName}
                    onChangeText={(value) => updateField('fullName', value)}
                    autoCapitalize="words"
                    autoCorrect={false}
                  />
                </View>

                <View style={registerOwnerAccessStyles.inputShell}>
                  <View style={registerOwnerAccessStyles.inputIcon}>
                    <Mail size={18} color="#697b74" strokeWidth={1.8} />
                  </View>
                  <TextInput
                    style={registerOwnerAccessStyles.input}
                    placeholder="Correo Electronico Registrado"
                    placeholderTextColor="#697b74"
                    value={formData.email}
                    onChangeText={(value) => updateField('email', value)}
                    keyboardType="email-address"
                    autoCapitalize="none"
                    autoCorrect={false}
                    textContentType="emailAddress"
                  />
                </View>

                <View style={registerOwnerAccessStyles.inputShell}>
                  <View style={registerOwnerAccessStyles.inputIcon}>
                    <Phone size={20} color="#697b74" strokeWidth={1.8} />
                  </View>
                  <TextInput
                    style={registerOwnerAccessStyles.input}
                    placeholder="Telefono o Whatsapp"
                    placeholderTextColor="#697b74"
                    value={formData.phone}
                    onChangeText={(value) => updateField('phone', value)}
                    keyboardType="phone-pad"
                    textContentType="telephoneNumber"
                  />
                </View>

                <View style={registerOwnerAccessStyles.inputShell}>
                  <View style={registerOwnerAccessStyles.inputIcon}>
                    <Lock size={20} color="#697b74" strokeWidth={1.8} />
                  </View>
                  <PasswordTextInput
                    style={[registerOwnerAccessStyles.input, registerOwnerAccessStyles.passwordInput]}
                    placeholder="Crea una contraseña"
                    placeholderTextColor="#697b74"
                    value={formData.password}
                    onChangeText={(value) => updateField('password', value)}
                    iconColor="#9aa9a1"
                    toggleStyle={registerOwnerAccessStyles.passwordToggle}
                    textContentType="password"
                  />
                </View>
              </View>
            </View>

            <View style={registerOwnerAccessStyles.infoCard}>
              <Info size={25} color="#c2824b" strokeWidth={1.8} />
              <Text style={registerOwnerAccessStyles.infoText}>
                Tu acceso sera exclusivo a tu perfil de propietario.
              </Text>
            </View>

            {showError ? (
              <Text style={registerOwnerAccessStyles.errorText}>
                Completa todos los campos con informacion valida para continuar.
              </Text>
            ) : null}

            <TouchableOpacity
              style={[
                registerOwnerAccessStyles.continueButton,
                !isValid && registerOwnerAccessStyles.continueButtonDisabled,
              ]}
              onPress={handleContinue}
              activeOpacity={0.84}
              >
                <Text style={registerOwnerAccessStyles.continueButtonText}>Continuar</Text>
              <ArrowRight
                style={registerOwnerAccessStyles.continueButtonIcon}
                size={23}
                color="#cfa84f"
                strokeWidth={1.7}
              />
              </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  )
}

