import { useState, useEffect, useRef } from 'react'
import { 
  View, 
  Text, 
  TextInput, 
  StyleSheet, 
  TouchableOpacity, 
  Animated,
  Dimensions,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Image,
} from 'react-native'
import { spacing, typography, borderRadius, clientThemes } from '@/lib/theme'
import { ArrowLeft, Check, Home, Plus, ChevronRight, Calendar, MapPin, DollarSign, User, Phone, FileText, Camera, Clock } from 'lucide-react-native'
import { useRouter } from 'expo-router'
import LogoGris from '@/app/assets/LogoInicioSVGris.svg'
import * as ImagePicker from 'expo-image-picker'

const { width, height } = Dimensions.get('window')

// Colores exclusivos para inquilinos - Verde, cafe y dorado
const tenantColors = {
  background: clientThemes.tenant.background,
  surface: clientThemes.tenant.surface,
  surfaceLight: clientThemes.tenant.surfaceLight,
  accent: clientThemes.tenant.accent,
  accentGold: clientThemes.tenant.accentGold,
  green: clientThemes.tenant.green,
  warm: clientThemes.tenant.warm,
  text: clientThemes.tenant.text,
  textSecondary: clientThemes.tenant.textSecondary,
  textMuted: clientThemes.tenant.textMuted,
  border: clientThemes.tenant.border,
  success: '#4ade80',
  error: '#ef4444',
}

type RentalType = 'with_us' | 'external' | null
type AddDataNow = 'now' | 'later' | null

interface RentalData {
  startDate: string
  endDate: string
  rentalType: 'house' | 'apartment' | 'room' | 'office' | ''
  location: string
  landlordName: string
  landlordPhone: string
  agentName: string
  agentPhone: string
  monthlyRent: string
  photos: string[]
  documents: string[]
}

