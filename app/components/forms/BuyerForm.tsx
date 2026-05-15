import React, { useState, useEffect, useRef } from 'react'
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Animated,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Dimensions,
} from 'react-native'
import { useRouter } from 'expo-router'
import { 
  User, 
  Mail, 
  Phone, 
  Lock, 
  Eye, 
  EyeOff, 
  ArrowLeft,
  MapPin,
  Home,
  Key,
  Search,
  ChevronRight,
  Check,
  Building2,
} from 'lucide-react-native'
import { useAuth } from '@/lib/auth-context'
import { spacing, typography, borderRadius, clientThemes } from '@/lib/theme'
import { mockProperties } from '@/lib/mock-data'
import LogoGris from '@/app/assets/LogoInicioSVGris.svg'

const { width } = Dimensions.get('window')

// Colores del tema buscador (verde, blanco, tonos cálidos)
const theme = clientThemes.searching

interface BuyerFormProps {
  onBack: () => void
}

type Step = 'name' | 'email' | 'phone' | 'password' | 'search-preferences' | 'loading' | 'suggestions'

export default function BuyerForm({ onBack }: BuyerFormProps) {
  const router = useRouter()
  const { setCurrentUser } = useAuth()
  
  // Estados del formulario
  const [step, setStep] = useState<Step>('name')
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    location: '',
    searchType: '' as 'buy' | 'rent' | '',
  })
  const [showPassword, setShowPassword] = useState(false)
  const [suggestedProperties, setSuggestedProperties] = useState<typeof mockProperties>([])
  
  // Animaciones
  const fadeAnim = useRef(new Animated.Value(0)).current
  const slideAnim = useRef(new Animated.Value(30)).current
  const progressAnim = useRef(new Animated.Value(0)).current
  const pulseAnim = useRef(new Animated.Value(1)).current
  const dotsAnim = useRef([
    new Animated.Value(0),
    new Animated.Value(0),
    new Animated.Value(0),
  ]).current

  // Ubicaciones sugeridas
  const suggestedLocations = [
    'Ciudad de Mexico',
    'Monterrey',
    'Guadalajara',
    'Merida',
    'Queretaro',
    'Cancun',
  ]

  const steps: Step[] = ['name', 'email', 'phone', 'password', 'search-preferences', 'loading', 'suggestions']
  const currentStepIndex = steps.indexOf(step)
  const totalSteps = 5 // Solo contamos hasta search-preferences para el progreso

  useEffect(() => {
    // Animación de entrada
    fadeAnim.setValue(0)
    slideAnim.setValue(30)
    
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 400,
        useNativeDriver: true,
      }),
      Animated.spring(slideAnim, {
        toValue: 0,
        tension: 50,
        friction: 8,
        useNativeDriver: true,
      }),
    ]).start()

    // Actualizar barra de progreso
    const progress = Math.min(currentStepIndex + 1, totalSteps) / totalSteps
    Animated.timing(progressAnim, {
      toValue: progress,
      duration: 300,
      useNativeDriver: false,
    }).start()
  }, [step])

  // Animación de carga
  useEffect(() => {
    if (step === 'loading') {
      // Pulso del logo
      const pulseLoop = Animated.loop(
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
      pulseLoop.start()

      // Animación de puntos
      const animateDots = () => {
        dotsAnim.forEach((dot, index) => {
          Animated.sequence([
            Animated.delay(index * 200),
            Animated.loop(
              Animated.sequence([
                Animated.timing(dot, {
                  toValue: 1,
                  duration: 400,
                  useNativeDriver: true,
                }),
                Animated.timing(dot, {
                  toValue: 0,
                  duration: 400,
                  useNativeDriver: true,
                }),
              ])
            ),
          ]).start()
        })
      }
      animateDots()

      // Simular búsqueda y pasar a sugerencias
      const timer = setTimeout(() => {
        // Filtrar propiedades según preferencias
        let filtered = mockProperties.filter(p => {
          if (formData.searchType === 'rent') {
            return p.status === 'for_rent' || p.status === 'available'
          } else if (formData.searchType === 'buy') {
            return p.status === 'for_sale' || p.status === 'available'
          }
          return true
        })
        
        // Si hay ubicación, filtrar por ciudad
        if (formData.location) {
          const locationLower = formData.location.toLowerCase()
          filtered = filtered.filter(p => 
            p.city?.toLowerCase().includes(locationLower) ||
            p.address?.toLowerCase().includes(locationLower)
          )
        }

        // Tomar las primeras 3-4 propiedades
        setSuggestedProperties(filtered.slice(0, 4))
        setStep('suggestions')
      }, 2500)

      return () => {
        clearTimeout(timer)
        pulseLoop.stop()
      }
    }
  }, [step])

  const handleNext = () => {
    switch (step) {
      case 'name':
        if (formData.name.trim()) setStep('email')
        break
      case 'email':
        if (formData.email.trim()) setStep('phone')
        break
      case 'phone':
        if (formData.phone.trim()) setStep('password')
        break
      case 'password':
        if (formData.password.trim()) setStep('search-preferences')
        break
      case 'search-preferences':
        if (formData.searchType) {
          setStep('loading')
        }
        break
    }
  }

  const handleBack = () => {
    switch (step) {
      case 'email':
        setStep('name')
        break
      case 'phone':
        setStep('email')
        break
      case 'password':
        setStep('phone')
        break
      case 'search-preferences':
        setStep('password')
        break
      default:
        onBack()
    }
  }

  const handleSkipPreferences = () => {
    // Ir directo al dashboard sin preferencias
    completeRegistration()
  }

  const completeRegistration = () => {
    setCurrentUser({
      id: 'new-buyer',
      name: formData.name,
      email: formData.email,
      phone: formData.phone,
      role: 'searching',
      avatar: undefined,
      createdAt: new Date().toISOString(),
    })
    router.replace('/(tabs)')
  }

  const handlePropertySelect = (propertyId: string) => {
    // Completar registro y navegar a la propiedad
    setCurrentUser({
      id: 'new-buyer',
      name: formData.name,
      email: formData.email,
      phone: formData.phone,
      role: 'searching',
      avatar: undefined,
      createdAt: new Date().toISOString(),
    })
    router.replace(`/catalog-screen?propertyId=${propertyId}`)
  }

  const handleExploreAll = () => {
    completeRegistration()
  }

  const canContinue = () => {
    switch (step) {
      case 'name':
        return formData.name.trim().length >= 2
      case 'email':
        return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)
      case 'phone':
        return formData.phone.trim().length >= 10
      case 'password':
        return formData.password.length >= 6
      case 'search-preferences':
        return formData.searchType !== ''
      default:
        return false
    }
  }

  const getStepContent = () => {
    switch (step) {
      case 'name':
        return {
          title: 'Hola, bienvenido',
          subtitle: 'Empecemos con tu nombre',
          hint: 'Asi te llamaremos en la app',
          icon: User,
          placeholder: 'Tu nombre completo',
          value: formData.name,
          onChange: (text: string) => setFormData({ ...formData, name: text }),
          keyboardType: 'default' as const,
        }
      case 'email':
        return {
          title: 'Mantente conectado',
          subtitle: 'Tu correo electronico',
          hint: 'Para enviarte las mejores opciones',
          icon: Mail,
          placeholder: 'correo@ejemplo.com',
          value: formData.email,
          onChange: (text: string) => setFormData({ ...formData, email: text }),
          keyboardType: 'email-address' as const,
        }
      case 'phone':
        return {
          title: 'Una linea directa',
          subtitle: 'Tu numero de telefono',
          hint: 'Solo para contactarte sobre propiedades de tu interes',
          icon: Phone,
          placeholder: '55 1234 5678',
          value: formData.phone,
          onChange: (text: string) => setFormData({ ...formData, phone: text }),
          keyboardType: 'phone-pad' as const,
        }
      case 'password':
        return {
          title: 'Protege tu cuenta',
          subtitle: 'Crea una contrasena segura',
          hint: 'Minimo 6 caracteres',
          icon: Lock,
          placeholder: 'Tu contrasena',
          value: formData.password,
          onChange: (text: string) => setFormData({ ...formData, password: text }),
          keyboardType: 'default' as const,
          secureTextEntry: true,
        }
      default:
        return null
    }
  }

  const renderInputStep = () => {
    const content = getStepContent()
    if (!content) return null

    const Icon = content.icon

    return (
      <Animated.View 
        style={[
          styles.stepContainer,
          {
            opacity: fadeAnim,
            transform: [{ translateY: slideAnim }],
          }
        ]}
      >
        <View style={styles.stepHeader}>
          <Text style={styles.stepTitle}>{content.title}</Text>
          <Text style={styles.stepSubtitle}>{content.subtitle}</Text>
        </View>

        <View style={styles.inputContainer}>
          <View style={styles.inputWrapper}>
            <Icon size={20} color={theme.textMuted} />
            <TextInput
              style={styles.input}
              placeholder={content.placeholder}
              placeholderTextColor={theme.textMuted}
              value={content.value}
              onChangeText={content.onChange}
              keyboardType={content.keyboardType}
              secureTextEntry={content.secureTextEntry && !showPassword}
              autoFocus
            />
            {content.secureTextEntry && (
              <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
                {showPassword ? (
                  <EyeOff size={20} color={theme.textMuted} />
                ) : (
                  <Eye size={20} color={theme.textMuted} />
                )}
              </TouchableOpacity>
            )}
          </View>
          <Text style={styles.inputHint}>{content.hint}</Text>
        </View>

        <TouchableOpacity
          style={[styles.continueButton, !canContinue() && styles.continueButtonDisabled]}
          onPress={handleNext}
          disabled={!canContinue()}
        >
          <Text style={styles.continueButtonText}>Continuar</Text>
          <ChevronRight size={20} color={theme.textLight} />
        </TouchableOpacity>
      </Animated.View>
    )
  }

  const renderSearchPreferences = () => (
    <Animated.View 
      style={[
        styles.stepContainer,
        {
          opacity: fadeAnim,
          transform: [{ translateY: slideAnim }],
        }
      ]}
    >
      <View style={styles.stepHeader}>
        <Text style={styles.stepTitle}>Que estas buscando?</Text>
        <Text style={styles.stepSubtitle}>Cuentanos para mostrarte las mejores opciones</Text>
      </View>

      {/* Selector de tipo: Comprar o Rentar */}
      <View style={styles.searchTypeContainer}>
        <TouchableOpacity
          style={[
            styles.searchTypeOption,
            formData.searchType === 'buy' && styles.searchTypeOptionSelected,
          ]}
          onPress={() => setFormData({ ...formData, searchType: 'buy' })}
        >
          <View style={[
            styles.searchTypeIcon,
            formData.searchType === 'buy' && styles.searchTypeIconSelected,
          ]}>
            <Key size={28} color={formData.searchType === 'buy' ? theme.surface : theme.primary} />
          </View>
          <Text style={[
            styles.searchTypeTitle,
            formData.searchType === 'buy' && styles.searchTypeTitleSelected,
          ]}>
            Comprar
          </Text>
          <Text style={styles.searchTypeDesc}>Encuentra tu proximo hogar</Text>
          {formData.searchType === 'buy' && (
            <View style={styles.checkBadge}>
              <Check size={14} color={theme.surface} />
            </View>
          )}
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.searchTypeOption,
            formData.searchType === 'rent' && styles.searchTypeOptionSelected,
          ]}
          onPress={() => setFormData({ ...formData, searchType: 'rent' })}
        >
          <View style={[
            styles.searchTypeIcon,
            formData.searchType === 'rent' && styles.searchTypeIconSelected,
          ]}>
            <Home size={28} color={formData.searchType === 'rent' ? theme.surface : theme.primary} />
          </View>
          <Text style={[
            styles.searchTypeTitle,
            formData.searchType === 'rent' && styles.searchTypeTitleSelected,
          ]}>
            Rentar
          </Text>
          <Text style={styles.searchTypeDesc}>Opciones flexibles para ti</Text>
          {formData.searchType === 'rent' && (
            <View style={styles.checkBadge}>
              <Check size={14} color={theme.surface} />
            </View>
          )}
        </TouchableOpacity>
      </View>

      {/* Input de ubicación */}
      <View style={styles.locationSection}>
        <Text style={styles.locationLabel}>Donde te gustaria buscar?</Text>
        <View style={styles.locationInputWrapper}>
          <MapPin size={20} color={theme.textMuted} />
          <TextInput
            style={styles.locationInput}
            placeholder="Ciudad, zona o colonia..."
            placeholderTextColor={theme.textMuted}
            value={formData.location}
            onChangeText={(text) => setFormData({ ...formData, location: text })}
          />
          {formData.location && (
            <TouchableOpacity onPress={() => setFormData({ ...formData, location: '' })}>
              <Text style={styles.clearButton}>Limpiar</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Sugerencias de ubicación */}
        <View style={styles.suggestedLocations}>
          {suggestedLocations.slice(0, 4).map((loc) => (
            <TouchableOpacity
              key={loc}
              style={[
                styles.locationChip,
                formData.location === loc && styles.locationChipSelected,
              ]}
              onPress={() => setFormData({ ...formData, location: loc })}
            >
              <Text style={[
                styles.locationChipText,
                formData.location === loc && styles.locationChipTextSelected,
              ]}>
                {loc}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      <View style={styles.preferencesButtons}>
        <TouchableOpacity
          style={[styles.continueButton, !canContinue() && styles.continueButtonDisabled]}
          onPress={handleNext}
          disabled={!canContinue()}
        >
          <Search size={20} color={theme.textLight} />
          <Text style={styles.continueButtonText}>Buscar propiedades</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.skipButton} onPress={handleSkipPreferences}>
          <Text style={styles.skipButtonText}>Prefiero explorar todo</Text>
        </TouchableOpacity>
      </View>
    </Animated.View>
  )

  const renderLoading = () => (
    <View style={styles.loadingContainer}>
      <Animated.View style={{ transform: [{ scale: pulseAnim }] }}>
        <LogoGris width={200} height={70} />
      </Animated.View>

      <View style={styles.loadingTextContainer}>
        <Text style={styles.loadingText}>Buscando las mejores opciones</Text>
        <View style={styles.dotsContainer}>
          {dotsAnim.map((anim, index) => (
            <Animated.View
              key={index}
              style={[
                styles.dot,
                {
                  opacity: anim.interpolate({
                    inputRange: [0, 1],
                    outputRange: [0.3, 1],
                  }),
                  transform: [{
                    scale: anim.interpolate({
                      inputRange: [0, 1],
                      outputRange: [0.8, 1.2],
                    }),
                  }],
                },
              ]}
            />
          ))}
        </View>
      </View>

      <Text style={styles.loadingSubtext}>
        {formData.searchType === 'buy' ? 'Propiedades en venta' : 'Propiedades en renta'}
        {formData.location ? ` en ${formData.location}` : ''}
      </Text>
    </View>
  )

  const renderSuggestions = () => (
    <Animated.View 
      style={[
        styles.suggestionsContainer,
        {
          opacity: fadeAnim,
          transform: [{ translateY: slideAnim }],
        }
      ]}
    >
      <View style={styles.suggestionsHeader}>
        <Text style={styles.suggestionsTitle}>
          {suggestedProperties.length > 0 
            ? 'Encontramos opciones para ti!' 
            : 'Explora nuestro catalogo'}
        </Text>
        <Text style={styles.suggestionsSubtitle}>
          {suggestedProperties.length > 0
            ? 'Selecciona una para ver mas detalles'
            : 'Miles de propiedades te esperan'}
        </Text>
      </View>

      {suggestedProperties.length > 0 ? (
        <ScrollView style={styles.propertiesList} showsVerticalScrollIndicator={false}>
          {suggestedProperties.map((property) => (
            <TouchableOpacity
              key={property.id}
              style={styles.propertyCard}
              onPress={() => handlePropertySelect(property.id)}
            >
              <View style={styles.propertyIconContainer}>
                <Building2 size={24} color={theme.primary} />
              </View>
              <View style={styles.propertyInfo}>
                <Text style={styles.propertyTitle} numberOfLines={1}>{property.title}</Text>
                <View style={styles.propertyLocation}>
                  <MapPin size={12} color={theme.textMuted} />
                  <Text style={styles.propertyAddress} numberOfLines={1}>
                    {property.address}, {property.city}
                  </Text>
                </View>
                <Text style={styles.propertyPrice}>
                  ${property.price?.toLocaleString('es-MX')}
                  {formData.searchType === 'rent' && property.monthlyRent && '/mes'}
                </Text>
              </View>
              <ChevronRight size={20} color={theme.textMuted} />
            </TouchableOpacity>
          ))}
        </ScrollView>
      ) : (
        <View style={styles.noResultsContainer}>
          <Search size={48} color={theme.textMuted} />
          <Text style={styles.noResultsText}>
            No encontramos propiedades con esos criterios, pero tenemos muchas mas opciones
          </Text>
        </View>
      )}

      <TouchableOpacity style={styles.exploreAllButton} onPress={handleExploreAll}>
        <Text style={styles.exploreAllButtonText}>Explorar todo el catalogo</Text>
        <ChevronRight size={20} color={theme.surface} />
      </TouchableOpacity>
    </Animated.View>
  )

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      {/* Header con progreso */}
      {step !== 'loading' && step !== 'suggestions' && (
        <View style={styles.header}>
          <TouchableOpacity style={styles.backButton} onPress={handleBack}>
            <ArrowLeft size={24} color={theme.text} />
          </TouchableOpacity>

          <View style={styles.progressContainer}>
            <View style={styles.progressBar}>
              <Animated.View 
                style={[
                  styles.progressFill,
                  {
                    width: progressAnim.interpolate({
                      inputRange: [0, 1],
                      outputRange: ['0%', '100%'],
                    }),
                  }
                ]}
              />
            </View>
            <Text style={styles.progressText}>
              Paso {Math.min(currentStepIndex + 1, totalSteps)} de {totalSteps}
            </Text>
          </View>

          <View style={styles.headerPlaceholder} />
        </View>
      )}

      <ScrollView 
        style={styles.content}
        contentContainerStyle={styles.contentContainer}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {step === 'loading' && renderLoading()}
        {step === 'suggestions' && renderSuggestions()}
        {step === 'search-preferences' && renderSearchPreferences()}
        {['name', 'email', 'phone', 'password'].includes(step) && renderInputStep()}
      </ScrollView>
    </KeyboardAvoidingView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    gap: spacing.md,
  },
  backButton: {
    width: 44,
    height: 44,
    borderRadius: borderRadius.full,
    backgroundColor: theme.surface,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: theme.border,
  },
  progressContainer: {
    flex: 1,
    gap: spacing.xs,
  },
  progressBar: {
    height: 4,
    backgroundColor: theme.border,
    borderRadius: borderRadius.full,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: theme.primary,
    borderRadius: borderRadius.full,
  },
  progressText: {
    fontSize: typography.caption.fontSize,
    color: theme.textMuted,
    textAlign: 'center',
  },
  headerPlaceholder: {
    width: 44,
  },
  content: {
    flex: 1,
  },
  contentContainer: {
    flexGrow: 1,
    padding: spacing.lg,
  },
  stepContainer: {
    flex: 1,
    justifyContent: 'center',
    gap: spacing.xl,
  },
  stepHeader: {
    gap: spacing.sm,
  },
  stepTitle: {
    fontSize: 28,
    fontWeight: '700',
    color: theme.text,
  },
  stepSubtitle: {
    fontSize: typography.body.fontSize,
    color: theme.textSecondary,
    lineHeight: 24,
  },
  inputContainer: {
    gap: spacing.sm,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.surface,
    borderRadius: borderRadius.lg,
    paddingHorizontal: spacing.md,
    borderWidth: 1,
    borderColor: theme.border,
    gap: spacing.sm,
  },
  input: {
    flex: 1,
    paddingVertical: spacing.md,
    fontSize: typography.body.fontSize,
    color: theme.text,
  },
  inputHint: {
    fontSize: typography.caption.fontSize,
    color: theme.textMuted,
    paddingLeft: spacing.xs,
  },
  continueButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: theme.primary,
    borderRadius: borderRadius.lg,
    paddingVertical: spacing.md,
    gap: spacing.sm,
  },
  continueButtonDisabled: {
    backgroundColor: theme.border,
  },
  continueButtonText: {
    fontSize: typography.body.fontSize,
    fontWeight: '600',
    color: theme.textLight,
  },
  // Search preferences
  searchTypeContainer: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  searchTypeOption: {
    flex: 1,
    backgroundColor: theme.surface,
    borderRadius: borderRadius.xl,
    padding: spacing.lg,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: theme.border,
    gap: spacing.sm,
    position: 'relative',
  },
  searchTypeOptionSelected: {
    borderColor: theme.primary,
    backgroundColor: theme.primary + '08',
  },
  searchTypeIcon: {
    width: 56,
    height: 56,
    borderRadius: borderRadius.full,
    backgroundColor: theme.warmLight,
    justifyContent: 'center',
    alignItems: 'center',
  },
  searchTypeIconSelected: {
    backgroundColor: theme.primary,
  },
  searchTypeTitle: {
    fontSize: typography.h4.fontSize,
    fontWeight: '600',
    color: theme.text,
  },
  searchTypeTitleSelected: {
    color: theme.primary,
  },
  searchTypeDesc: {
    fontSize: typography.caption.fontSize,
    color: theme.textMuted,
    textAlign: 'center',
  },
  checkBadge: {
    position: 'absolute',
    top: spacing.sm,
    right: spacing.sm,
    width: 24,
    height: 24,
    borderRadius: borderRadius.full,
    backgroundColor: theme.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  locationSection: {
    gap: spacing.sm,
  },
  locationLabel: {
    fontSize: typography.body.fontSize,
    fontWeight: '500',
    color: theme.text,
  },
  locationInputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.surface,
    borderRadius: borderRadius.lg,
    paddingHorizontal: spacing.md,
    borderWidth: 1,
    borderColor: theme.border,
    gap: spacing.sm,
  },
  locationInput: {
    flex: 1,
    paddingVertical: spacing.md,
    fontSize: typography.body.fontSize,
    color: theme.text,
  },
  clearButton: {
    fontSize: typography.caption.fontSize,
    color: theme.primary,
    fontWeight: '500',
  },
  suggestedLocations: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
    marginTop: spacing.xs,
  },
  locationChip: {
    backgroundColor: theme.warmLight,
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.md,
    borderRadius: borderRadius.full,
    borderWidth: 1,
    borderColor: theme.warm,
  },
  locationChipSelected: {
    backgroundColor: theme.primary,
    borderColor: theme.primary,
  },
  locationChipText: {
    fontSize: typography.caption.fontSize,
    color: theme.warm,
    fontWeight: '500',
  },
  locationChipTextSelected: {
    color: theme.textLight,
  },
  preferencesButtons: {
    gap: spacing.md,
    marginTop: spacing.md,
  },
  skipButton: {
    alignItems: 'center',
    paddingVertical: spacing.sm,
  },
  skipButtonText: {
    fontSize: typography.body.fontSize,
    color: theme.textMuted,
    textDecorationLine: 'underline',
  },
  // Loading
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: spacing.xl,
  },
  loadingTextContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  loadingText: {
    fontSize: typography.h4.fontSize,
    fontWeight: '500',
    color: theme.text,
  },
  dotsContainer: {
    flexDirection: 'row',
    gap: 4,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: theme.primary,
  },
  loadingSubtext: {
    fontSize: typography.body.fontSize,
    color: theme.textMuted,
  },
  // Suggestions
  suggestionsContainer: {
    flex: 1,
    gap: spacing.lg,
  },
  suggestionsHeader: {
    gap: spacing.sm,
  },
  suggestionsTitle: {
    fontSize: 26,
    fontWeight: '700',
    color: theme.text,
  },
  suggestionsSubtitle: {
    fontSize: typography.body.fontSize,
    color: theme.textSecondary,
  },
  propertiesList: {
    flex: 1,
  },
  propertyCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.surface,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    marginBottom: spacing.sm,
    borderWidth: 1,
    borderColor: theme.border,
    gap: spacing.md,
  },
  propertyIconContainer: {
    width: 48,
    height: 48,
    borderRadius: borderRadius.lg,
    backgroundColor: theme.warmLight,
    justifyContent: 'center',
    alignItems: 'center',
  },
  propertyInfo: {
    flex: 1,
    gap: 2,
  },
  propertyTitle: {
    fontSize: typography.body.fontSize,
    fontWeight: '600',
    color: theme.text,
  },
  propertyLocation: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  propertyAddress: {
    fontSize: typography.caption.fontSize,
    color: theme.textMuted,
    flex: 1,
  },
  propertyPrice: {
    fontSize: typography.body.fontSize,
    fontWeight: '700',
    color: theme.primary,
  },
  noResultsContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: spacing.md,
    paddingVertical: spacing.xxl,
  },
  noResultsText: {
    fontSize: typography.body.fontSize,
    color: theme.textSecondary,
    textAlign: 'center',
    paddingHorizontal: spacing.lg,
    lineHeight: 24,
  },
  exploreAllButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: theme.primary,
    borderRadius: borderRadius.lg,
    paddingVertical: spacing.md,
    gap: spacing.sm,
    marginTop: 'auto',
  },
  exploreAllButtonText: {
    fontSize: typography.body.fontSize,
    fontWeight: '600',
    color: theme.surface,
  },
})
