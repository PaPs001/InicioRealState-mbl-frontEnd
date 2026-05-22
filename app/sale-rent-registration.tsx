import { useState, useMemo, useEffect } from 'react'
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  TouchableOpacity, 
  TextInput,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useRouter } from 'expo-router'
import { useAuth } from '@/contexts/AuthContext'
import { PropertyCatalogItemResponse } from '@/lib/api/endpoints/catalog'
import { spacing, typography, borderRadius } from '@/lib/theme'
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
  MapPin,
  Home,
  Briefcase,
  Camera,
  BedDouble,
  Bath,
  Car,
  Ruler,
  ChevronRight,
  Users,
  Wifi,
  Store,
} from 'lucide-react-native'

// Tema advisor
const advisorTheme = {
  background: '#0c1427',
  surface: '#1a2744',
  surfaceLight: '#243352',
  border: '#2a3a5c',
  text: '#ffffff',
  textSecondary: '#a0aec0',
  textMuted: '#64748b',
  accent: '#c9a227',
  success: '#10b981',
  error: '#ef4444',
}

// Tipos de pasos
type StepType = 
  | 'transaction-type'
  | 'listing-source'
  // Interno
  | 'select-property'
  | 'internal-price'
  // Externo
  | 'property-type'
  | 'property-details'
  | 'property-location'
  | 'property-amenities'
  | 'property-measurements'
  | 'property-photos'
  | 'property-pricing'
  | 'property-name'
  | 'owner-info'
  | 'external-agent-info'
  // Comun
  | 'client-info'
  | 'documents'
  | 'summary'

// Pasos para listado interno
const INTERNAL_STEPS: StepType[] = [
  'transaction-type',
  'listing-source',
  'select-property',
  'internal-price',
  'client-info',
  'documents',
  'summary',
]

// Pasos para listado externo
const EXTERNAL_STEPS: StepType[] = [
  'transaction-type',
  'listing-source',
  'property-type',
  'property-details',
  'property-location',
  'property-amenities',
  'property-measurements',
  'property-photos',
  'property-pricing',
  'property-name',
  'owner-info',
  'external-agent-info',
  'client-info',
  'documents',
  'summary',
]

// Tipos de propiedad
const PROPERTY_TYPES = [
  { id: 'house', label: 'Casa', icon: Home },
  { id: 'apartment', label: 'Apartamento', icon: Building2 },
  { id: 'land', label: 'Terreno', icon: MapPin },
  { id: 'office', label: 'Oficina', icon: Briefcase },
  { id: 'commercial', label: 'Local Comercial', icon: Store },
]

// Lista de amenidades
const AMENITIES_LIST = [
  'Alberca', 'Gimnasio', 'Jardin', 'Terraza', 'Estacionamiento techado',
  'Seguridad 24/7', 'Area de juegos', 'Salon de eventos', 'Roof garden',
  'Elevador', 'Bodega', 'Cuarto de servicio', 'Area de lavado', 'Pet friendly',
  'Aire acondicionado', 'Calefaccion', 'Cocina integral', 'Closets',
]

// Lista de documentos
const DOCUMENTS_LIST = [
  { id: 'ine', label: 'INE / Pasaporte', required: true },
  { id: 'address', label: 'Comprobante de domicilio', required: true },
  { id: 'deeds', label: 'Escrituras', required: false },
  { id: 'contract', label: 'Contrato', required: false },
  { id: 'rfc', label: 'RFC', required: false },
  { id: 'curp', label: 'CURP', required: false },
  { id: 'income', label: 'Comprobante de ingresos', required: false },
  { id: 'authorization', label: 'Carta de autorizacion', required: false },
  { id: 'legal', label: 'Documentos legales del inmueble', required: false },
]

// Tipo para archivos de documentos
type DocumentFiles = {
  [key: string]: { name: string; uri: string } | null
}