export default function RenterForm() {
  const router = useRouter()
  const [step, setStep] = useState(1)
  const [fullName, setFullName] = useState('')
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')
  const [password, setPassword] = useState('')
  const [rentalType, setRentalType] = useState<RentalType>(null)
  const [addDataNow, setAddDataNow] = useState<AddDataNow>(null)
  const [isSearching, setIsSearching] = useState(false)
  const [rentalFound, setRentalFound] = useState<boolean | null>(null)
  
  // Datos de la renta externa
  const [rentalData, setRentalData] = useState<RentalData>({
    startDate: '',
    endDate: '',
    rentalType: '',
    location: '',
    landlordName: '',
    landlordPhone: '',
    agentName: '',
    agentPhone: '',
    monthlyRent: '',
    photos: [],
    documents: [],
  })
  
  // Animaciones
  const fadeAnim = useRef(new Animated.Value(0)).current
  const slideAnim = useRef(new Animated.Value(30)).current
  const logoScale = useRef(new Animated.Value(0.8)).current
  const logoOpacity = useRef(new Animated.Value(0)).current
  const pulseAnim = useRef(new Animated.Value(1)).current

  // Animacion de entrada al cambiar de paso
  useEffect(() => {
    fadeAnim.setValue(0)
    slideAnim.setValue(30)
    
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 400,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 400,
        useNativeDriver: true,
      }),
    ]).start()
  }, [step])

  // Animacion del logo al inicio
  useEffect(() => {
    Animated.parallel([
      Animated.timing(logoOpacity, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.spring(logoScale, {
        toValue: 1,
        friction: 8,
        tension: 40,
        useNativeDriver: true,
      }),
    ]).start()
  }, [])

  // Animacion de pulso para el loader
  useEffect(() => {
    if (isSearching) {
      const pulse = Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 1.1,
            duration: 800,
            useNativeDriver: true,
          }),
          Animated.timing(pulseAnim, {
            toValue: 1,
            duration: 800,
            useNativeDriver: true,
          }),
        ])
      )
      pulse.start()
      return () => pulse.stop()
    }
  }, [isSearching])

  // Validaciones
  const isStepOneValid = fullName.trim().length >= 3
  const isStepTwoValid = email.trim().includes('@') && email.trim().includes('.')
  const isStepThreeValid = phone.trim().length >= 10
  const isStepFourValid = password.trim().length >= 6
  const isRentalInfoValid = rentalData.startDate && rentalData.endDate && rentalData.rentalType && rentalData.location && rentalData.monthlyRent

  const handleBack = () => {
    if (step === 1) {
      router.back()
      return
    }
    if (step === 6 && rentalType === 'external') {
      setStep(5)
      return
    }
    if (step === 7) {
      if (addDataNow === 'now') {
        setStep(6)
      } else {
        setStep(5)
      }
      return
    }
    if (step === 8) {
      setStep(7)
      return
    }
    if (step === 9) {
      setStep(8)
      return
    }
    if (step === 10) {
      setStep(5)
      setRentalFound(null)
      setIsSearching(false)
      return
    }
    setStep((currentStep) => currentStep - 1)
  }

  const handleContinue = () => {
    if (step === 1 && isStepOneValid) {
      setStep(2)
      return
    }
    if (step === 2 && isStepTwoValid) {
      setStep(3)
      return
    }
    if (step === 3 && isStepThreeValid) {
      setStep(4)
      return
    }
    if (step === 4 && isStepFourValid) {
      setStep(5) // Ir a pregunta de tipo de renta
      return
    }
  }

  const handleRentalTypeQuestion = (type: RentalType) => {
    setRentalType(type)
    if (type === 'with_us') {
      // Simular busqueda de renta
      setIsSearching(true)
      setTimeout(() => {
        setIsSearching(false)
        // Simular que encontramos renta (50% probabilidad para demo)
        const found = Math.random() > 0.5
        setRentalFound(found)
        setStep(found ? 6 : 10) // 6: encontrada, 10: no encontrada
      }, 2500)
    } else {
      setStep(6) // Preguntar si quiere agregar datos ahora
    }
  }

  const handleAddDataQuestion = (answer: AddDataNow) => {
    setAddDataNow(answer)
    if (answer === 'now') {
      setStep(7) // Ir a formulario de datos de renta
    } else {
      handleFinish() // Finalizar y agregar despues
    }
  }

  const handlePhotoPicker = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsMultipleSelection: true,
      quality: 0.8,
    })

    if (!result.canceled) {
      const newPhotos = result.assets.map(asset => asset.uri)
      setRentalData(prev => ({ ...prev, photos: [...prev.photos, ...newPhotos] }))
    }
  }

  const handleDocumentPicker = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsMultipleSelection: true,
      quality: 0.8,
    })

    if (!result.canceled) {
      const newDocs = result.assets.map(asset => asset.uri)
      setRentalData(prev => ({ ...prev, documents: [...prev.documents, ...newDocs] }))
    }
  }

  const handleFinish = () => {
    router.push({
      pathname: '/register-transition',
      params: {
        title: 'Bienvenido a tu hogar',
        subtitle: 'Tu espacio para gestionar tu renta esta listo.',
        loginUserId: 'user-3',
        nextRoute: '/(tabs)',
        durationMs: '2200',
        variant: 'pulse-orb',
      },
    })
  }

  const isCurrentStepValid =
    (step === 1 && isStepOneValid) ||
    (step === 2 && isStepTwoValid) ||
    (step === 3 && isStepThreeValid) ||
    (step === 4 && isStepFourValid)

  const totalSteps = 4

  const rentalTypes = [
    { value: 'house', label: 'Casa' },
    { value: 'apartment', label: 'Departamento' },
    { value: 'room', label: 'Cuarto' },
    { value: 'office', label: 'Oficina' },
  ]

  // Renderizar contenido segun el paso
  const renderStep = () => {
    switch (step) {
      case 1:
        return (
          <Animated.View style={[styles.stepContent, { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }]}>
            <Text style={styles.stepTitle}>Comencemos con lo basico</Text>
            <Text style={styles.stepSubtitle}>Como te gustaria que te llamemos?</Text>
            
            <View style={styles.formGroup}>
              <Text style={styles.label}>Nombre completo</Text>
              <TextInput
                style={styles.input}
                placeholder="Escribe tu nombre completo"
                placeholderTextColor={tenantColors.textMuted}
                value={fullName}
                onChangeText={setFullName}
                autoFocus
              />
              <Text style={styles.hint}>Usaremos este nombre para personalizar tu experiencia</Text>
            </View>
          </Animated.View>
        )

      case 2:
        return (
          <Animated.View style={[styles.stepContent, { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }]}>
            <Text style={styles.stepTitle}>Mantente conectado</Text>
            <Text style={styles.stepSubtitle}>Tu correo sera tu acceso</Text>
            
            <View style={styles.formGroup}>
              <Text style={styles.label}>Correo electronico</Text>
              <TextInput
                style={styles.input}
                placeholder="tu@correo.com"
                placeholderTextColor={tenantColors.textMuted}
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
                autoFocus
              />
              <Text style={styles.hint}>Aqui recibiras recordatorios de tu renta</Text>
            </View>
          </Animated.View>
        )

      case 3:
        return (
          <Animated.View style={[styles.stepContent, { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }]}>
            <Text style={styles.stepTitle}>Una linea directa</Text>
            <Text style={styles.stepSubtitle}>Para que podamos contactarte</Text>
            
            <View style={styles.formGroup}>
              <Text style={styles.label}>Numero de telefono</Text>
              <TextInput
                style={styles.input}
                placeholder="+52 55 1234 5678"
                placeholderTextColor={tenantColors.textMuted}
                value={phone}
                onChangeText={setPhone}
                keyboardType="phone-pad"
                autoFocus
              />
              <Text style={styles.hint}>Solo te contactaremos cuando sea importante</Text>
            </View>
          </Animated.View>
        )

      case 4:
        return (
          <Animated.View style={[styles.stepContent, { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }]}>
            <Text style={styles.stepTitle}>Protege tu cuenta</Text>
            <Text style={styles.stepSubtitle}>Crea una contrasena segura</Text>
            
            <View style={styles.formGroup}>
              <Text style={styles.label}>Contrasena</Text>
              <TextInput
                style={styles.input}
                placeholder="Minimo 6 caracteres"
                placeholderTextColor={tenantColors.textMuted}
                value={password}
                onChangeText={setPassword}
                secureTextEntry
                autoFocus
              />
              <Text style={styles.hint}>Tu informacion esta protegida con encriptacion</Text>
            </View>
          </Animated.View>
        )

      // Pregunta: Rentas con nosotros o externo?
      case 5:
        return (
          <Animated.View style={[styles.stepContent, { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }]}>
            <View style={styles.questionContainer}>
              <Animated.View style={[styles.logoContainer, { transform: [{ scale: pulseAnim }] }]}>
                <Home size={48} color={tenantColors.accent} />
              </Animated.View>
              
              <Text style={styles.questionTitle}>Como rentas actualmente?</Text>
              <Text style={styles.questionSubtitle}>
                Cuentanos sobre tu situacion de renta para personalizar tu experiencia
              </Text>

              <View style={styles.optionsContainer}>
                <TouchableOpacity 
                  style={styles.optionButton}
                  onPress={() => handleRentalTypeQuestion('with_us')}
                >
                  <View style={styles.optionContent}>
                    <Check size={24} color={tenantColors.green} />
                    <View style={styles.optionTextContainer}>
                      <Text style={styles.optionText}>Rento con Inicio</Text>
                      <Text style={styles.optionSubtext}>Ya tengo un contrato con ustedes</Text>
                    </View>
                  </View>
                  <ChevronRight size={20} color={tenantColors.textMuted} />
                </TouchableOpacity>

                <TouchableOpacity 
                  style={styles.optionButton}
                  onPress={() => handleRentalTypeQuestion('external')}
                >
                  <View style={styles.optionContent}>
                    <Plus size={24} color={tenantColors.warm} />
                    <View style={styles.optionTextContainer}>
                      <Text style={styles.optionText}>Rento de manera externa</Text>
                      <Text style={styles.optionSubtext}>Quiero administrar mi renta aqui</Text>
                    </View>
                  </View>
                  <ChevronRight size={20} color={tenantColors.textMuted} />
                </TouchableOpacity>
              </View>
            </View>
          </Animated.View>
        )

      // Renta con nosotros encontrada
      case 6:
        if (rentalType === 'with_us') {
          return (
            <Animated.View style={[styles.stepContent, { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }]}>
              <View style={styles.successContainer}>
                <View style={styles.successIcon}>
                  <Check size={40} color={tenantColors.background} />
                </View>
                
                <Text style={styles.successTitle}>Renta vinculada</Text>
                <Text style={styles.successSubtitle}>
                  Hemos encontrado tu contrato de renta y lo vinculamos a tu cuenta. Ya puedes acceder a toda la informacion.
                </Text>

                <View style={styles.propertyPreview}>
                  <Home size={24} color={tenantColors.green} />
                  <View style={styles.propertyPreviewText}>
                    <Text style={styles.propertyPreviewTitle}>Tu renta activa</Text>
                    <Text style={styles.propertyPreviewSubtitle}>Lista para gestionar</Text>
                  </View>
                </View>

                <TouchableOpacity style={styles.primaryButton} onPress={handleFinish}>
                  <Text style={styles.primaryButtonText}>Ir a mi inicio</Text>
                </TouchableOpacity>
              </View>
            </Animated.View>
          )
        }
        
        // Externo: Preguntar si quiere agregar datos ahora
        return (
          <Animated.View style={[styles.stepContent, { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }]}>
            <View style={styles.questionContainer}>
              <Animated.View style={[styles.logoContainer, { transform: [{ scale: pulseAnim }] }]}>
                <FileText size={48} color={tenantColors.accent} />
              </Animated.View>
              
              <Text style={styles.questionTitle}>Quieres agregar los datos de tu renta?</Text>
              <Text style={styles.questionSubtitle}>
                Puedes agregar la informacion ahora o hacerlo mas tarde desde la app
              </Text>

              <View style={styles.optionsContainer}>
                <TouchableOpacity 
                  style={styles.optionButton}
                  onPress={() => handleAddDataQuestion('now')}
                >
                  <View style={styles.optionContent}>
                    <Check size={24} color={tenantColors.green} />
                    <View style={styles.optionTextContainer}>
                      <Text style={styles.optionText}>Agregar ahora</Text>
                      <Text style={styles.optionSubtext}>Completar informacion de mi renta</Text>
                    </View>
                  </View>
                  <ChevronRight size={20} color={tenantColors.textMuted} />
                </TouchableOpacity>

                <TouchableOpacity 
                  style={styles.optionButton}
                  onPress={() => handleAddDataQuestion('later')}
                >
                  <View style={styles.optionContent}>
                    <Clock size={24} color={tenantColors.warm} />
                    <View style={styles.optionTextContainer}>
                      <Text style={styles.optionText}>Agregar despues</Text>
                      <Text style={styles.optionSubtext}>Lo hare mas tarde</Text>
                    </View>
                  </View>
                  <ChevronRight size={20} color={tenantColors.textMuted} />
                </TouchableOpacity>
              </View>
            </View>
          </Animated.View>
        )

      // Datos de la renta - Informacion basica
      case 7:
        return (
          <Animated.View style={[styles.stepContent, { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }]}>
            <Text style={styles.stepTitle}>Informacion de tu renta</Text>
            <Text style={styles.stepSubtitle}>Cuentanos sobre tu contrato</Text>
            
            <View style={styles.formGroup}>
              <Text style={styles.label}>Fecha de inicio del contrato</Text>
              <TextInput
                style={styles.input}
                placeholder="DD/MM/AAAA"
                placeholderTextColor={tenantColors.textMuted}
                value={rentalData.startDate}
                onChangeText={(text) => setRentalData(prev => ({ ...prev, startDate: text }))}
              />
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.label}>Fecha de terminacion</Text>
              <TextInput
                style={styles.input}
                placeholder="DD/MM/AAAA"
                placeholderTextColor={tenantColors.textMuted}
                value={rentalData.endDate}
                onChangeText={(text) => setRentalData(prev => ({ ...prev, endDate: text }))}
              />
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.label}>Tipo de propiedad</Text>
              <View style={styles.typeSelector}>
                {rentalTypes.map((type) => (
                  <TouchableOpacity
                    key={type.value}
                    style={[
                      styles.typeOption,
                      rentalData.rentalType === type.value && styles.typeOptionSelected
                    ]}
                    onPress={() => setRentalData(prev => ({ ...prev, rentalType: type.value as any }))}
                  >
                    <Text style={[
                      styles.typeOptionText,
                      rentalData.rentalType === type.value && styles.typeOptionTextSelected
                    ]}>{type.label}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.label}>Ubicacion</Text>
              <TextInput
                style={styles.input}
                placeholder="Direccion de la propiedad"
                placeholderTextColor={tenantColors.textMuted}
                value={rentalData.location}
                onChangeText={(text) => setRentalData(prev => ({ ...prev, location: text }))}
              />
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.label}>Costo mensual de renta</Text>
              <TextInput
                style={styles.input}
                placeholder="$0.00"
                placeholderTextColor={tenantColors.textMuted}
                value={rentalData.monthlyRent}
                onChangeText={(text) => setRentalData(prev => ({ ...prev, monthlyRent: text }))}
                keyboardType="numeric"
              />
            </View>

            <TouchableOpacity 
              style={[styles.primaryButton, !isRentalInfoValid && styles.disabledButton]} 
              onPress={() => setStep(8)}
              disabled={!isRentalInfoValid}
            >
              <Text style={styles.primaryButtonText}>Continuar</Text>
            </TouchableOpacity>
          </Animated.View>
        )

      // Datos del arrendador
      case 8:
        return (
          <Animated.View style={[styles.stepContent, { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }]}>
            <Text style={styles.stepTitle}>Contactos</Text>
            <Text style={styles.stepSubtitle}>Quien es tu arrendador o asesor?</Text>
            
            <View style={styles.formGroup}>
              <Text style={styles.label}>Nombre del arrendador</Text>
              <TextInput
                style={styles.input}
                placeholder="Nombre del dueno/arrendador"
                placeholderTextColor={tenantColors.textMuted}
                value={rentalData.landlordName}
                onChangeText={(text) => setRentalData(prev => ({ ...prev, landlordName: text }))}
              />
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.label}>Telefono del arrendador</Text>
              <TextInput
                style={styles.input}
                placeholder="+52 55 1234 5678"
                placeholderTextColor={tenantColors.textMuted}
                value={rentalData.landlordPhone}
                onChangeText={(text) => setRentalData(prev => ({ ...prev, landlordPhone: text }))}
                keyboardType="phone-pad"
              />
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.label}>Nombre del asesor (opcional)</Text>
              <TextInput
                style={styles.input}
                placeholder="Si tienes un asesor"
                placeholderTextColor={tenantColors.textMuted}
                value={rentalData.agentName}
                onChangeText={(text) => setRentalData(prev => ({ ...prev, agentName: text }))}
              />
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.label}>Telefono del asesor (opcional)</Text>
              <TextInput
                style={styles.input}
                placeholder="+52 55 1234 5678"
                placeholderTextColor={tenantColors.textMuted}
                value={rentalData.agentPhone}
                onChangeText={(text) => setRentalData(prev => ({ ...prev, agentPhone: text }))}
                keyboardType="phone-pad"
              />
            </View>

            <TouchableOpacity style={styles.primaryButton} onPress={() => setStep(9)}>
              <Text style={styles.primaryButtonText}>Continuar</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.secondaryButton} onPress={handleFinish}>
              <Text style={styles.secondaryButtonText}>Omitir y finalizar</Text>
            </TouchableOpacity>
          </Animated.View>
        )

      // Fotos de la propiedad (opcional)
      case 9:
        return (
          <Animated.View style={[styles.stepContent, { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }]}>
            <Text style={styles.stepTitle}>Fotos de la propiedad</Text>
            <Text style={styles.stepSubtitle}>Opcional - Agrega fotos de tu espacio</Text>
            
            <TouchableOpacity style={styles.uploadArea} onPress={handlePhotoPicker}>
              <Camera size={40} color={tenantColors.accent} />
              <Text style={styles.uploadText}>Toca para agregar fotos</Text>
              <Text style={styles.uploadHint}>Puedes agregar varias</Text>
            </TouchableOpacity>

            {rentalData.photos.length > 0 && (
              <View style={styles.photosPreview}>
                {rentalData.photos.map((photo, index) => (
                  <Image key={index} source={{ uri: photo }} style={styles.photoThumb} />
                ))}
              </View>
            )}

            <TouchableOpacity style={styles.primaryButton} onPress={() => setStep(10)}>
              <Text style={styles.primaryButtonText}>Continuar</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.secondaryButton} onPress={() => setStep(10)}>
              <Text style={styles.secondaryButtonText}>Omitir</Text>
            </TouchableOpacity>
          </Animated.View>
        )

      // Documentacion (opcional) - paso 10 para externos que agregan datos
      case 10:
        if (rentalType === 'with_us' && !rentalFound) {
          // Renta no encontrada
          return (
            <Animated.View style={[styles.stepContent, { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }]}>
              <View style={styles.notFoundContainer}>
                <View style={styles.notFoundIcon}>
                  <Home size={40} color={tenantColors.warm} />
                </View>
                
                <Text style={styles.notFoundTitle}>No encontramos tu renta</Text>
                <Text style={styles.notFoundSubtitle}>
                  No pudimos encontrar un contrato activo con tus datos. Puedes continuar y agregar la informacion manualmente o contactar a tu asesor.
                </Text>

                <TouchableOpacity style={styles.primaryButton} onPress={handleFinish}>
                  <Text style={styles.primaryButtonText}>Continuar de todas formas</Text>
                </TouchableOpacity>

                <TouchableOpacity style={styles.secondaryButton} onPress={() => setStep(5)}>
                  <Text style={styles.secondaryButtonText}>Intentar de nuevo</Text>
                </TouchableOpacity>
              </View>
            </Animated.View>
          )
        }

        // Documentacion para externos
        return (
          <Animated.View style={[styles.stepContent, { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }]}>
            <Text style={styles.stepTitle}>Documentacion</Text>
            <Text style={styles.stepSubtitle}>Opcional - Guarda tus documentos importantes</Text>
            
            <TouchableOpacity style={styles.uploadArea} onPress={handleDocumentPicker}>
              <FileText size={40} color={tenantColors.accent} />
              <Text style={styles.uploadText}>Agregar documentos</Text>
              <Text style={styles.uploadHint}>Contrato, comprobantes, etc.</Text>
            </TouchableOpacity>

            {rentalData.documents.length > 0 && (
              <View style={styles.documentsPreview}>
                <Text style={styles.documentsCount}>{rentalData.documents.length} documento(s) agregado(s)</Text>
              </View>
            )}

            <TouchableOpacity style={styles.primaryButton} onPress={handleFinish}>
              <Text style={styles.primaryButtonText}>Finalizar registro</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.secondaryButton} onPress={handleFinish}>
              <Text style={styles.secondaryButtonText}>Omitir y finalizar</Text>
            </TouchableOpacity>
          </Animated.View>
        )

      default:
        return null
    }
  }

  if (isSearching) {
    return (
      <View style={styles.container}>
        <View style={styles.searchingContainer}>
          <Animated.View style={[styles.searchingLogo, { transform: [{ scale: pulseAnim }] }]}>
            <LogoGris width={80} height={80} />
          </Animated.View>
          
          <Text style={styles.searchingTitle}>Buscando tu renta...</Text>
          <Text style={styles.searchingSubtitle}>
            Estamos verificando nuestros registros para vincular tu contrato
          </Text>
          
          <ActivityIndicator size="large" color={tenantColors.accent} style={styles.loader} />
        </View>
      </View>
    )
  }

  return (
    <View style={styles.container}>
      {/* Logo de fondo centrado y transparente */}
      <View style={styles.backgroundLogoContainer}>
        <LogoGris width={280} height={280} style={styles.backgroundLogo} />
      </View>

      <KeyboardAvoidingView 
        style={styles.keyboardView}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <ScrollView 
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity style={styles.backButton} onPress={handleBack}>
            <ArrowLeft size={20} color={tenantColors.accent} />
            <Text style={styles.backButtonText}>Regresar</Text>
          </TouchableOpacity>
        </View>

        {/* Indicador de progreso (solo para pasos 1-4) */}
        {step <= 4 && (
          <View style={styles.progressContainer}>
            <View style={styles.progressBar}>
              <Animated.View 
                style={[
                  styles.progressFill, 
                  { width: `${(step / totalSteps) * 100}%` }
                ]} 
              />
            </View>
            <Text style={styles.progressText}>Paso {step} de {totalSteps}</Text>
          </View>
        )}

        {/* Contenido del paso */}
        {renderStep()}

        {/* Boton continuar (solo para pasos 1-4) */}
        {step <= 4 && (
          <View style={styles.footer}>
            <TouchableOpacity
              disabled={!isCurrentStepValid}
              style={[styles.continueButton, !isCurrentStepValid && styles.disabledButton]}
              onPress={handleContinue}
            >
              <Text style={[styles.continueButtonText, !isCurrentStepValid && styles.disabledButtonText]}>
                Continuar
              </Text>
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>
      </KeyboardAvoidingView>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: tenantColors.background,
  },
  keyboardView: {
    flex: 1,
  },
  backgroundLogoContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 0,
  },
  backgroundLogo: {
    opacity: 0.6,
  },
  scrollContent: {
    flexGrow: 1,
    padding: spacing.lg,
    zIndex: 1,
  },
  header: {
    marginBottom: spacing.xl,
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  backButtonText: {
    color: tenantColors.accent,
    fontSize: typography.body.fontSize,
    fontWeight: '500',
    marginLeft: spacing.xs,
  },
  progressContainer: {
    marginBottom: spacing.xl,
  },
  progressBar: {
    height: 4,
    backgroundColor: tenantColors.surface,
    borderRadius: 2,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: tenantColors.green,
    borderRadius: 2,
  },
  progressText: {
    color: tenantColors.textMuted,
    fontSize: typography.caption.fontSize,
    marginTop: spacing.sm,
    textAlign: 'right',
  },
  stepContent: {
    flex: 1,
  },
  stepTitle: {
    color: tenantColors.text,
    fontSize: typography.h2.fontSize,
    fontWeight: '700',
    marginBottom: spacing.xs,
  },
  stepSubtitle: {
    color: tenantColors.textSecondary,
    fontSize: typography.body.fontSize,
    marginBottom: spacing.xl,
  },
  formGroup: {
    marginBottom: spacing.lg,
  },
  label: {
    color: tenantColors.accent,
    fontSize: typography.bodySmall.fontSize,
    fontWeight: '600',
    marginBottom: spacing.sm,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  input: {
    backgroundColor: tenantColors.surface,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    color: tenantColors.text,
    fontSize: typography.body.fontSize,
    borderWidth: 1,
    borderColor: tenantColors.border,
  },
  hint: {
    color: tenantColors.textMuted,
    fontSize: typography.caption.fontSize,
    marginTop: spacing.sm,
  },
  footer: {
    marginTop: 'auto',
    paddingTop: spacing.lg,
  },
  continueButton: {
    backgroundColor: tenantColors.green,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    alignItems: 'center',
  },
  continueButtonText: {
    color: tenantColors.text,
    fontSize: typography.body.fontSize,
    fontWeight: '700',
  },
  disabledButton: {
    backgroundColor: tenantColors.surface,
    borderWidth: 1,
    borderColor: tenantColors.border,
  },
  disabledButtonText: {
    color: tenantColors.textMuted,
  },
  // Question styles
  questionContainer: {
    alignItems: 'center',
    paddingVertical: spacing.xl,
  },
  logoContainer: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: tenantColors.surface,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.xl,
    borderWidth: 2,
    borderColor: tenantColors.accent,
  },
  questionTitle: {
    color: tenantColors.text,
    fontSize: typography.h3.fontSize,
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: spacing.sm,
  },
  questionSubtitle: {
    color: tenantColors.textSecondary,
    fontSize: typography.body.fontSize,
    textAlign: 'center',
    marginBottom: spacing.xl,
    paddingHorizontal: spacing.md,
  },
  optionsContainer: {
    width: '100%',
    gap: spacing.md,
  },
  optionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: tenantColors.surface,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: tenantColors.border,
  },
  optionContent: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    gap: spacing.md,
  },
  optionTextContainer: {
    flex: 1,
  },
  optionText: {
    color: tenantColors.text,
    fontSize: typography.body.fontSize,
    fontWeight: '600',
  },
  optionSubtext: {
    color: tenantColors.textMuted,
    fontSize: typography.caption.fontSize,
    marginTop: 2,
  },
  // Success styles
  successContainer: {
    alignItems: 'center',
    paddingVertical: spacing.xl,
  },
  successIcon: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: tenantColors.green,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.xl,
  },
  successTitle: {
    color: tenantColors.text,
    fontSize: typography.h3.fontSize,
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: spacing.sm,
  },
  successSubtitle: {
    color: tenantColors.textSecondary,
    fontSize: typography.body.fontSize,
    textAlign: 'center',
    marginBottom: spacing.xl,
    paddingHorizontal: spacing.md,
  },
  propertyPreview: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: tenantColors.surface,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    marginBottom: spacing.xl,
    width: '100%',
    borderWidth: 1,
    borderColor: tenantColors.border,
  },
  propertyPreviewText: {
    marginLeft: spacing.md,
  },
  propertyPreviewTitle: {
    color: tenantColors.text,
    fontSize: typography.body.fontSize,
    fontWeight: '600',
  },
  propertyPreviewSubtitle: {
    color: tenantColors.textMuted,
    fontSize: typography.caption.fontSize,
  },
  primaryButton: {
    backgroundColor: tenantColors.green,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    alignItems: 'center',
    width: '100%',
    marginBottom: spacing.sm,
  },
  primaryButtonText: {
    color: tenantColors.text,
    fontSize: typography.body.fontSize,
    fontWeight: '700',
  },
  secondaryButton: {
    backgroundColor: 'transparent',
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    alignItems: 'center',
    width: '100%',
    borderWidth: 1,
    borderColor: tenantColors.border,
  },
  secondaryButtonText: {
    color: tenantColors.textSecondary,
    fontSize: typography.body.fontSize,
    fontWeight: '600',
  },
  // Not found styles
  notFoundContainer: {
    alignItems: 'center',
    paddingVertical: spacing.xl,
  },
  notFoundIcon: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: tenantColors.surface,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.xl,
    borderWidth: 2,
    borderColor: tenantColors.warm,
  },
  notFoundTitle: {
    color: tenantColors.text,
    fontSize: typography.h3.fontSize,
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: spacing.sm,
  },
  notFoundSubtitle: {
    color: tenantColors.textSecondary,
    fontSize: typography.body.fontSize,
    textAlign: 'center',
    marginBottom: spacing.xl,
    paddingHorizontal: spacing.md,
  },
  // Type selector
  typeSelector: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  typeOption: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.lg,
    backgroundColor: tenantColors.surface,
    borderWidth: 1,
    borderColor: tenantColors.border,
  },
  typeOptionSelected: {
    backgroundColor: tenantColors.green,
    borderColor: tenantColors.green,
  },
  typeOptionText: {
    color: tenantColors.text,
    fontSize: typography.bodySmall.fontSize,
    fontWeight: '500',
  },
  typeOptionTextSelected: {
    color: tenantColors.text,
    fontWeight: '700',
  },
  // Upload area
  uploadArea: {
    backgroundColor: tenantColors.surface,
    borderRadius: borderRadius.xl,
    padding: spacing.xl,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: tenantColors.border,
    borderStyle: 'dashed',
    marginBottom: spacing.lg,
  },
  uploadText: {
    color: tenantColors.text,
    fontSize: typography.body.fontSize,
    fontWeight: '600',
    marginTop: spacing.md,
  },
  uploadHint: {
    color: tenantColors.textMuted,
    fontSize: typography.caption.fontSize,
    marginTop: spacing.xs,
  },
  photosPreview: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
    marginBottom: spacing.lg,
  },
  photoThumb: {
    width: 80,
    height: 80,
    borderRadius: borderRadius.md,
  },
  documentsPreview: {
    backgroundColor: tenantColors.surface,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    marginBottom: spacing.lg,
  },
  documentsCount: {
    color: tenantColors.text,
    fontSize: typography.body.fontSize,
  },
  // Searching
  searchingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.xl,
  },
  searchingLogo: {
    marginBottom: spacing.xl,
  },
  searchingTitle: {
    color: tenantColors.text,
    fontSize: typography.h3.fontSize,
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: spacing.sm,
  },
  searchingSubtitle: {
    color: tenantColors.textSecondary,
    fontSize: typography.body.fontSize,
    textAlign: 'center',
    paddingHorizontal: spacing.lg,
  },
  loader: {
    marginTop: spacing.xl,
  },
})
