import { useState, useMemo } from 'react'
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  TouchableOpacity, 
  TextInput,
  Alert,
} from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useRouter } from 'expo-router'
import { useAuth } from '@/contexts/AuthContext'
import { colors, spacing, typography, borderRadius } from '@/lib/theme'
import { formatCurrency } from '@/lib/mock-data'
import { 
  Building2, 
  DollarSign, 
  User,
  Phone,
  Mail,
  FileText,
  Upload,
  Check,
  ArrowLeft,
  Search,
  X,
} from 'lucide-react-native'

// Colores del tema advisor
const advisorTheme = {
  background: '#0c1427',
  surface: '#1a2744',
  border: '#2a3a5c',
  text: '#ffffff',
  textSecondary: '#a0aec0',
  textMuted: '#64748b',
  accent: '#c9a227',
}

export default function SaleRentRegistrationScreen() {
  const router = useRouter()
  const { agentCatalogProperties, agentCatalogRawData, loadAgentCatalogProperties, hasLoadedAgentCatalog, isAgentCatalogLoading } = useAuth()
  
  const [transactionType, setTransactionType] = useState<'rent' | 'sale'>('rent')
  const [selectedProperty, setSelectedProperty] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [showPropertyPicker, setShowPropertyPicker] = useState(false)
  const [priceOption, setPriceOption] = useState<'original' | 'min' | 'custom'>('original')
  const [customAmount, setCustomAmount] = useState('')
  const [clientName, setClientName] = useState('')
  const [clientPhone, setClientPhone] = useState('')
  const [clientEmail, setClientEmail] = useState('')
  const [referralCode, setReferralCode] = useState('')

  // Cargar propiedades si no están cargadas
  useState(() => {
    if (!hasLoadedAgentCatalog && !isAgentCatalogLoading) {
      loadAgentCatalogProperties()
    }
  })

  // Filtrar propiedades por búsqueda
  const filteredProperties = useMemo(() => {
    if (!searchQuery.trim()) return agentCatalogProperties
    const query = searchQuery.toLowerCase()
    return agentCatalogProperties.filter(p => 
      p.title.toLowerCase().includes(query) ||
      p.city.toLowerCase().includes(query)
    )
  }, [agentCatalogProperties, searchQuery])

  // Obtener datos de la propiedad seleccionada
  const selectedPropertyData = useMemo(() => {
    if (!selectedProperty) return null
    return agentCatalogProperties.find(p => p.id === selectedProperty)
  }, [selectedProperty, agentCatalogProperties])

  const selectedPropertyRaw = useMemo(() => {
    if (!selectedProperty) return null
    return agentCatalogRawData.find(p => p.id === selectedProperty)
  }, [selectedProperty, agentCatalogRawData])

  // Calcular el monto según la opción seleccionada
  const calculatedAmount = useMemo(() => {
    if (!selectedPropertyRaw) return ''
    
    if (priceOption === 'custom') {
      return customAmount
    }
    
    if (transactionType === 'rent') {
      if (priceOption === 'original') {
        return selectedPropertyRaw.monthlyRent?.toString() || ''
      } else if (priceOption === 'min') {
        return selectedPropertyRaw.minRent?.toString() || ''
      }
    } else {
      if (priceOption === 'original') {
        return selectedPropertyRaw.price?.toString() || ''
      } else if (priceOption === 'min') {
        return selectedPropertyRaw.minPrice?.toString() || ''
      }
    }
    return ''
  }, [selectedPropertyRaw, priceOption, transactionType, customAmount])

  const handleSelectProperty = (propertyId: string) => {
    setSelectedProperty(propertyId)
    setShowPropertyPicker(false)
    setSearchQuery('')
    setPriceOption('original')
    setCustomAmount('')
  }

  const handleSubmit = () => {
    if (!selectedProperty || !clientName || !clientPhone || !calculatedAmount) {
      Alert.alert('Error', 'Por favor completa todos los campos requeridos')
      return
    }
    Alert.alert(
      'Registro Enviado',
      'Tu registro de ' + (transactionType === 'sale' ? 'venta' : 'renta') + ' ha sido enviado para revision.',
      [{ text: 'OK', onPress: () => router.back() }]
    )
  }

  const renderPropertyItem = ({ item }: { item: typeof agentCatalogProperties[0] }) => {
    const rawData = agentCatalogRawData.find(p => p.id === item.id)
    const isSelected = selectedProperty === item.id
    
    return (
      <TouchableOpacity
        style={[styles.propertyItem, isSelected && styles.propertyItemSelected]}
        onPress={() => handleSelectProperty(item.id)}
      >
        <View style={styles.propertyItemContent}>
          <Text style={styles.propertyItemTitle} numberOfLines={1}>{item.title}</Text>
          <Text style={styles.propertyItemLocation}>{item.city}</Text>
          <View style={styles.propertyItemPrices}>
            {transactionType === 'rent' ? (
              <>
                <Text style={styles.propertyItemPrice}>
                  Renta: {formatCurrency(rawData?.monthlyRent || item.monthlyRent || 0)}
                </Text>
                {rawData?.minRent && (
                  <Text style={styles.propertyItemMinPrice}>
                    Min: {formatCurrency(rawData.minRent)}
                  </Text>
                )}
              </>
            ) : (
              <>
                <Text style={styles.propertyItemPrice}>
                  Precio: {formatCurrency(rawData?.price || item.price)}
                </Text>
                {rawData?.minPrice && (
                  <Text style={styles.propertyItemMinPrice}>
                    Min: {formatCurrency(rawData.minPrice)}
                  </Text>
                )}
              </>
            )}
          </View>
        </View>
        {isSelected && (
          <Check size={20} color={advisorTheme.accent} />
        )}
      </TouchableOpacity>
    )
  }

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <ArrowLeft size={24} color={advisorTheme.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Registrar Venta/Renta</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false} style={styles.scrollContent}>
        {/* Tipo de transaccion */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Tipo de Transaccion</Text>
          <View style={styles.toggleContainer}>
            <TouchableOpacity 
              style={[styles.toggleButton, transactionType === 'sale' && styles.toggleButtonActive]}
              onPress={() => {
                setTransactionType('sale')
                setPriceOption('original')
                setCustomAmount('')
              }}
            >
              <Text style={[styles.toggleText, transactionType === 'sale' && styles.toggleTextActive]}>
                Venta
              </Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={[styles.toggleButton, transactionType === 'rent' && styles.toggleButtonActive]}
              onPress={() => {
                setTransactionType('rent')
                setPriceOption('original')
                setCustomAmount('')
              }}
            >
              <Text style={[styles.toggleText, transactionType === 'rent' && styles.toggleTextActive]}>
                Renta
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Selector de propiedad */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Propiedad *</Text>
          
          {/* Campo de búsqueda */}
          <View style={styles.searchContainer}>
            <Search size={20} color={advisorTheme.textMuted} />
            <TextInput
              style={styles.searchInput}
              placeholder="Buscar propiedad por nombre o ciudad..."
              placeholderTextColor={advisorTheme.textMuted}
              value={searchQuery}
              onChangeText={(text) => {
                setSearchQuery(text)
                setShowPropertyPicker(true)
              }}
              onFocus={() => setShowPropertyPicker(true)}
            />
            {searchQuery.length > 0 && (
              <TouchableOpacity onPress={() => setSearchQuery('')}>
                <X size={20} color={advisorTheme.textMuted} />
              </TouchableOpacity>
            )}
          </View>

          {/* Propiedad seleccionada */}
          {selectedPropertyData && !showPropertyPicker && (
            <View style={styles.selectedPropertyCard}>
              <View style={styles.selectedPropertyContent}>
                <Building2 size={24} color={advisorTheme.accent} />
                <View style={styles.selectedPropertyInfo}>
                  <Text style={styles.selectedPropertyTitle}>{selectedPropertyData.title}</Text>
                  <Text style={styles.selectedPropertyLocation}>{selectedPropertyData.city}</Text>
                </View>
              </View>
              <TouchableOpacity onPress={() => setShowPropertyPicker(true)}>
                <Text style={styles.changeButton}>Cambiar</Text>
              </TouchableOpacity>
            </View>
          )}

          {/* Lista de propiedades */}
          {showPropertyPicker && (
            <View style={styles.propertyListContainer}>
              <ScrollView style={styles.propertyList} nestedScrollEnabled={true}>
                {isAgentCatalogLoading ? (
                  <View style={styles.emptyList}>
                    <Text style={styles.emptyListText}>Cargando propiedades...</Text>
                  </View>
                ) : filteredProperties.length === 0 ? (
                  <View style={styles.emptyList}>
                    <Text style={styles.emptyListText}>No se encontraron propiedades</Text>
                  </View>
                ) : (
                  filteredProperties.map((item) => (
                    <View key={item.id}>
                      {renderPropertyItem({ item })}
                    </View>
                  ))
                )}
              </ScrollView>
              <TouchableOpacity 
                style={styles.closeListButton}
                onPress={() => setShowPropertyPicker(false)}
              >
                <Text style={styles.closeListButtonText}>Cerrar</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>

        {/* Opciones de precio (solo si hay propiedad seleccionada) */}
        {selectedPropertyRaw && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>
              {transactionType === 'sale' ? 'Precio de Venta' : 'Renta Mensual'} *
            </Text>
            
            <View style={styles.priceOptionsContainer}>
              {/* Precio original */}
              <TouchableOpacity 
                style={[styles.priceOption, priceOption === 'original' && styles.priceOptionActive]}
                onPress={() => setPriceOption('original')}
              >
                <View style={styles.priceOptionRadio}>
                  {priceOption === 'original' && <View style={styles.priceOptionRadioInner} />}
                </View>
                <View style={styles.priceOptionContent}>
                  <Text style={styles.priceOptionLabel}>Precio Original</Text>
                  <Text style={styles.priceOptionValue}>
                    {transactionType === 'rent' 
                      ? formatCurrency(selectedPropertyRaw.monthlyRent || 0)
                      : formatCurrency(selectedPropertyRaw.price || 0)
                    }
                  </Text>
                </View>
              </TouchableOpacity>

              {/* Precio mínimo */}
              {(transactionType === 'rent' ? selectedPropertyRaw.minRent : selectedPropertyRaw.minPrice) && (
                <TouchableOpacity 
                  style={[styles.priceOption, priceOption === 'min' && styles.priceOptionActive]}
                  onPress={() => setPriceOption('min')}
                >
                  <View style={styles.priceOptionRadio}>
                    {priceOption === 'min' && <View style={styles.priceOptionRadioInner} />}
                  </View>
                  <View style={styles.priceOptionContent}>
                    <Text style={styles.priceOptionLabel}>Precio Minimo</Text>
                    <Text style={styles.priceOptionValue}>
                      {transactionType === 'rent' 
                        ? formatCurrency(selectedPropertyRaw.minRent || 0)
                        : formatCurrency(selectedPropertyRaw.minPrice || 0)
                      }
                    </Text>
                  </View>
                </TouchableOpacity>
              )}

              {/* Precio personalizado */}
              <TouchableOpacity 
                style={[styles.priceOption, priceOption === 'custom' && styles.priceOptionActive]}
                onPress={() => setPriceOption('custom')}
              >
                <View style={styles.priceOptionRadio}>
                  {priceOption === 'custom' && <View style={styles.priceOptionRadioInner} />}
                </View>
                <View style={styles.priceOptionContent}>
                  <Text style={styles.priceOptionLabel}>Precio Personalizado</Text>
                </View>
              </TouchableOpacity>

              {priceOption === 'custom' && (
                <View style={styles.customPriceContainer}>
                  <DollarSign size={20} color={advisorTheme.accent} />
                  <TextInput
                    style={styles.customPriceInput}
                    placeholder="Ingresa el monto"
                    placeholderTextColor={advisorTheme.textMuted}
                    value={customAmount}
                    onChangeText={setCustomAmount}
                    keyboardType="numeric"
                  />
                </View>
              )}
            </View>

            {/* Monto final */}
            {calculatedAmount && (
              <View style={styles.finalAmountContainer}>
                <Text style={styles.finalAmountLabel}>Monto a registrar:</Text>
                <Text style={styles.finalAmountValue}>{formatCurrency(Number(calculatedAmount))}</Text>
              </View>
            )}
          </View>
        )}

        {/* Datos del cliente */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Datos del Cliente</Text>
          
          <View style={styles.inputContainer}>
            <User size={20} color={advisorTheme.accent} />
            <TextInput
              style={styles.input}
              placeholder="Nombre completo *"
              placeholderTextColor={advisorTheme.textMuted}
              value={clientName}
              onChangeText={setClientName}
            />
          </View>

          <View style={styles.inputContainer}>
            <Phone size={20} color={advisorTheme.accent} />
            <TextInput
              style={styles.input}
              placeholder="Telefono *"
              placeholderTextColor={advisorTheme.textMuted}
              value={clientPhone}
              onChangeText={setClientPhone}
              keyboardType="phone-pad"
            />
          </View>

          <View style={styles.inputContainer}>
            <Mail size={20} color={advisorTheme.accent} />
            <TextInput
              style={styles.input}
              placeholder="Correo electronico (opcional)"
              placeholderTextColor={advisorTheme.textMuted}
              value={clientEmail}
              onChangeText={setClientEmail}
              keyboardType="email-address"
              autoCapitalize="none"
            />
          </View>
        </View>

        {/* Codigo de referido */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Codigo de Referido (opcional)</Text>
          <View style={styles.inputContainer}>
            <FileText size={20} color={advisorTheme.accent} />
            <TextInput
              style={styles.input}
              placeholder="Ingresa el codigo"
              placeholderTextColor={advisorTheme.textMuted}
              value={referralCode}
              onChangeText={setReferralCode}
              autoCapitalize="characters"
            />
          </View>
        </View>

        {/* Documentos */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Documentos</Text>
          <TouchableOpacity style={styles.uploadButton}>
            <Upload size={24} color={advisorTheme.accent} />
            <Text style={styles.uploadButtonText}>Subir documentos</Text>
            <Text style={styles.uploadHint}>Contrato, identificaciones, etc.</Text>
          </TouchableOpacity>
        </View>

        {/* Boton de enviar */}
        <TouchableOpacity 
          style={[styles.submitButton, (!selectedProperty || !clientName || !clientPhone || !calculatedAmount) && styles.submitButtonDisabled]} 
          onPress={handleSubmit}
          disabled={!selectedProperty || !clientName || !clientPhone || !calculatedAmount}
        >
          <Text style={styles.submitButtonText}>Enviar Registro</Text>
        </TouchableOpacity>

        <View style={styles.bottomSpacing} />
      </ScrollView>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: advisorTheme.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: advisorTheme.border,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: borderRadius.full,
    backgroundColor: advisorTheme.surface,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: typography.h4.fontSize,
    fontWeight: '700',
    color: advisorTheme.text,
  },
  scrollContent: {
    flex: 1,
  },
  section: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
  },
  sectionTitle: {
    fontSize: typography.bodySmall.fontSize,
    fontWeight: '600',
    color: advisorTheme.accent,
    marginBottom: spacing.md,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  toggleContainer: {
    flexDirection: 'row',
    backgroundColor: advisorTheme.surface,
    borderRadius: borderRadius.lg,
    padding: spacing.xs,
  },
  toggleButton: {
    flex: 1,
    paddingVertical: spacing.md,
    alignItems: 'center',
    borderRadius: borderRadius.md,
  },
  toggleButtonActive: {
    backgroundColor: advisorTheme.accent,
  },
  toggleText: {
    fontSize: typography.body.fontSize,
    fontWeight: '600',
    color: advisorTheme.textMuted,
  },
  toggleTextActive: {
    color: advisorTheme.background,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: advisorTheme.surface,
    borderRadius: borderRadius.lg,
    paddingHorizontal: spacing.md,
    borderWidth: 1,
    borderColor: advisorTheme.border,
    marginBottom: spacing.md,
  },
  searchInput: {
    flex: 1,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.sm,
    fontSize: typography.body.fontSize,
    color: advisorTheme.text,
  },
  selectedPropertyCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: advisorTheme.surface,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: advisorTheme.accent,
  },
  selectedPropertyContent: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    gap: spacing.md,
  },
  selectedPropertyInfo: {
    flex: 1,
  },
  selectedPropertyTitle: {
    fontSize: typography.body.fontSize,
    fontWeight: '600',
    color: advisorTheme.text,
  },
  selectedPropertyLocation: {
    fontSize: typography.bodySmall.fontSize,
    color: advisorTheme.textSecondary,
    marginTop: 2,
  },
  changeButton: {
    fontSize: typography.bodySmall.fontSize,
    fontWeight: '600',
    color: advisorTheme.accent,
  },
  propertyListContainer: {
    backgroundColor: advisorTheme.surface,
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    borderColor: advisorTheme.border,
    maxHeight: 300,
    overflow: 'hidden',
  },
  propertyList: {
    maxHeight: 250,
  },
  propertyItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: advisorTheme.border,
  },
  propertyItemSelected: {
    backgroundColor: advisorTheme.background,
  },
  propertyItemContent: {
    flex: 1,
  },
  propertyItemTitle: {
    fontSize: typography.body.fontSize,
    fontWeight: '600',
    color: advisorTheme.text,
  },
  propertyItemLocation: {
    fontSize: typography.caption.fontSize,
    color: advisorTheme.textMuted,
    marginTop: 2,
  },
  propertyItemPrices: {
    flexDirection: 'row',
    gap: spacing.md,
    marginTop: spacing.xs,
  },
  propertyItemPrice: {
    fontSize: typography.bodySmall.fontSize,
    color: advisorTheme.accent,
  },
  propertyItemMinPrice: {
    fontSize: typography.bodySmall.fontSize,
    color: advisorTheme.textSecondary,
  },
  closeListButton: {
    padding: spacing.md,
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: advisorTheme.border,
  },
  closeListButtonText: {
    fontSize: typography.body.fontSize,
    fontWeight: '600',
    color: advisorTheme.accent,
  },
  emptyList: {
    padding: spacing.xl,
    alignItems: 'center',
  },
  emptyListText: {
    fontSize: typography.body.fontSize,
    color: advisorTheme.textMuted,
  },
  priceOptionsContainer: {
    gap: spacing.sm,
  },
  priceOption: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: advisorTheme.surface,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: advisorTheme.border,
  },
  priceOptionActive: {
    borderColor: advisorTheme.accent,
  },
  priceOptionRadio: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: advisorTheme.accent,
    marginRight: spacing.md,
    justifyContent: 'center',
    alignItems: 'center',
  },
  priceOptionRadioInner: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: advisorTheme.accent,
  },
  priceOptionContent: {
    flex: 1,
  },
  priceOptionLabel: {
    fontSize: typography.body.fontSize,
    color: advisorTheme.text,
  },
  priceOptionValue: {
    fontSize: typography.bodySmall.fontSize,
    color: advisorTheme.accent,
    fontWeight: '600',
    marginTop: 2,
  },
  customPriceContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: advisorTheme.surface,
    borderRadius: borderRadius.lg,
    paddingHorizontal: spacing.md,
    borderWidth: 1,
    borderColor: advisorTheme.accent,
    marginTop: spacing.sm,
  },
  customPriceInput: {
    flex: 1,
    paddingVertical: spacing.md,
    paddingLeft: spacing.md,
    fontSize: typography.body.fontSize,
    color: advisorTheme.text,
  },
  finalAmountContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: advisorTheme.accent + '20',
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    marginTop: spacing.md,
  },
  finalAmountLabel: {
    fontSize: typography.body.fontSize,
    color: advisorTheme.text,
  },
  finalAmountValue: {
    fontSize: typography.h4.fontSize,
    fontWeight: '700',
    color: advisorTheme.accent,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: advisorTheme.surface,
    borderRadius: borderRadius.lg,
    paddingHorizontal: spacing.md,
    marginBottom: spacing.md,
    borderWidth: 1,
    borderColor: advisorTheme.border,
  },
  input: {
    flex: 1,
    paddingVertical: spacing.md,
    paddingLeft: spacing.md,
    fontSize: typography.body.fontSize,
    color: advisorTheme.text,
  },
  uploadButton: {
    alignItems: 'center',
    backgroundColor: advisorTheme.surface,
    borderRadius: borderRadius.lg,
    padding: spacing.xl,
    borderWidth: 2,
    borderStyle: 'dashed',
    borderColor: advisorTheme.border,
  },
  uploadButtonText: {
    fontSize: typography.body.fontSize,
    fontWeight: '600',
    color: advisorTheme.text,
    marginTop: spacing.sm,
  },
  uploadHint: {
    fontSize: typography.caption.fontSize,
    color: advisorTheme.textMuted,
    marginTop: spacing.xs,
  },
  submitButton: {
    backgroundColor: advisorTheme.accent,
    marginHorizontal: spacing.md,
    marginTop: spacing.lg,
    paddingVertical: spacing.md,
    borderRadius: borderRadius.lg,
    alignItems: 'center',
  },
  submitButtonDisabled: {
    opacity: 0.5,
  },
  submitButtonText: {
    fontSize: typography.body.fontSize,
    fontWeight: '700',
    color: advisorTheme.background,
  },
  bottomSpacing: {
    height: spacing.xxl,
  },
})