export default function SaleRentRegistrationScreen() {
  const router = useRouter()
  const { agentCatalogRawData, loadAgentCatalogProperties, hasLoadedAgentCatalog, isAgentCatalogLoading } = useAuth()

  // Estado del wizard
  const [currentStepIndex, setCurrentStepIndex] = useState(0)
  
  // Paso 1: Tipo de transaccion
  const [transactionType, setTransactionType] = useState<'sale' | 'rent' | null>(null)
  
  // Paso 2: Origen del listado
  const [listingSource, setListingSource] = useState<'internal' | 'external' | null>(null)
  
  // Estados para listado interno
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedProperty, setSelectedProperty] = useState<string | null>(null)
  const [priceOption, setPriceOption] = useState<'original' | 'min' | 'custom'>('original')
  const [customAmount, setCustomAmount] = useState('')
  
  // Estados para listado externo - Tipo de propiedad
  const [propertyType, setPropertyType] = useState<string | null>(null)
  
  // Estados para listado externo - Detalles
  const [bedrooms, setBedrooms] = useState('')
  const [bathrooms, setBathrooms] = useState('')
  const [halfBaths, setHalfBaths] = useState('')
  const [parking, setParking] = useState('')
  const [isFullyEquipped, setIsFullyEquipped] = useState(false)
  const [isFurnished, setIsFurnished] = useState(false)
  
  // Estados para listado externo - Ubicacion
  const [propertyAddress, setPropertyAddress] = useState('')
  const [propertyCity, setPropertyCity] = useState('')
  const [propertyMapsUrl, setPropertyMapsUrl] = useState('')
  
  // Estados para listado externo - Amenidades
  const [selectedAmenities, setSelectedAmenities] = useState<string[]>([])
  const [customAmenities, setCustomAmenities] = useState('')
  
  // Estados para listado externo - Medidas
  const [propertyLength, setPropertyLength] = useState('')
  const [propertyWidth, setPropertyWidth] = useState('')
  const [propertyArea, setPropertyArea] = useState('')
  const [constructionArea, setConstructionArea] = useState('')
  
  // Estados para listado externo - Fotos
  const [propertyPhotos, setPropertyPhotos] = useState<string[]>([])
  
  // Estados para listado externo - Precio
  const [propertyPrice, setPropertyPrice] = useState('')
  const [maintenanceCost, setMaintenanceCost] = useState('')
  const [currency, setCurrency] = useState<'MXN' | 'USD'>('MXN')
  const [isNegotiable, setIsNegotiable] = useState(false)
  
  // Estados para listado externo - Nombre
  const [propertyName, setPropertyName] = useState('')
  const [propertyDescription, setPropertyDescription] = useState('')
  
  // Estados para propietario
  const [ownerName, setOwnerName] = useState('')
  const [ownerPhone, setOwnerPhone] = useState('')
  const [ownerEmail, setOwnerEmail] = useState('')
  const [ownerAddress, setOwnerAddress] = useState('')
  
  // Estados para asesor externo
  const [externalAgentName, setExternalAgentName] = useState('')
  const [externalCompany, setExternalCompany] = useState('')
  const [externalPhone, setExternalPhone] = useState('')
  const [externalEmail, setExternalEmail] = useState('')
  const [totalCommission, setTotalCommission] = useState('')
  const [externalCommission, setExternalCommission] = useState('')
  const [myCommission, setMyCommission] = useState('')
  
  // Estados para cliente
  const [clientSearchQuery, setClientSearchQuery] = useState('')
  const [selectedClient, setSelectedClient] = useState<string | null>(null)
  const [clientName, setClientName] = useState('')
  const [clientPhone, setClientPhone] = useState('')
  const [clientEmail, setClientEmail] = useState('')
  const [clientContactMethod, setClientContactMethod] = useState<'phone' | 'email' | 'whatsapp'>('whatsapp')
  const [clientComments, setClientComments] = useState('')
  
  // Estados para documentos
  const [selectedDocuments, setSelectedDocuments] = useState<string[]>([])
  const [expandedDocument, setExpandedDocument] = useState<string | null>(null)
  const [documentFiles, setDocumentFiles] = useState<DocumentFiles>({})
  const [additionalFiles, setAdditionalFiles] = useState<{ name: string; uri: string }[]>([])
  const [referralCode, setReferralCode] = useState('')

  // Mock de clientes (vacio por ahora)
  const existingClients: { id: string; name: string; phone: string; email: string }[] = []

  // Cargar propiedades
  useEffect(() => {
    if (!hasLoadedAgentCatalog && !isAgentCatalogLoading) {
      loadAgentCatalogProperties()
    }
  }, [hasLoadedAgentCatalog, isAgentCatalogLoading, loadAgentCatalogProperties])

  // Determinar pasos segun el flujo
  const steps = useMemo(() => {
    if (!listingSource) return ['transaction-type', 'listing-source'] as StepType[]
    return listingSource === 'internal' ? INTERNAL_STEPS : EXTERNAL_STEPS
  }, [listingSource])

  const currentStep = steps[currentStepIndex]
  const totalSteps = steps.length
  const progress = ((currentStepIndex + 1) / totalSteps) * 100

  // Filtrar propiedades
  const filteredProperties = useMemo(() => {
    const filtered = agentCatalogRawData.filter(p => {
      const isSaleType = p.list === 'sale'
      const isRentType = p.list === 'rent'
      const isAvailable = (p.status || '').toLowerCase().includes('disponible')
      
      if (transactionType === 'sale') return isSaleType && isAvailable
      if (transactionType === 'rent') return isRentType && isAvailable
      return false
    })

    if (!searchQuery.trim()) return filtered
    const query = searchQuery.toLowerCase()
    return filtered.filter(p => 
      p.name.toLowerCase().includes(query) ||
      (p.address || '').toLowerCase().includes(query) ||
      (p.zonaText || '').toLowerCase().includes(query)
    )
  }, [agentCatalogRawData, searchQuery, transactionType])

  // Propiedad seleccionada
  const selectedPropertyRaw = useMemo(() => {
    if (!selectedProperty) return null
    return agentCatalogRawData.find(p => p.id === selectedProperty)
  }, [selectedProperty, agentCatalogRawData])

  // Validar paso actual
  const isCurrentStepValid = useMemo(() => {
    switch (currentStep) {
      case 'transaction-type':
        return transactionType !== null
      case 'listing-source':
        return listingSource !== null
      case 'select-property':
        return selectedProperty !== null
      case 'internal-price':
        return priceOption === 'custom' ? customAmount.length > 0 : true
      case 'property-type':
        return propertyType !== null
      case 'property-details':
        return bedrooms.length > 0 && bathrooms.length > 0
      case 'property-location':
        return propertyAddress.length > 0 && propertyCity.length > 0
      case 'property-amenities':
        return true
      case 'property-measurements':
        return true
      case 'property-photos':
        return true
      case 'property-pricing':
        return propertyPrice.length > 0
      case 'property-name':
        return propertyName.length > 0
      case 'owner-info':
        return ownerName.length > 0 && ownerPhone.length > 0
      case 'external-agent-info':
        return externalAgentName.length > 0
      case 'client-info':
        return clientName.length > 0 && clientPhone.length > 0
      case 'documents':
        return true
      case 'summary':
        return true
      default:
        return false
    }
  }, [currentStep, transactionType, listingSource, selectedProperty, priceOption, customAmount,
      propertyType, bedrooms, bathrooms, propertyAddress, propertyCity, propertyPrice,
      propertyName, ownerName, ownerPhone, externalAgentName, clientName, clientPhone])

  // Navegacion
  const goNext = () => {
    if (currentStepIndex < steps.length - 1 && isCurrentStepValid) {
      setCurrentStepIndex(prev => prev + 1)
    }
  }

  const goBack = () => {
    if (currentStepIndex > 0) {
      setCurrentStepIndex(prev => prev - 1)
    } else {
      router.back()
    }
  }

  // Handlers
  const handleSelectProperty = (id: string) => {
    setSelectedProperty(id)
    setPriceOption('original')
    setCustomAmount('')
  }

  const toggleAmenity = (amenity: string) => {
    setSelectedAmenities(prev => 
      prev.includes(amenity) ? prev.filter(a => a !== amenity) : [...prev, amenity]
    )
  }

  const toggleDocument = (docId: string) => {
    setSelectedDocuments(prev => 
      prev.includes(docId) ? prev.filter(d => d !== docId) : [...prev, docId]
    )
  }

  const toggleDocumentExpanded = (docId: string) => {
    setExpandedDocument(prev => prev === docId ? null : docId)
  }

  const handleUploadDocument = (docId: string) => {
    // Simular seleccion de archivo (en produccion usar expo-document-picker o expo-image-picker)
    Alert.alert(
      'Subir documento',
      'Selecciona el origen del archivo',
      [
        { 
          text: 'Camara', 
          onPress: () => {
            // Simular archivo subido
            setDocumentFiles(prev => ({
              ...prev,
              [docId]: { name: `${docId}_foto.jpg`, uri: 'file://mock' }
            }))
            if (!selectedDocuments.includes(docId)) {
              setSelectedDocuments(prev => [...prev, docId])
            }
          }
        },
        { 
          text: 'Galeria', 
          onPress: () => {
            setDocumentFiles(prev => ({
              ...prev,
              [docId]: { name: `${docId}_imagen.jpg`, uri: 'file://mock' }
            }))
            if (!selectedDocuments.includes(docId)) {
              setSelectedDocuments(prev => [...prev, docId])
            }
          }
        },
        { 
          text: 'Archivo', 
          onPress: () => {
            setDocumentFiles(prev => ({
              ...prev,
              [docId]: { name: `${docId}_documento.pdf`, uri: 'file://mock' }
            }))
            if (!selectedDocuments.includes(docId)) {
              setSelectedDocuments(prev => [...prev, docId])
            }
          }
        },
        { text: 'Cancelar', style: 'cancel' }
      ]
    )
  }

  const handleRemoveDocument = (docId: string) => {
    setDocumentFiles(prev => {
      const newFiles = { ...prev }
      delete newFiles[docId]
      return newFiles
    })
  }

  const handleUploadAdditionalFiles = () => {
    // Simular subida multiple
    Alert.alert(
      'Subir archivos adicionales',
      'Se agregara un archivo de ejemplo',
      [
        {
          text: 'Agregar',
          onPress: () => {
            const newFile = { 
              name: `archivo_adicional_${additionalFiles.length + 1}.pdf`, 
              uri: 'file://mock' 
            }
            setAdditionalFiles(prev => [...prev, newFile])
          }
        },
        { text: 'Cancelar', style: 'cancel' }
      ]
    )
  }

  const handleRemoveAdditionalFile = (index: number) => {
    setAdditionalFiles(prev => prev.filter((_, i) => i !== index))
  }

  const handleSubmit = () => {
    Alert.alert(
      'Registro Enviado',
      `Tu registro de ${transactionType === 'sale' ? 'venta' : 'renta'} ha sido enviado correctamente.`,
      [{ text: 'OK', onPress: () => router.back() }]
    )
  }

  // Obtener titulo del paso
  const getStepTitle = () => {
    switch (currentStep) {
      case 'transaction-type': return 'Tipo de Transaccion'
      case 'listing-source': return 'Origen del Inmueble'
      case 'select-property': return 'Seleccionar Propiedad'
      case 'internal-price': return 'Precio'
      case 'property-type': return 'Tipo de Propiedad'
      case 'property-details': return 'Detalles del Inmueble'
      case 'property-location': return 'Ubicacion'
      case 'property-amenities': return 'Amenidades'
      case 'property-measurements': return 'Medidas'
      case 'property-photos': return 'Fotografias'
      case 'property-pricing': return 'Precio'
      case 'property-name': return 'Nombre del Inmueble'
      case 'owner-info': return 'Datos del Propietario'
      case 'external-agent-info': return 'Asesor Externo'
      case 'client-info': return 'Datos del Cliente'
      case 'documents': return 'Documentos'
      case 'summary': return 'Resumen'
      default: return ''
    }
  }

  // Renderizar contenido del paso
  const renderStepContent = () => {
    switch (currentStep) {
      // PASO: Tipo de transaccion
      case 'transaction-type':
        return (
          <View style={styles.stepContent}>
            <Text style={styles.stepQuestion}>Que tipo de transaccion deseas registrar?</Text>
            
            <TouchableOpacity
              style={[styles.optionCard, transactionType === 'sale' && styles.optionCardActive]}
              onPress={() => setTransactionType('sale')}
            >
              <View style={styles.optionIcon}>
                <DollarSign size={32} color={transactionType === 'sale' ? advisorTheme.accent : advisorTheme.textMuted} />
              </View>
              <View style={styles.optionInfo}>
                <Text style={[styles.optionTitle, transactionType === 'sale' && styles.optionTitleActive]}>Venta</Text>
                <Text style={styles.optionDescription}>Registrar una venta de propiedad</Text>
              </View>
              {transactionType === 'sale' && <Check size={24} color={advisorTheme.accent} />}
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.optionCard, transactionType === 'rent' && styles.optionCardActive]}
              onPress={() => setTransactionType('rent')}
            >
              <View style={styles.optionIcon}>
                <Home size={32} color={transactionType === 'rent' ? advisorTheme.accent : advisorTheme.textMuted} />
              </View>
              <View style={styles.optionInfo}>
                <Text style={[styles.optionTitle, transactionType === 'rent' && styles.optionTitleActive]}>Renta</Text>
                <Text style={styles.optionDescription}>Registrar una renta de propiedad</Text>
              </View>
              {transactionType === 'rent' && <Check size={24} color={advisorTheme.accent} />}
            </TouchableOpacity>
          </View>
        )

      // PASO: Origen del listado
      case 'listing-source':
        return (
          <View style={styles.stepContent}>
            <Text style={styles.stepQuestion}>De donde proviene el inmueble?</Text>
            
            <TouchableOpacity
              style={[styles.optionCard, listingSource === 'internal' && styles.optionCardActive]}
              onPress={() => setListingSource('internal')}
            >
              <View style={styles.optionIcon}>
                <Building2 size={32} color={listingSource === 'internal' ? advisorTheme.accent : advisorTheme.textMuted} />
              </View>
              <View style={styles.optionInfo}>
                <Text style={[styles.optionTitle, listingSource === 'internal' && styles.optionTitleActive]}>Listado Interno</Text>
                <Text style={styles.optionDescription}>Propiedad del catalogo de Inicio Real State</Text>
              </View>
              {listingSource === 'internal' && <Check size={24} color={advisorTheme.accent} />}
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.optionCard, listingSource === 'external' && styles.optionCardActive]}
              onPress={() => setListingSource('external')}
            >
              <View style={styles.optionIcon}>
                <Users size={32} color={listingSource === 'external' ? advisorTheme.accent : advisorTheme.textMuted} />
              </View>
              <View style={styles.optionInfo}>
                <Text style={[styles.optionTitle, listingSource === 'external' && styles.optionTitleActive]}>Listado Externo</Text>
                <Text style={styles.optionDescription}>Propiedad de otra inmobiliaria o particular</Text>
              </View>
              {listingSource === 'external' && <Check size={24} color={advisorTheme.accent} />}
            </TouchableOpacity>
          </View>
        )

      // PASO: Seleccionar propiedad (interno)
      case 'select-property':
        return (
          <View style={styles.stepContent}>
            <Text style={styles.stepQuestion}>Selecciona la propiedad</Text>
            
            <View style={styles.searchBox}>
              <Search size={20} color={advisorTheme.textMuted} />
              <TextInput
                style={styles.searchInput}
                placeholder="Buscar por nombre o ubicacion..."
                placeholderTextColor={advisorTheme.textMuted}
                value={searchQuery}
                onChangeText={setSearchQuery}
              />
              {searchQuery.length > 0 && (
                <TouchableOpacity onPress={() => setSearchQuery('')}>
                  <X size={20} color={advisorTheme.textMuted} />
                </TouchableOpacity>
              )}
            </View>

            <ScrollView style={styles.propertyList} showsVerticalScrollIndicator={false}>
              {isAgentCatalogLoading ? (
                <Text style={styles.emptyText}>Cargando propiedades...</Text>
              ) : filteredProperties.length === 0 ? (
                <Text style={styles.emptyText}>No se encontraron propiedades disponibles para {transactionType === 'sale' ? 'venta' : 'renta'}</Text>
              ) : (
                filteredProperties.map((property) => (
                  <TouchableOpacity
                    key={property.id}
                    style={[styles.propertyCard, selectedProperty === property.id && styles.propertyCardActive]}
                    onPress={() => handleSelectProperty(property.id)}
                  >
                    <View style={styles.propertyCardContent}>
                      <Text style={styles.propertyCardTitle} numberOfLines={1}>{property.name}</Text>
                      <Text style={styles.propertyCardLocation}>{property.zonaText || property.address}</Text>
                      <View style={styles.propertyCardPrices}>
                        <Text style={styles.propertyCardPrice}>{formatCurrency(property.maxPrice || 0)}</Text>
                        {property.minPrice != null && property.minPrice > 0 && (
                          <Text style={styles.propertyCardMinPrice}>Min: {formatCurrency(property.minPrice)}</Text>
                        )}
                      </View>
                    </View>
                    {selectedProperty === property.id && <Check size={24} color={advisorTheme.accent} />}
                  </TouchableOpacity>
                ))
              )}
            </ScrollView>
          </View>
        )

      // PASO: Precio (interno)
      case 'internal-price':
        return (
          <View style={styles.stepContent}>
            <Text style={styles.stepQuestion}>{transactionType === 'sale' ? 'Precio de venta acordado' : 'Renta mensual acordada'}</Text>

            {selectedPropertyRaw && (
              <View style={styles.selectedPropertyInfo}>
                <Text style={styles.selectedPropertyName}>{selectedPropertyRaw.name}</Text>
                <Text style={styles.selectedPropertyLocation}>{selectedPropertyRaw.zonaText}</Text>
              </View>
            )}

            <TouchableOpacity
              style={[styles.priceOptionCard, priceOption === 'original' && styles.priceOptionCardActive]}
              onPress={() => setPriceOption('original')}
            >
              <View style={styles.radioOuter}>
                {priceOption === 'original' && <View style={styles.radioInner} />}
              </View>
              <View style={styles.priceOptionInfo}>
                <Text style={styles.priceOptionLabel}>Precio Original</Text>
                <Text style={styles.priceOptionValue}>{formatCurrency(selectedPropertyRaw?.maxPrice || 0)}</Text>
              </View>
            </TouchableOpacity>

            {selectedPropertyRaw?.minPrice != null && selectedPropertyRaw.minPrice > 0 && (
              <TouchableOpacity
                style={[styles.priceOptionCard, priceOption === 'min' && styles.priceOptionCardActive]}
                onPress={() => setPriceOption('min')}
              >
                <View style={styles.radioOuter}>
                  {priceOption === 'min' && <View style={styles.radioInner} />}
                </View>
                <View style={styles.priceOptionInfo}>
                  <Text style={styles.priceOptionLabel}>Precio Minimo</Text>
                  <Text style={styles.priceOptionValue}>{formatCurrency(selectedPropertyRaw.minPrice)}</Text>
                </View>
              </TouchableOpacity>
            )}

            <TouchableOpacity
              style={[styles.priceOptionCard, priceOption === 'custom' && styles.priceOptionCardActive]}
              onPress={() => setPriceOption('custom')}
            >
              <View style={styles.radioOuter}>
                {priceOption === 'custom' && <View style={styles.radioInner} />}
              </View>
              <View style={styles.priceOptionInfo}>
                <Text style={styles.priceOptionLabel}>Precio Personalizado</Text>
              </View>
            </TouchableOpacity>

            {priceOption === 'custom' && (
              <View style={styles.customPriceInput}>
                <Text style={styles.currencySymbol}>$</Text>
                <TextInput
                  style={styles.priceInput}
                  placeholder="0.00"
                  placeholderTextColor={advisorTheme.textMuted}
                  keyboardType="numeric"
                  value={customAmount}
                  onChangeText={setCustomAmount}
                />
                <Text style={styles.currencyLabel}>MXN</Text>
              </View>
            )}
          </View>
        )

      // PASO: Tipo de propiedad (externo)
      case 'property-type':
        return (
          <View style={styles.stepContent}>
            <Text style={styles.stepQuestion}>Que tipo de propiedad es?</Text>
            
            <View style={styles.propertyTypeGrid}>
              {PROPERTY_TYPES.map((type) => {
                const Icon = type.icon
                const isSelected = propertyType === type.id
                return (
                  <TouchableOpacity
                    key={type.id}
                    style={[styles.propertyTypeCard, isSelected && styles.propertyTypeCardActive]}
                    onPress={() => setPropertyType(type.id)}
                  >
                    <Icon size={32} color={isSelected ? advisorTheme.accent : advisorTheme.textMuted} />
                    <Text style={[styles.propertyTypeLabel, isSelected && styles.propertyTypeLabelActive]}>{type.label}</Text>
                    {isSelected && (
                      <View style={styles.propertyTypeCheck}>
                        <Check size={16} color={advisorTheme.background} />
                      </View>
                    )}
                  </TouchableOpacity>
                )
              })}
            </View>
          </View>
        )

      // PASO: Detalles del inmueble (externo)
      case 'property-details':
        return (
          <View style={styles.stepContent}>
            <Text style={styles.stepQuestion}>Detalles del inmueble</Text>
            
            <View style={styles.detailsGrid}>
              <View style={styles.detailItem}>
                <BedDouble size={20} color={advisorTheme.accent} />
                <Text style={styles.detailLabel}>Recamaras *</Text>
                <TextInput
                  style={styles.detailInput}
                  placeholder="0"
                  placeholderTextColor={advisorTheme.textMuted}
                  keyboardType="numeric"
                  value={bedrooms}
                  onChangeText={setBedrooms}
                />
              </View>

              <View style={styles.detailItem}>
                <Bath size={20} color={advisorTheme.accent} />
                <Text style={styles.detailLabel}>Banos *</Text>
                <TextInput
                  style={styles.detailInput}
                  placeholder="0"
                  placeholderTextColor={advisorTheme.textMuted}
                  keyboardType="numeric"
                  value={bathrooms}
                  onChangeText={setBathrooms}
                />
              </View>

              <View style={styles.detailItem}>
                <Bath size={20} color={advisorTheme.textMuted} />
                <Text style={styles.detailLabel}>Medios banos</Text>
                <TextInput
                  style={styles.detailInput}
                  placeholder="0"
                  placeholderTextColor={advisorTheme.textMuted}
                  keyboardType="numeric"
                  value={halfBaths}
                  onChangeText={setHalfBaths}
                />
              </View>

              <View style={styles.detailItem}>
                <Car size={20} color={advisorTheme.accent} />
                <Text style={styles.detailLabel}>Estacionamientos</Text>
                <TextInput
                  style={styles.detailInput}
                  placeholder="0"
                  placeholderTextColor={advisorTheme.textMuted}
                  keyboardType="numeric"
                  value={parking}
                  onChangeText={setParking}
                />
              </View>
            </View>

            <View style={styles.togglesContainer}>
              <TouchableOpacity
                style={[styles.toggleOption, isFullyEquipped && styles.toggleOptionActive]}
                onPress={() => setIsFullyEquipped(!isFullyEquipped)}
              >
                <View style={[styles.checkbox, isFullyEquipped && styles.checkboxActive]}>
                  {isFullyEquipped && <Check size={14} color={advisorTheme.background} />}
                </View>
                <Text style={styles.toggleLabel}>Totalmente equipada</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.toggleOption, isFurnished && styles.toggleOptionActive]}
                onPress={() => setIsFurnished(!isFurnished)}
              >
                <View style={[styles.checkbox, isFurnished && styles.checkboxActive]}>
                  {isFurnished && <Check size={14} color={advisorTheme.background} />}
                </View>
                <Text style={styles.toggleLabel}>Amueblada</Text>
              </TouchableOpacity>
            </View>
          </View>
        )

      // PASO: Ubicacion (externo)
      case 'property-location':
        return (
          <View style={styles.stepContent}>
            <Text style={styles.stepQuestion}>Ubicacion del inmueble</Text>
            
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Direccion *</Text>
              <View style={styles.inputBox}>
                <MapPin size={20} color={advisorTheme.textMuted} />
                <TextInput
                  style={styles.inputField}
                  placeholder="Calle, numero, colonia"
                  placeholderTextColor={advisorTheme.textMuted}
                  value={propertyAddress}
                  onChangeText={setPropertyAddress}
                />
              </View>
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Ciudad *</Text>
              <View style={styles.inputBox}>
                <Building2 size={20} color={advisorTheme.textMuted} />
                <TextInput
                  style={styles.inputField}
                  placeholder="Ciudad, Estado"
                  placeholderTextColor={advisorTheme.textMuted}
                  value={propertyCity}
                  onChangeText={setPropertyCity}
                />
              </View>
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Link de Google Maps (opcional)</Text>
              <View style={styles.inputBox}>
                <MapPin size={20} color={advisorTheme.textMuted} />
                <TextInput
                  style={styles.inputField}
                  placeholder="https://maps.google.com/..."
                  placeholderTextColor={advisorTheme.textMuted}
                  value={propertyMapsUrl}
                  onChangeText={setPropertyMapsUrl}
                  autoCapitalize="none"
                />
              </View>
            </View>
          </View>
        )

      // PASO: Amenidades (externo)
      case 'property-amenities':
        return (
          <View style={styles.stepContent}>
            <Text style={styles.stepQuestion}>Amenidades (opcional)</Text>
            <Text style={styles.stepHint}>Selecciona todas las que apliquen</Text>
            
            <View style={styles.amenitiesGrid}>
              {AMENITIES_LIST.map((amenity) => {
                const isSelected = selectedAmenities.includes(amenity)
                return (
                  <TouchableOpacity
                    key={amenity}
                    style={[styles.amenityChip, isSelected && styles.amenityChipActive]}
                    onPress={() => toggleAmenity(amenity)}
                  >
                    <Text style={[styles.amenityChipText, isSelected && styles.amenityChipTextActive]}>{amenity}</Text>
                  </TouchableOpacity>
                )
              })}
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Otras amenidades</Text>
              <TextInput
                style={styles.textArea}
                placeholder="Escribe otras amenidades separadas por coma..."
                placeholderTextColor={advisorTheme.textMuted}
                multiline
                numberOfLines={3}
                value={customAmenities}
                onChangeText={setCustomAmenities}
              />
            </View>
          </View>
        )

      // PASO: Medidas (externo)
      case 'property-measurements':
        return (
          <View style={styles.stepContent}>
            <Text style={styles.stepQuestion}>Medidas del inmueble (opcional)</Text>
            
            <View style={styles.measurementsGrid}>
              <View style={styles.measurementItem}>
                <Text style={styles.measurementLabel}>Largo (m)</Text>
                <TextInput
                  style={styles.measurementInput}
                  placeholder="0"
                  placeholderTextColor={advisorTheme.textMuted}
                  keyboardType="numeric"
                  value={propertyLength}
                  onChangeText={setPropertyLength}
                />
              </View>

              <View style={styles.measurementItem}>
                <Text style={styles.measurementLabel}>Ancho (m)</Text>
                <TextInput
                  style={styles.measurementInput}
                  placeholder="0"
                  placeholderTextColor={advisorTheme.textMuted}
                  keyboardType="numeric"
                  value={propertyWidth}
                  onChangeText={setPropertyWidth}
                />
              </View>

              <View style={styles.measurementItem}>
                <Text style={styles.measurementLabel}>Area total (m2)</Text>
                <TextInput
                  style={styles.measurementInput}
                  placeholder="0"
                  placeholderTextColor={advisorTheme.textMuted}
                  keyboardType="numeric"
                  value={propertyArea}
                  onChangeText={setPropertyArea}
                />
              </View>

              <View style={styles.measurementItem}>
                <Text style={styles.measurementLabel}>Construccion (m2)</Text>
                <TextInput
                  style={styles.measurementInput}
                  placeholder="0"
                  placeholderTextColor={advisorTheme.textMuted}
                  keyboardType="numeric"
                  value={constructionArea}
                  onChangeText={setConstructionArea}
                />
              </View>
            </View>
          </View>
        )

      // PASO: Fotos (externo)
      case 'property-photos':
        return (
          <View style={styles.stepContent}>
            <Text style={styles.stepQuestion}>Fotografias del inmueble (opcional)</Text>
            
            <TouchableOpacity style={styles.uploadArea}>
              <Camera size={48} color={advisorTheme.textMuted} />
              <Text style={styles.uploadText}>Toca para subir fotos</Text>
              <Text style={styles.uploadHint}>JPG, PNG - Maximo 10 fotos</Text>
            </TouchableOpacity>

            {propertyPhotos.length > 0 && (
              <View style={styles.photosPreview}>
                {propertyPhotos.map((photo, index) => (
                  <View key={index} style={styles.photoItem}>
                    <Text style={styles.photoName}>Foto {index + 1}</Text>
                  </View>
                ))}
              </View>
            )}
          </View>
        )

      // PASO: Precio (externo)
      case 'property-pricing':
        return (
          <View style={styles.stepContent}>
            <Text style={styles.stepQuestion}>{transactionType === 'sale' ? 'Precio de venta' : 'Renta mensual'}</Text>
            
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Precio *</Text>
              <View style={styles.priceInputContainer}>
                <Text style={styles.currencySymbol}>$</Text>
                <TextInput
                  style={styles.priceInputLarge}
                  placeholder="0.00"
                  placeholderTextColor={advisorTheme.textMuted}
                  keyboardType="numeric"
                  value={propertyPrice}
                  onChangeText={setPropertyPrice}
                />
                <View style={styles.currencyToggle}>
                  <TouchableOpacity
                    style={[styles.currencyBtn, currency === 'MXN' && styles.currencyBtnActive]}
                    onPress={() => setCurrency('MXN')}
                  >
                    <Text style={[styles.currencyBtnText, currency === 'MXN' && styles.currencyBtnTextActive]}>MXN</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.currencyBtn, currency === 'USD' && styles.currencyBtnActive]}
                    onPress={() => setCurrency('USD')}
                  >
                    <Text style={[styles.currencyBtnText, currency === 'USD' && styles.currencyBtnTextActive]}>USD</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Mantenimiento mensual (opcional)</Text>
              <View style={styles.inputBox}>
                <Text style={styles.inputPrefix}>$</Text>
                <TextInput
                  style={styles.inputField}
                  placeholder="0.00"
                  placeholderTextColor={advisorTheme.textMuted}
                  keyboardType="numeric"
                  value={maintenanceCost}
                  onChangeText={setMaintenanceCost}
                />
              </View>
            </View>

            <TouchableOpacity
              style={[styles.toggleOption, isNegotiable && styles.toggleOptionActive]}
              onPress={() => setIsNegotiable(!isNegotiable)}
            >
              <View style={[styles.checkbox, isNegotiable && styles.checkboxActive]}>
                {isNegotiable && <Check size={14} color={advisorTheme.background} />}
              </View>
              <Text style={styles.toggleLabel}>Precio negociable</Text>
            </TouchableOpacity>
          </View>
        )

      // PASO: Nombre del inmueble (externo)
      case 'property-name':
        return (
          <View style={styles.stepContent}>
            <Text style={styles.stepQuestion}>Nombre y descripcion del inmueble</Text>
            
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Titulo / Nombre *</Text>
              <View style={styles.inputBox}>
                <Home size={20} color={advisorTheme.textMuted} />
                <TextInput
                  style={styles.inputField}
                  placeholder="Ej: Casa en Colinas de San Jeronimo"
                  placeholderTextColor={advisorTheme.textMuted}
                  value={propertyName}
                  onChangeText={setPropertyName}
                />
              </View>
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Descripcion (opcional)</Text>
              <TextInput
                style={styles.textArea}
                placeholder="Describe las caracteristicas principales del inmueble..."
                placeholderTextColor={advisorTheme.textMuted}
                multiline
                numberOfLines={4}
                value={propertyDescription}
                onChangeText={setPropertyDescription}
              />
            </View>
          </View>
        )

      // PASO: Info del propietario (externo)
      case 'owner-info':
        return (
          <View style={styles.stepContent}>
            <Text style={styles.stepQuestion}>Informacion del propietario</Text>
            
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Nombre completo *</Text>
              <View style={styles.inputBox}>
                <User size={20} color={advisorTheme.textMuted} />
                <TextInput
                  style={styles.inputField}
                  placeholder="Nombre del propietario"
                  placeholderTextColor={advisorTheme.textMuted}
                  value={ownerName}
                  onChangeText={setOwnerName}
                />
              </View>
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Telefono *</Text>
              <View style={styles.inputBox}>
                <Phone size={20} color={advisorTheme.textMuted} />
                <TextInput
                  style={styles.inputField}
                  placeholder="10 digitos"
                  placeholderTextColor={advisorTheme.textMuted}
                  keyboardType="phone-pad"
                  value={ownerPhone}
                  onChangeText={setOwnerPhone}
                />
              </View>
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Email (opcional)</Text>
              <View style={styles.inputBox}>
                <Mail size={20} color={advisorTheme.textMuted} />
                <TextInput
                  style={styles.inputField}
                  placeholder="correo@ejemplo.com"
                  placeholderTextColor={advisorTheme.textMuted}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  value={ownerEmail}
                  onChangeText={setOwnerEmail}
                />
              </View>
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Direccion (opcional)</Text>
              <View style={styles.inputBox}>
                <MapPin size={20} color={advisorTheme.textMuted} />
                <TextInput
                  style={styles.inputField}
                  placeholder="Direccion del propietario"
                  placeholderTextColor={advisorTheme.textMuted}
                  value={ownerAddress}
                  onChangeText={setOwnerAddress}
                />
              </View>
            </View>
          </View>
        )

      // PASO: Info del asesor externo
      case 'external-agent-info':
        return (
          <View style={styles.stepContent}>
            <Text style={styles.stepQuestion}>Asesor o empresa externa</Text>
            
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Nombre del asesor *</Text>
              <View style={styles.inputBox}>
                <User size={20} color={advisorTheme.textMuted} />
                <TextInput
                  style={styles.inputField}
                  placeholder="Nombre del asesor externo"
                  placeholderTextColor={advisorTheme.textMuted}
                  value={externalAgentName}
                  onChangeText={setExternalAgentName}
                />
              </View>
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Empresa / Inmobiliaria</Text>
              <View style={styles.inputBox}>
                <Building2 size={20} color={advisorTheme.textMuted} />
                <TextInput
                  style={styles.inputField}
                  placeholder="Nombre de la empresa"
                  placeholderTextColor={advisorTheme.textMuted}
                  value={externalCompany}
                  onChangeText={setExternalCompany}
                />
              </View>
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Telefono</Text>
              <View style={styles.inputBox}>
                <Phone size={20} color={advisorTheme.textMuted} />
                <TextInput
                  style={styles.inputField}
                  placeholder="10 digitos"
                  placeholderTextColor={advisorTheme.textMuted}
                  keyboardType="phone-pad"
                  value={externalPhone}
                  onChangeText={setExternalPhone}
                />
              </View>
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Email</Text>
              <View style={styles.inputBox}>
                <Mail size={20} color={advisorTheme.textMuted} />
                <TextInput
                  style={styles.inputField}
                  placeholder="correo@ejemplo.com"
                  placeholderTextColor={advisorTheme.textMuted}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  value={externalEmail}
                  onChangeText={setExternalEmail}
                />
              </View>
            </View>

            <Text style={styles.sectionDivider}>Division de Comisiones</Text>

            <View style={styles.commissionRow}>
              <View style={styles.commissionItem}>
                <Text style={styles.commissionLabel}>Total</Text>
                <View style={styles.commissionInput}>
                  <Text style={styles.inputPrefix}>$</Text>
                  <TextInput
                    style={styles.commissionField}
                    placeholder="0"
                    placeholderTextColor={advisorTheme.textMuted}
                    keyboardType="numeric"
                    value={totalCommission}
                    onChangeText={setTotalCommission}
                  />
                </View>
              </View>

              <View style={styles.commissionItem}>
                <Text style={styles.commissionLabel}>Externa</Text>
                <View style={styles.commissionInput}>
                  <Text style={styles.inputPrefix}>$</Text>
                  <TextInput
                    style={styles.commissionField}
                    placeholder="0"
                    placeholderTextColor={advisorTheme.textMuted}
                    keyboardType="numeric"
                    value={externalCommission}
                    onChangeText={setExternalCommission}
                  />
                </View>
              </View>

              <View style={styles.commissionItem}>
                <Text style={styles.commissionLabel}>Mi comision</Text>
                <View style={styles.commissionInput}>
                  <Text style={styles.inputPrefix}>$</Text>
                  <TextInput
                    style={styles.commissionField}
                    placeholder="0"
                    placeholderTextColor={advisorTheme.textMuted}
                    keyboardType="numeric"
                    value={myCommission}
                    onChangeText={setMyCommission}
                  />
                </View>
              </View>
            </View>
          </View>
        )

      // PASO: Info del cliente (comun)
      case 'client-info':
        return (
          <View style={styles.stepContent}>
            <Text style={styles.stepQuestion}>Informacion del cliente</Text>
            
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Buscar cliente existente</Text>
              <View style={styles.searchBox}>
                <Search size={20} color={advisorTheme.textMuted} />
                <TextInput
                  style={styles.searchInput}
                  placeholder="Nombre, telefono o email..."
                  placeholderTextColor={advisorTheme.textMuted}
                  value={clientSearchQuery}
                  onChangeText={(text) => {
                    setClientSearchQuery(text)
                    setClientName(text)
                    if (selectedClient) setSelectedClient(null)
                  }}
                />
              </View>
              <Text style={styles.inputHint}>No se encontraron clientes. Completa los datos manualmente.</Text>
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Nombre completo *</Text>
              <View style={styles.inputBox}>
                <User size={20} color={advisorTheme.textMuted} />
                <TextInput
                  style={styles.inputField}
                  placeholder="Nombre del cliente"
                  placeholderTextColor={advisorTheme.textMuted}
                  value={clientName}
                  onChangeText={setClientName}
                />
              </View>
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Telefono *</Text>
              <View style={styles.inputBox}>
                <Phone size={20} color={advisorTheme.textMuted} />
                <TextInput
                  style={styles.inputField}
                  placeholder="10 digitos"
                  placeholderTextColor={advisorTheme.textMuted}
                  keyboardType="phone-pad"
                  value={clientPhone}
                  onChangeText={setClientPhone}
                />
              </View>
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Email</Text>
              <View style={styles.inputBox}>
                <Mail size={20} color={advisorTheme.textMuted} />
                <TextInput
                  style={styles.inputField}
                  placeholder="correo@ejemplo.com"
                  placeholderTextColor={advisorTheme.textMuted}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  value={clientEmail}
                  onChangeText={setClientEmail}
                />
              </View>
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Metodo de contacto preferido</Text>
              <View style={styles.contactMethodRow}>
                {(['phone', 'email', 'whatsapp'] as const).map((method) => (
                  <TouchableOpacity
                    key={method}
                    style={[styles.contactMethodBtn, clientContactMethod === method && styles.contactMethodBtnActive]}
                    onPress={() => setClientContactMethod(method)}
                  >
                    <Text style={[styles.contactMethodText, clientContactMethod === method && styles.contactMethodTextActive]}>
                      {method === 'phone' ? 'Llamada' : method === 'email' ? 'Email' : 'WhatsApp'}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Comentarios (opcional)</Text>
              <TextInput
                style={styles.textArea}
                placeholder="Notas adicionales sobre el cliente..."
                placeholderTextColor={advisorTheme.textMuted}
                multiline
                numberOfLines={3}
                value={clientComments}
                onChangeText={setClientComments}
              />
            </View>
          </View>
        )

      // PASO: Documentos (comun)
      case 'documents':
        return (
          <View style={styles.stepContent}>
            <Text style={styles.stepQuestion}>Documentos requeridos</Text>
            <Text style={styles.stepHint}>Expande cada documento para subir el archivo correspondiente</Text>
            
            {/* Lista de documentos con acordeon */}
            <View style={styles.documentsAccordion}>
              {DOCUMENTS_LIST.map((doc) => {
                const isExpanded = expandedDocument === doc.id
                const hasFile = documentFiles[doc.id]
                const isSelected = selectedDocuments.includes(doc.id)
                
                return (
                  <View key={doc.id} style={styles.documentAccordionItem}>
                    {/* Header del acordeon */}
                    <TouchableOpacity
                      style={[
                        styles.documentAccordionHeader,
                        isExpanded && styles.documentAccordionHeaderExpanded,
                        hasFile && styles.documentAccordionHeaderWithFile
                      ]}
                      onPress={() => toggleDocumentExpanded(doc.id)}
                    >
                      <View style={styles.documentAccordionLeft}>
                        <View style={[styles.documentCheckbox, isSelected && styles.documentCheckboxActive]}>
                          {isSelected && <Check size={12} color={advisorTheme.background} />}
                        </View>
                        <View style={styles.documentAccordionInfo}>
                          <Text style={styles.documentAccordionLabel}>{doc.label}</Text>
                          {doc.required && <Text style={styles.documentRequiredTag}>Requerido</Text>}
                          {hasFile && (
                            <Text style={styles.documentFileName}>{documentFiles[doc.id]?.name}</Text>
                          )}
                        </View>
                      </View>
                      <ChevronRight 
                        size={20} 
                        color={advisorTheme.textMuted} 
                        style={{ transform: [{ rotate: isExpanded ? '90deg' : '0deg' }] }}
                      />
                    </TouchableOpacity>
                    
                    {/* Contenido expandido */}
                    {isExpanded && (
                      <View style={styles.documentAccordionContent}>
                        {hasFile ? (
                          <View style={styles.documentFilePreview}>
                            <View style={styles.documentFileInfo}>
                              <FileText size={24} color={advisorTheme.accent} />
                              <View style={styles.documentFileDetails}>
                                <Text style={styles.documentFileNameLarge}>{documentFiles[doc.id]?.name}</Text>
                                <Text style={styles.documentFileStatus}>Archivo cargado</Text>
                              </View>
                            </View>
                            <View style={styles.documentFileActions}>
                              <TouchableOpacity 
                                style={styles.documentChangeBtn}
                                onPress={() => handleUploadDocument(doc.id)}
                              >
                                <Text style={styles.documentChangeBtnText}>Cambiar</Text>
                              </TouchableOpacity>
                              <TouchableOpacity 
                                style={styles.documentRemoveBtn}
                                onPress={() => handleRemoveDocument(doc.id)}
                              >
                                <X size={16} color={advisorTheme.error} />
                              </TouchableOpacity>
                            </View>
                          </View>
                        ) : (
                          <TouchableOpacity 
                            style={styles.documentUploadArea}
                            onPress={() => handleUploadDocument(doc.id)}
                          >
                            <Upload size={24} color={advisorTheme.accent} />
                            <Text style={styles.documentUploadText}>Subir {doc.label}</Text>
                            <Text style={styles.documentUploadHint}>Toca para seleccionar archivo</Text>
                          </TouchableOpacity>
                        )}
                      </View>
                    )}
                  </View>
                )
              })}
            </View>

            {/* Seccion de archivos adicionales */}
            <View style={styles.additionalFilesSection}>
              <Text style={styles.additionalFilesTitle}>Archivos adicionales (opcional)</Text>
              <Text style={styles.additionalFilesHint}>Sube cualquier otro documento relevante</Text>
              
              {/* Lista de archivos adicionales */}
              {additionalFiles.length > 0 && (
                <View style={styles.additionalFilesList}>
                  {additionalFiles.map((file, index) => (
                    <View key={index} style={styles.additionalFileItem}>
                      <View style={styles.additionalFileInfo}>
                        <FileText size={18} color={advisorTheme.accent} />
                        <Text style={styles.additionalFileItemName}>{file.name}</Text>
                      </View>
                      <TouchableOpacity onPress={() => handleRemoveAdditionalFile(index)}>
                        <X size={18} color={advisorTheme.error} />
                      </TouchableOpacity>
                    </View>
                  ))}
                </View>
              )}
              
              <TouchableOpacity 
                style={styles.uploadAdditionalBtn}
                onPress={handleUploadAdditionalFiles}
              >
                <Upload size={20} color={advisorTheme.accent} />
                <Text style={styles.uploadAdditionalBtnText}>Agregar mas archivos</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Codigo de referido (opcional)</Text>
              <View style={styles.inputBox}>
                <FileText size={20} color={advisorTheme.textMuted} />
                <TextInput
                  style={styles.inputField}
                  placeholder="Codigo de referido"
                  placeholderTextColor={advisorTheme.textMuted}
                  value={referralCode}
                  onChangeText={setReferralCode}
                />
              </View>
            </View>
          </View>
        )

      // PASO: Resumen
      case 'summary':
        return (
          <View style={styles.stepContent}>
            <Text style={styles.stepQuestion}>Resumen del registro</Text>
            
            <View style={styles.summaryCard}>
              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>Tipo de transaccion</Text>
                <Text style={styles.summaryValue}>{transactionType === 'sale' ? 'Venta' : 'Renta'}</Text>
              </View>
              
              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>Origen</Text>
                <Text style={styles.summaryValue}>{listingSource === 'internal' ? 'Listado Interno' : 'Listado Externo'}</Text>
              </View>

              {listingSource === 'internal' && selectedPropertyRaw && (
                <>
                  <View style={styles.summaryDivider} />
                  <View style={styles.summaryRow}>
                    <Text style={styles.summaryLabel}>Propiedad</Text>
                    <Text style={styles.summaryValue}>{selectedPropertyRaw.name}</Text>
                  </View>
                  <View style={styles.summaryRow}>
                    <Text style={styles.summaryLabel}>Precio acordado</Text>
                    <Text style={styles.summaryValue}>
                      {priceOption === 'custom' 
                        ? formatCurrency(parseFloat(customAmount) || 0)
                        : priceOption === 'min'
                          ? formatCurrency(selectedPropertyRaw.minPrice || 0)
                          : formatCurrency(selectedPropertyRaw.maxPrice || 0)
                      }
                    </Text>
                  </View>
                </>
              )}

              {listingSource === 'external' && (
                <>
                  <View style={styles.summaryDivider} />
                  <View style={styles.summaryRow}>
                    <Text style={styles.summaryLabel}>Inmueble</Text>
                    <Text style={styles.summaryValue}>{propertyName || 'Sin nombre'}</Text>
                  </View>
                  <View style={styles.summaryRow}>
                    <Text style={styles.summaryLabel}>Ubicacion</Text>
                    <Text style={styles.summaryValue}>{propertyCity || propertyAddress}</Text>
                  </View>
                  <View style={styles.summaryRow}>
                    <Text style={styles.summaryLabel}>Precio</Text>
                    <Text style={styles.summaryValue}>{formatCurrency(parseFloat(propertyPrice) || 0)} {currency}</Text>
                  </View>
                  <View style={styles.summaryRow}>
                    <Text style={styles.summaryLabel}>Propietario</Text>
                    <Text style={styles.summaryValue}>{ownerName}</Text>
                  </View>
                </>
              )}

              <View style={styles.summaryDivider} />
              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>Cliente</Text>
                <Text style={styles.summaryValue}>{clientName}</Text>
              </View>
              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>Telefono</Text>
                <Text style={styles.summaryValue}>{clientPhone}</Text>
              </View>

              <View style={styles.summaryDivider} />
              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>Documentos</Text>
                <Text style={styles.summaryValue}>{selectedDocuments.length} seleccionados</Text>
              </View>
            </View>
          </View>
        )

      default:
        return null
    }
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={goBack}>
          <ArrowLeft size={24} color={advisorTheme.text} />
        </TouchableOpacity>
        <View style={styles.headerCenter}>
          <Text style={styles.headerTitle}>Registrar {transactionType === 'sale' ? 'Venta' : transactionType === 'rent' ? 'Renta' : 'Venta/Renta'}</Text>
          <Text style={styles.headerSubtitle}>{getStepTitle()}</Text>
        </View>
        <View style={{ width: 40 }} />
      </View>

      {/* Progress bar */}
      <View style={styles.progressContainer}>
        <View style={styles.progressBar}>
          <View style={[styles.progressFill, { width: `${progress}%` }]} />
        </View>
        <Text style={styles.progressText}>Paso {currentStepIndex + 1} de {totalSteps}</Text>
      </View>

      {/* Content */}
      <KeyboardAvoidingView 
        style={styles.content}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <ScrollView 
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {renderStepContent()}
          
          {/* Botones de navegacion dentro del scroll */}
          <View style={styles.navigationButtons}>
            {currentStepIndex > 0 && (
              <TouchableOpacity style={styles.secondaryButton} onPress={goBack}>
                <Text style={styles.secondaryButtonText}>Anterior</Text>
              </TouchableOpacity>
            )}
            
            {currentStep === 'summary' ? (
              <TouchableOpacity 
                style={[styles.primaryButton, styles.submitButton, currentStepIndex === 0 && styles.fullWidthButton]}
                onPress={handleSubmit}
              >
                <Text style={styles.primaryButtonText}>Enviar Registro</Text>
              </TouchableOpacity>
            ) : (
              <TouchableOpacity 
                style={[
                  styles.primaryButton, 
                  !isCurrentStepValid && styles.primaryButtonDisabled,
                  currentStepIndex === 0 && styles.fullWidthButton
                ]}
                onPress={goNext}
                disabled={!isCurrentStepValid}
              >
                <Text style={styles.primaryButtonText}>Siguiente</Text>
                <ChevronRight size={20} color={advisorTheme.background} />
              </TouchableOpacity>
            )}
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
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
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
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
  headerCenter: {
    flex: 1,
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: typography.h4.fontSize,
    fontWeight: '700',
    color: advisorTheme.text,
  },
  headerSubtitle: {
    fontSize: typography.caption.fontSize,
    color: advisorTheme.textMuted,
    marginTop: 2,
  },
  progressContainer: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  progressBar: {
    height: 4,
    backgroundColor: advisorTheme.surface,
    borderRadius: 2,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: advisorTheme.accent,
    borderRadius: 2,
  },
  progressText: {
    fontSize: typography.caption.fontSize,
    color: advisorTheme.textMuted,
    textAlign: 'center',
    marginTop: spacing.xs,
  },
  content: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: spacing.md,
    paddingBottom: spacing.xl,
  },
  stepContent: {
    gap: spacing.md,
  },
  stepQuestion: {
    fontSize: typography.h3.fontSize,
    fontWeight: '700',
    color: advisorTheme.text,
    marginBottom: spacing.sm,
  },
  stepHint: {
    fontSize: typography.body.fontSize,
    color: advisorTheme.textMuted,
    marginTop: -spacing.sm,
    marginBottom: spacing.sm,
  },
  optionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: advisorTheme.surface,
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    borderWidth: 2,
    borderColor: 'transparent',
    gap: spacing.md,
  },
  optionCardActive: {
    borderColor: advisorTheme.accent,
    backgroundColor: advisorTheme.accent + '10',
  },
  optionIcon: {
    width: 56,
    height: 56,
    borderRadius: borderRadius.md,
    backgroundColor: advisorTheme.surfaceLight,
    justifyContent: 'center',
    alignItems: 'center',
  },
  optionInfo: {
    flex: 1,
  },
  optionTitle: {
    fontSize: typography.body.fontSize,
    fontWeight: '600',
    color: advisorTheme.text,
  },
  optionTitleActive: {
    color: advisorTheme.accent,
  },
  optionDescription: {
    fontSize: typography.caption.fontSize,
    color: advisorTheme.textMuted,
    marginTop: 2,
  },
  searchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: advisorTheme.surface,
    borderRadius: borderRadius.md,
    paddingHorizontal: spacing.md,
    height: 48,
    gap: spacing.sm,
  },
  searchInput: {
    flex: 1,
    fontSize: typography.body.fontSize,
    color: advisorTheme.text,
  },
  propertyList: {
    maxHeight: 400,
  },
  emptyText: {
    color: advisorTheme.textMuted,
    textAlign: 'center',
    padding: spacing.lg,
  },
  propertyCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: advisorTheme.surface,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    marginBottom: spacing.sm,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  propertyCardActive: {
    borderColor: advisorTheme.accent,
    backgroundColor: advisorTheme.accent + '10',
  },
  propertyCardContent: {
    flex: 1,
  },
  propertyCardTitle: {
    fontSize: typography.body.fontSize,
    fontWeight: '600',
    color: advisorTheme.text,
  },
  propertyCardLocation: {
    fontSize: typography.caption.fontSize,
    color: advisorTheme.textMuted,
    marginTop: 2,
  },
  propertyCardPrices: {
    flexDirection: 'row',
    gap: spacing.md,
    marginTop: spacing.xs,
  },
  propertyCardPrice: {
    fontSize: typography.body.fontSize,
    fontWeight: '600',
    color: advisorTheme.accent,
  },
  propertyCardMinPrice: {
    fontSize: typography.caption.fontSize,
    color: advisorTheme.textMuted,
  },
  selectedPropertyInfo: {
    backgroundColor: advisorTheme.surface,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    marginBottom: spacing.sm,
  },
  selectedPropertyName: {
    fontSize: typography.body.fontSize,
    fontWeight: '600',
    color: advisorTheme.text,
  },
  selectedPropertyLocation: {
    fontSize: typography.caption.fontSize,
    color: advisorTheme.textMuted,
    marginTop: 2,
  },
  priceOptionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: advisorTheme.surface,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    borderWidth: 2,
    borderColor: 'transparent',
    gap: spacing.md,
  },
  priceOptionCardActive: {
    borderColor: advisorTheme.accent,
    backgroundColor: advisorTheme.accent + '10',
  },
  radioOuter: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: advisorTheme.textMuted,
    justifyContent: 'center',
    alignItems: 'center',
  },
  radioInner: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: advisorTheme.accent,
  },
  priceOptionInfo: {
    flex: 1,
  },
  priceOptionLabel: {
    fontSize: typography.body.fontSize,
    color: advisorTheme.text,
  },
  priceOptionValue: {
    fontSize: typography.h4.fontSize,
    fontWeight: '700',
    color: advisorTheme.accent,
    marginTop: 2,
  },
  customPriceInput: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: advisorTheme.surface,
    borderRadius: borderRadius.md,
    paddingHorizontal: spacing.md,
    height: 56,
  },
  currencySymbol: {
    fontSize: typography.h4.fontSize,
    color: advisorTheme.textMuted,
    marginRight: spacing.xs,
  },
  priceInput: {
    flex: 1,
    fontSize: typography.h4.fontSize,
    color: advisorTheme.text,
  },
  currencyLabel: {
    fontSize: typography.body.fontSize,
    color: advisorTheme.textMuted,
  },
  propertyTypeGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  propertyTypeCard: {
    width: '48%',
    backgroundColor: advisorTheme.surface,
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'transparent',
    position: 'relative',
  },
  propertyTypeCardActive: {
    borderColor: advisorTheme.accent,
    backgroundColor: advisorTheme.accent + '10',
  },
  propertyTypeLabel: {
    fontSize: typography.body.fontSize,
    color: advisorTheme.text,
    marginTop: spacing.sm,
  },
  propertyTypeLabelActive: {
    color: advisorTheme.accent,
    fontWeight: '600',
  },
  propertyTypeCheck: {
    position: 'absolute',
    top: spacing.sm,
    right: spacing.sm,
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: advisorTheme.accent,
    justifyContent: 'center',
    alignItems: 'center',
  },
  detailsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  detailItem: {
    width: '48%',
    backgroundColor: advisorTheme.surface,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    alignItems: 'center',
    gap: spacing.xs,
  },
  detailLabel: {
    fontSize: typography.caption.fontSize,
    color: advisorTheme.textMuted,
  },
  detailInput: {
    fontSize: typography.h3.fontSize,
    fontWeight: '700',
    color: advisorTheme.text,
    textAlign: 'center',
    width: '100%',
  },
  togglesContainer: {
    gap: spacing.sm,
    marginTop: spacing.sm,
  },
  toggleOption: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: advisorTheme.surface,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    gap: spacing.md,
  },
  toggleOptionActive: {
    backgroundColor: advisorTheme.accent + '15',
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: borderRadius.sm,
    borderWidth: 2,
    borderColor: advisorTheme.textMuted,
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkboxActive: {
    backgroundColor: advisorTheme.accent,
    borderColor: advisorTheme.accent,
  },
  toggleLabel: {
    fontSize: typography.body.fontSize,
    color: advisorTheme.text,
  },
  inputGroup: {
    gap: spacing.xs,
  },
  inputLabel: {
    fontSize: typography.caption.fontSize,
    color: advisorTheme.textMuted,
    marginBottom: 4,
  },
  inputBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: advisorTheme.surface,
    borderRadius: borderRadius.md,
    paddingHorizontal: spacing.md,
    height: 48,
    gap: spacing.sm,
  },
  inputField: {
    flex: 1,
    fontSize: typography.body.fontSize,
    color: advisorTheme.text,
  },
  inputPrefix: {
    fontSize: typography.body.fontSize,
    color: advisorTheme.textMuted,
  },
  inputHint: {
    fontSize: typography.caption.fontSize,
    color: advisorTheme.textMuted,
    fontStyle: 'italic',
    marginTop: 4,
  },
  textArea: {
    backgroundColor: advisorTheme.surface,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    fontSize: typography.body.fontSize,
    color: advisorTheme.text,
    minHeight: 100,
    textAlignVertical: 'top',
  },
  amenitiesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.xs,
  },
  amenityChip: {
    backgroundColor: advisorTheme.surface,
    borderRadius: borderRadius.full,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderWidth: 1,
    borderColor: advisorTheme.border,
  },
  amenityChipActive: {
    backgroundColor: advisorTheme.accent + '20',
    borderColor: advisorTheme.accent,
  },
  amenityChipText: {
    fontSize: typography.caption.fontSize,
    color: advisorTheme.textMuted,
  },
  amenityChipTextActive: {
    color: advisorTheme.accent,
    fontWeight: '500',
  },
  measurementsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  measurementItem: {
    width: '48%',
    backgroundColor: advisorTheme.surface,
    borderRadius: borderRadius.md,
    padding: spacing.md,
  },
  measurementLabel: {
    fontSize: typography.caption.fontSize,
    color: advisorTheme.textMuted,
    marginBottom: spacing.xs,
  },
  measurementInput: {
    fontSize: typography.h4.fontSize,
    fontWeight: '600',
    color: advisorTheme.text,
  },
  uploadArea: {
    backgroundColor: advisorTheme.surface,
    borderRadius: borderRadius.lg,
    borderWidth: 2,
    borderStyle: 'dashed',
    borderColor: advisorTheme.border,
    padding: spacing.xl,
    alignItems: 'center',
    gap: spacing.sm,
  },
  uploadText: {
    fontSize: typography.body.fontSize,
    color: advisorTheme.text,
    fontWeight: '500',
  },
  uploadHint: {
    fontSize: typography.caption.fontSize,
    color: advisorTheme.textMuted,
  },
  photosPreview: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
    marginTop: spacing.md,
  },
  photoItem: {
    backgroundColor: advisorTheme.surface,
    borderRadius: borderRadius.md,
    padding: spacing.sm,
  },
  photoName: {
    fontSize: typography.caption.fontSize,
    color: advisorTheme.textMuted,
  },
  priceInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: advisorTheme.surface,
    borderRadius: borderRadius.md,
    paddingLeft: spacing.md,
    height: 56,
  },
  priceInputLarge: {
    flex: 1,
    fontSize: typography.h3.fontSize,
    fontWeight: '600',
    color: advisorTheme.text,
  },
  currencyToggle: {
    flexDirection: 'row',
    borderLeftWidth: 1,
    borderLeftColor: advisorTheme.border,
  },
  currencyBtn: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  currencyBtnActive: {
    backgroundColor: advisorTheme.accent + '20',
  },
  currencyBtnText: {
    fontSize: typography.body.fontSize,
    color: advisorTheme.textMuted,
  },
  currencyBtnTextActive: {
    color: advisorTheme.accent,
    fontWeight: '600',
  },
  sectionDivider: {
    fontSize: typography.body.fontSize,
    fontWeight: '600',
    color: advisorTheme.accent,
    marginTop: spacing.lg,
    marginBottom: spacing.sm,
  },
  commissionRow: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  commissionItem: {
    flex: 1,
  },
  commissionLabel: {
    fontSize: typography.caption.fontSize,
    color: advisorTheme.textMuted,
    marginBottom: 4,
  },
  commissionInput: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: advisorTheme.surface,
    borderRadius: borderRadius.md,
    paddingHorizontal: spacing.sm,
    height: 44,
  },
  commissionField: {
    flex: 1,
    fontSize: typography.body.fontSize,
    color: advisorTheme.text,
  },
  contactMethodRow: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  contactMethodBtn: {
    flex: 1,
    backgroundColor: advisorTheme.surface,
    borderRadius: borderRadius.md,
    paddingVertical: spacing.sm,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: advisorTheme.border,
  },
  contactMethodBtnActive: {
    backgroundColor: advisorTheme.accent + '20',
    borderColor: advisorTheme.accent,
  },
  contactMethodText: {
    fontSize: typography.caption.fontSize,
    color: advisorTheme.textMuted,
  },
  contactMethodTextActive: {
    color: advisorTheme.accent,
    fontWeight: '600',
  },
  documentsGrid: {
    gap: spacing.sm,
  },
  documentItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: advisorTheme.surface,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    gap: spacing.md,
  },
  documentItemActive: {
    backgroundColor: advisorTheme.accent + '15',
  },
  documentInfo: {
    flex: 1,
  },
  documentLabel: {
    fontSize: typography.body.fontSize,
    color: advisorTheme.text,
  },
  documentRequired: {
    fontSize: typography.caption.fontSize,
    color: advisorTheme.accent,
    marginTop: 2,
  },
  uploadDocsButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: advisorTheme.surface,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    gap: spacing.sm,
    marginTop: spacing.sm,
    borderWidth: 1,
    borderColor: advisorTheme.accent,
  },
  uploadDocsText: {
    fontSize: typography.body.fontSize,
    color: advisorTheme.accent,
    fontWeight: '500',
  },
  summaryCard: {
    backgroundColor: advisorTheme.surface,
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: spacing.sm,
  },
  summaryLabel: {
    fontSize: typography.body.fontSize,
    color: advisorTheme.textMuted,
  },
  summaryValue: {
    fontSize: typography.body.fontSize,
    fontWeight: '600',
    color: advisorTheme.text,
    textAlign: 'right',
    flex: 1,
    marginLeft: spacing.md,
  },
  summaryDivider: {
    height: 1,
    backgroundColor: advisorTheme.border,
    marginVertical: spacing.sm,
  },
  navigationButtons: {
    flexDirection: 'row',
    marginTop: spacing.lg,
    gap: spacing.md,
  },
  secondaryButton: {
    flex: 1,
    height: 52,
    borderRadius: borderRadius.md,
    backgroundColor: advisorTheme.surface,
    justifyContent: 'center',
    alignItems: 'center',
  },
  secondaryButtonText: {
    fontSize: typography.body.fontSize,
    fontWeight: '600',
    color: advisorTheme.text,
  },
  primaryButton: {
    flex: 2,
    height: 52,
    borderRadius: borderRadius.md,
    backgroundColor: advisorTheme.accent,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: spacing.xs,
  },
  primaryButtonDisabled: {
    opacity: 0.5,
  },
  fullWidthButton: {
    flex: 1,
  },
  submitButton: {
    backgroundColor: advisorTheme.success,
  },
  // Estilos para acordeon de documentos
  documentsAccordion: {
    gap: spacing.sm,
  },
  documentAccordionItem: {
    backgroundColor: advisorTheme.surface,
    borderRadius: borderRadius.lg,
    overflow: 'hidden',
  },
  documentAccordionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: spacing.md,
  },
  documentAccordionHeaderExpanded: {
    borderBottomWidth: 1,
    borderBottomColor: advisorTheme.border,
  },
  documentAccordionHeaderWithFile: {
    backgroundColor: advisorTheme.accent + '15',
  },
  documentAccordionLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    gap: spacing.sm,
  },
  documentCheckbox: {
    width: 22,
    height: 22,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: advisorTheme.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  documentCheckboxActive: {
    backgroundColor: advisorTheme.accent,
    borderColor: advisorTheme.accent,
  },
  documentAccordionInfo: {
    flex: 1,
  },
  documentAccordionLabel: {
    fontSize: typography.body.fontSize,
    fontWeight: '500',
    color: advisorTheme.text,
  },
  documentRequiredTag: {
    fontSize: 10,
    color: advisorTheme.error,
    fontWeight: '600',
    marginTop: 2,
  },
  documentFileName: {
    fontSize: typography.caption.fontSize,
    color: advisorTheme.accent,
    marginTop: 2,
  },
  documentAccordionContent: {
    padding: spacing.md,
    backgroundColor: advisorTheme.surfaceLight,
  },
  documentUploadArea: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.lg,
    borderWidth: 2,
    borderStyle: 'dashed',
    borderColor: advisorTheme.border,
    borderRadius: borderRadius.md,
    gap: spacing.xs,
  },
  documentUploadText: {
    fontSize: typography.body.fontSize,
    fontWeight: '600',
    color: advisorTheme.accent,
  },
  documentUploadHint: {
    fontSize: typography.caption.fontSize,
    color: advisorTheme.textMuted,
  },
  documentFilePreview: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  documentFileInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    flex: 1,
  },
  documentFileDetails: {
    flex: 1,
  },
  documentFileNameLarge: {
    fontSize: typography.body.fontSize,
    fontWeight: '500',
    color: advisorTheme.text,
  },
  documentFileStatus: {
    fontSize: typography.caption.fontSize,
    color: advisorTheme.success,
    marginTop: 2,
  },
  documentFileActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  documentChangeBtn: {
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.sm,
    backgroundColor: advisorTheme.surface,
    borderRadius: borderRadius.sm,
  },
  documentChangeBtnText: {
    fontSize: typography.caption.fontSize,
    color: advisorTheme.accent,
    fontWeight: '600',
  },
  documentRemoveBtn: {
    padding: spacing.xs,
  },
  // Archivos adicionales
  additionalFilesSection: {
    marginTop: spacing.lg,
    paddingTop: spacing.lg,
    borderTopWidth: 1,
    borderTopColor: advisorTheme.border,
  },
  additionalFilesTitle: {
    fontSize: typography.body.fontSize,
    fontWeight: '600',
    color: advisorTheme.text,
  },
  additionalFilesHint: {
    fontSize: typography.caption.fontSize,
    color: advisorTheme.textMuted,
    marginTop: 4,
    marginBottom: spacing.md,
  },
  additionalFilesList: {
    gap: spacing.sm,
    marginBottom: spacing.md,
  },
  additionalFileItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: advisorTheme.surface,
    padding: spacing.sm,
    borderRadius: borderRadius.md,
  },
  additionalFileInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  additionalFileItemName: {
    fontSize: typography.body.fontSize,
    color: advisorTheme.text,
  },
  uploadAdditionalBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: advisorTheme.accent,
    borderRadius: borderRadius.md,
    borderStyle: 'dashed',
  },
  uploadAdditionalBtnText: {
    fontSize: typography.body.fontSize,
    color: advisorTheme.accent,
    fontWeight: '500',
  },
})
