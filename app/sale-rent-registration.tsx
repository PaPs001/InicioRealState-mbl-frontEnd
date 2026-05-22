import { useState, useMemo, useEffect } from 'react'
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
  ChevronDown,
  ChevronUp,
  MapPin,
  Home,
  Briefcase,
  Camera,
  Bed,
  Bath,
  Car,
  Ruler,
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

type ListingSource = 'internal' | 'external'

// Secciones colapsables para listado externo
type AccordionSection = 'property' | 'location' | 'owner' | 'source' | 'commission' | 'details' | 'photos'

export default function SaleRentRegistrationScreen() {
  const router = useRouter()
  const { agentCatalogRawData, loadAgentCatalogProperties, hasLoadedAgentCatalog, isAgentCatalogLoading } = useAuth()
  
  // Estados generales
  const [transactionType, setTransactionType] = useState<'rent' | 'sale'>('rent')
  const [listingSource, setListingSource] = useState<ListingSource>('internal')
  
  // Estados para listado INTERNO
  const [selectedProperty, setSelectedProperty] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [showPropertyPicker, setShowPropertyPicker] = useState(false)
  const [priceOption, setPriceOption] = useState<'original' | 'min' | 'custom'>('original')
  const [customAmount, setCustomAmount] = useState('')
  
  // Estados para listado EXTERNO
  const [expandedSections, setExpandedSections] = useState<AccordionSection[]>(['property'])
  const [externalData, setExternalData] = useState({
    // Datos del inmueble
    propertyName: '',
    propertyType: '' as 'house' | 'apartment' | 'land' | '',
    price: '',
    // Ubicacion
    address: '',
    city: '',
    mapsLink: '',
    // Propietario
    ownerName: '',
    ownerPhone: '',
    ownerEmail: '',
    ownerNotes: '',
    // Fuente externa
    sourceName: '',
    sourceContact: '',
    sourceNotes: '',
    // Comisiones
    totalCommission: '',
    externalCommission: '',
    agentCommission: '',
    // Detalles del inmueble
    bedrooms: '',
    bathrooms: '',
    parking: '',
    sqMeters: '',
    description: '',
    amenities: '',
    // Fotos
    photos: [] as string[],
  })
  
  // Estados comunes (cliente)
  const [clientName, setClientName] = useState('')
  const [clientPhone, setClientPhone] = useState('')
  const [clientEmail, setClientEmail] = useState('')
  const [referralCode, setReferralCode] = useState('')

  // Cargar propiedades si no están cargadas
  useEffect(() => {
    if (!hasLoadedAgentCatalog && !isAgentCatalogLoading) {
      loadAgentCatalogProperties()
    }
  }, [hasLoadedAgentCatalog, isAgentCatalogLoading, loadAgentCatalogProperties])

  // Limpiar selección cuando cambia el tipo de transacción o fuente
  const handleTransactionTypeChange = (type: 'rent' | 'sale') => {
    setTransactionType(type)
    setSelectedProperty(null)
    setSearchQuery('')
    setPriceOption('original')
    setCustomAmount('')
  }

  const handleListingSourceChange = (source: ListingSource) => {
    setListingSource(source)
    // Limpiar datos al cambiar fuente
    setSelectedProperty(null)
    setSearchQuery('')
    setPriceOption('original')
    setCustomAmount('')
    setExternalData({
      propertyName: '',
      propertyType: '',
      price: '',
      address: '',
      city: '',
      mapsLink: '',
      ownerName: '',
      ownerPhone: '',
      ownerEmail: '',
      ownerNotes: '',
      sourceName: '',
      sourceContact: '',
      sourceNotes: '',
      totalCommission: '',
      externalCommission: '',
      agentCommission: '',
      bedrooms: '',
      bathrooms: '',
      parking: '',
      sqMeters: '',
      description: '',
      amenities: '',
      photos: [],
    })
  }

  // Toggle para secciones acordeón
  const toggleSection = (section: AccordionSection) => {
    setExpandedSections(prev => 
      prev.includes(section) 
        ? prev.filter(s => s !== section)
        : [...prev, section]
    )
  }

  // Filtrar propiedades por tipo de transacción, disponibilidad y búsqueda
  const filteredProperties = useMemo(() => {
    const filtered = agentCatalogRawData.filter(p => {
      const isSaleType = p.list === 'sale'
      const isRentType = p.list === 'rent'
      const isAvailable = (p.status || '').toLowerCase().includes('disponible')
      
      if (transactionType === 'sale') {
        return isSaleType && isAvailable
      } else {
        return isRentType && isAvailable
      }
    })

    if (!searchQuery.trim()) return filtered
    const query = searchQuery.toLowerCase()
    return filtered.filter(p => 
      p.name.toLowerCase().includes(query) ||
      (p.address || '').toLowerCase().includes(query) ||
      (p.zonaText || '').toLowerCase().includes(query)
    )
  }, [agentCatalogRawData, searchQuery, transactionType])

  // Obtener datos de la propiedad seleccionada
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
    
    if (priceOption === 'original') {
      return selectedPropertyRaw.maxPrice?.toString() || ''
    } else if (priceOption === 'min') {
      return selectedPropertyRaw.minPrice?.toString() || ''
    }
    
    return ''
  }, [selectedPropertyRaw, priceOption, customAmount])

  // Verificar si existe precio mínimo
  const hasMinPrice = useMemo(() => {
    return selectedPropertyRaw?.minPrice != null && selectedPropertyRaw.minPrice > 0
  }, [selectedPropertyRaw])

  // Handlers
  const handleSelectProperty = (propertyId: string) => {
    setSelectedProperty(propertyId)
    setShowPropertyPicker(false)
    setPriceOption('original')
    setCustomAmount('')
  }

  const handleSubmit = () => {
    if (listingSource === 'internal') {
      if (!selectedProperty || !clientName || !clientPhone) {
        Alert.alert('Campos requeridos', 'Por favor completa todos los campos obligatorios')
        return
      }
    } else {
      if (!externalData.propertyName || !externalData.price || !clientName || !clientPhone) {
        Alert.alert('Campos requeridos', 'Por favor completa todos los campos obligatorios')
        return
      }
    }
    
    Alert.alert(
      'Registro enviado',
      `Tu registro de ${transactionType === 'sale' ? 'venta' : 'renta'} ha sido enviado correctamente.`,
      [{ text: 'OK', onPress: () => router.back() }]
    )
  }

  // Validar si el formulario está completo
  const isFormValid = useMemo(() => {
    const clientValid = clientName.trim() && clientPhone.trim()
    
    if (listingSource === 'internal') {
      const propertyValid = selectedProperty && calculatedAmount
      return clientValid && propertyValid
    } else {
      const propertyValid = externalData.propertyName.trim() && externalData.price.trim()
      return clientValid && propertyValid
    }
  }, [listingSource, clientName, clientPhone, selectedProperty, calculatedAmount, externalData])

  // Renderizar item de propiedad en la lista
  const renderPropertyItem = ({ item }: { item: PropertyCatalogItemResponse }) => {
    const isSelected = selectedProperty === item.id
    
    return (
      <TouchableOpacity
        style={[styles.propertyItem, isSelected && styles.propertyItemSelected]}
        onPress={() => handleSelectProperty(item.id)}
      >
        <View style={styles.propertyItemContent}>
          <Text style={styles.propertyItemTitle} numberOfLines={1}>{item.name}</Text>
          <Text style={styles.propertyItemLocation}>{item.zonaText || item.address}</Text>
          <View style={styles.propertyItemPrices}>
            <Text style={styles.propertyItemPrice}>
              Precio: {formatCurrency(item.maxPrice || 0)}
            </Text>
            {item.minPrice != null && item.minPrice > 0 && (
              <Text style={styles.propertyItemMinPrice}>
                Min: {formatCurrency(item.minPrice)}
              </Text>
            )}
          </View>
        </View>
        {isSelected && (
          <Check size={20} color={advisorTheme.accent} />
        )}
      </TouchableOpacity>
    )
  }

  // Renderizar sección acordeón
  const renderAccordionSection = (
    section: AccordionSection, 
    title: string, 
    icon: React.ReactNode,
    content: React.ReactNode
  ) => {
    const isExpanded = expandedSections.includes(section)
    
    return (
      <View style={styles.accordionSection}>
        <TouchableOpacity 
          style={styles.accordionHeader}
          onPress={() => toggleSection(section)}
        >
          <View style={styles.accordionHeaderLeft}>
            {icon}
            <Text style={styles.accordionTitle}>{title}</Text>
          </View>
          {isExpanded ? (
            <ChevronUp size={20} color={advisorTheme.textMuted} />
          ) : (
            <ChevronDown size={20} color={advisorTheme.textMuted} />
          )}
        </TouchableOpacity>
        {isExpanded && (
          <View style={styles.accordionContent}>
            {content}
          </View>
        )}
      </View>
    )
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <ArrowLeft size={24} color={advisorTheme.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Registrar Venta/Renta</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView 
        style={styles.content}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {/* Tipo de transacción */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Tipo de Transaccion *</Text>
          <View style={styles.toggleContainer}>
            <TouchableOpacity 
              style={[styles.toggleButton, transactionType === 'sale' && styles.toggleButtonActive]}
              onPress={() => handleTransactionTypeChange('sale')}
            >
              <Text style={[styles.toggleText, transactionType === 'sale' && styles.toggleTextActive]}>
                Venta
              </Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={[styles.toggleButton, transactionType === 'rent' && styles.toggleButtonActive]}
              onPress={() => handleTransactionTypeChange('rent')}
            >
              <Text style={[styles.toggleText, transactionType === 'rent' && styles.toggleTextActive]}>
                Renta
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Fuente del listado */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Origen del Inmueble *</Text>
          <View style={styles.sourceContainer}>
            <TouchableOpacity 
              style={[styles.sourceOption, listingSource === 'internal' && styles.sourceOptionActive]}
              onPress={() => handleListingSourceChange('internal')}
            >
              <View style={styles.sourceOptionRadio}>
                {listingSource === 'internal' && <View style={styles.sourceOptionRadioInner} />}
              </View>
              <View style={styles.sourceOptionContent}>
                <Text style={styles.sourceOptionTitle}>Listado Interno</Text>
                <Text style={styles.sourceOptionDesc}>Propiedad del catalogo de Inicio</Text>
              </View>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={[styles.sourceOption, listingSource === 'external' && styles.sourceOptionActive]}
              onPress={() => handleListingSourceChange('external')}
            >
              <View style={styles.sourceOptionRadio}>
                {listingSource === 'external' && <View style={styles.sourceOptionRadioInner} />}
              </View>
              <View style={styles.sourceOptionContent}>
                <Text style={styles.sourceOptionTitle}>Listado Externo</Text>
                <Text style={styles.sourceOptionDesc}>Propiedad de otra inmobiliaria o particular</Text>
              </View>
            </TouchableOpacity>
          </View>
        </View>

        {/* LISTADO INTERNO */}
        {listingSource === 'internal' && (
          <>
            {/* Seleccionar propiedad */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Seleccionar Propiedad *</Text>
              
              {/* Campo de búsqueda */}
              <TouchableOpacity 
                style={styles.searchContainer}
                onPress={() => setShowPropertyPicker(true)}
              >
                <Search size={20} color={advisorTheme.textMuted} />
                <TextInput
                  style={styles.searchInput}
                  placeholder="Buscar por nombre o ubicacion..."
                  placeholderTextColor={advisorTheme.textMuted}
                  value={searchQuery}
                  onChangeText={setSearchQuery}
                  onFocus={() => setShowPropertyPicker(true)}
                />
                {searchQuery.length > 0 && (
                  <TouchableOpacity onPress={() => setSearchQuery('')}>
                    <X size={20} color={advisorTheme.textMuted} />
                  </TouchableOpacity>
                )}
              </TouchableOpacity>

              {/* Propiedad seleccionada */}
              {selectedPropertyRaw && !showPropertyPicker && (
                <View style={styles.selectedPropertyCard}>
                  <View style={styles.selectedPropertyContent}>
                    <Building2 size={24} color={advisorTheme.accent} />
                    <View style={styles.selectedPropertyInfo}>
                      <Text style={styles.selectedPropertyTitle}>{selectedPropertyRaw.name}</Text>
                      <Text style={styles.selectedPropertyLocation}>{selectedPropertyRaw.zonaText || selectedPropertyRaw.address}</Text>
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
                  {/* Precio original (maxPrice) */}
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
                        {formatCurrency(selectedPropertyRaw.maxPrice || 0)}
                      </Text>
                    </View>
                  </TouchableOpacity>

                  {/* Precio mínimo (solo si existe) */}
                  {hasMinPrice && (
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
                          {formatCurrency(selectedPropertyRaw.minPrice || 0)}
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
                      {priceOption === 'custom' && (
                        <View style={styles.customPriceInput}>
                          <DollarSign size={16} color={advisorTheme.textMuted} />
                          <TextInput
                            style={styles.customPriceTextInput}
                            placeholder="Ingresa el monto"
                            placeholderTextColor={advisorTheme.textMuted}
                            keyboardType="numeric"
                            value={customAmount}
                            onChangeText={setCustomAmount}
                          />
                        </View>
                      )}
                    </View>
                  </TouchableOpacity>
                </View>
              </View>
            )}
          </>
        )}

        {/* LISTADO EXTERNO */}
        {listingSource === 'external' && (
          <View style={styles.externalContainer}>
            {/* Seccion: Datos del Inmueble */}
            {renderAccordionSection(
              'property',
              'Datos del Inmueble',
              <Building2 size={20} color={advisorTheme.accent} />,
              <View style={styles.accordionFields}>
                <View style={styles.inputGroup}>
                  <Text style={styles.inputLabel}>Nombre del inmueble *</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="Ej: Casa en Polanco"
                    placeholderTextColor={advisorTheme.textMuted}
                    value={externalData.propertyName}
                    onChangeText={(text) => setExternalData({ ...externalData, propertyName: text })}
                  />
                </View>
                
                <View style={styles.inputGroup}>
                  <Text style={styles.inputLabel}>Tipo de propiedad</Text>
                  <View style={styles.propertyTypeContainer}>
                    {[
                      { value: 'house', label: 'Casa' },
                      { value: 'apartment', label: 'Depto' },
                      { value: 'land', label: 'Terreno' },
                    ].map((type) => (
                      <TouchableOpacity
                        key={type.value}
                        style={[
                          styles.propertyTypeButton,
                          externalData.propertyType === type.value && styles.propertyTypeButtonActive
                        ]}
                        onPress={() => setExternalData({ ...externalData, propertyType: type.value as any })}
                      >
                        <Text style={[
                          styles.propertyTypeText,
                          externalData.propertyType === type.value && styles.propertyTypeTextActive
                        ]}>
                          {type.label}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                </View>

                <View style={styles.inputGroup}>
                  <Text style={styles.inputLabel}>
                    {transactionType === 'sale' ? 'Precio de venta' : 'Renta mensual'} *
                  </Text>
                  <View style={styles.inputWithIcon}>
                    <DollarSign size={20} color={advisorTheme.textMuted} />
                    <TextInput
                      style={styles.inputInner}
                      placeholder="0.00"
                      placeholderTextColor={advisorTheme.textMuted}
                      keyboardType="numeric"
                      value={externalData.price}
                      onChangeText={(text) => setExternalData({ ...externalData, price: text })}
                    />
                    <Text style={styles.inputSuffix}>MXN</Text>
                  </View>
                </View>
              </View>
            )}

            {/* Seccion: Ubicacion */}
            {renderAccordionSection(
              'location',
              'Ubicacion',
              <MapPin size={20} color={advisorTheme.accent} />,
              <View style={styles.accordionFields}>
                <View style={styles.inputGroup}>
                  <Text style={styles.inputLabel}>Direccion</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="Calle, numero, colonia"
                    placeholderTextColor={advisorTheme.textMuted}
                    value={externalData.address}
                    onChangeText={(text) => setExternalData({ ...externalData, address: text })}
                  />
                </View>
                
                <View style={styles.inputGroup}>
                  <Text style={styles.inputLabel}>Ciudad</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="Ciudad o zona"
                    placeholderTextColor={advisorTheme.textMuted}
                    value={externalData.city}
                    onChangeText={(text) => setExternalData({ ...externalData, city: text })}
                  />
                </View>

                <View style={styles.inputGroup}>
                  <Text style={styles.inputLabel}>Link de Google Maps</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="https://maps.google.com/..."
                    placeholderTextColor={advisorTheme.textMuted}
                    value={externalData.mapsLink}
                    onChangeText={(text) => setExternalData({ ...externalData, mapsLink: text })}
                    autoCapitalize="none"
                  />
                </View>
              </View>
            )}

            {/* Seccion: Propietario */}
            {renderAccordionSection(
              'owner',
              'Propietario',
              <User size={20} color={advisorTheme.accent} />,
              <View style={styles.accordionFields}>
                <View style={styles.inputGroup}>
                  <Text style={styles.inputLabel}>Nombre del dueno</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="Nombre completo"
                    placeholderTextColor={advisorTheme.textMuted}
                    value={externalData.ownerName}
                    onChangeText={(text) => setExternalData({ ...externalData, ownerName: text })}
                  />
                </View>
                
                <View style={styles.inputGroup}>
                  <Text style={styles.inputLabel}>Telefono</Text>
                  <View style={styles.inputWithIcon}>
                    <Phone size={20} color={advisorTheme.textMuted} />
                    <TextInput
                      style={styles.inputInner}
                      placeholder="10 digitos"
                      placeholderTextColor={advisorTheme.textMuted}
                      keyboardType="phone-pad"
                      value={externalData.ownerPhone}
                      onChangeText={(text) => setExternalData({ ...externalData, ownerPhone: text })}
                    />
                  </View>
                </View>

                <View style={styles.inputGroup}>
                  <Text style={styles.inputLabel}>Email</Text>
                  <View style={styles.inputWithIcon}>
                    <Mail size={20} color={advisorTheme.textMuted} />
                    <TextInput
                      style={styles.inputInner}
                      placeholder="correo@ejemplo.com"
                      placeholderTextColor={advisorTheme.textMuted}
                      keyboardType="email-address"
                      autoCapitalize="none"
                      value={externalData.ownerEmail}
                      onChangeText={(text) => setExternalData({ ...externalData, ownerEmail: text })}
                    />
                  </View>
                </View>

                <View style={styles.inputGroup}>
                  <Text style={styles.inputLabel}>Notas adicionales</Text>
                  <TextInput
                    style={[styles.input, styles.textArea]}
                    placeholder="Informacion adicional del propietario..."
                    placeholderTextColor={advisorTheme.textMuted}
                    multiline
                    numberOfLines={3}
                    value={externalData.ownerNotes}
                    onChangeText={(text) => setExternalData({ ...externalData, ownerNotes: text })}
                  />
                </View>
              </View>
            )}

            {/* Seccion: Fuente Externa */}
            {renderAccordionSection(
              'source',
              'Asesor/Empresa Externa',
              <Briefcase size={20} color={advisorTheme.accent} />,
              <View style={styles.accordionFields}>
                <View style={styles.inputGroup}>
                  <Text style={styles.inputLabel}>Nombre del asesor o empresa</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="Ej: Century 21, Juan Perez"
                    placeholderTextColor={advisorTheme.textMuted}
                    value={externalData.sourceName}
                    onChangeText={(text) => setExternalData({ ...externalData, sourceName: text })}
                  />
                </View>
                
                <View style={styles.inputGroup}>
                  <Text style={styles.inputLabel}>Contacto</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="Telefono o email de contacto"
                    placeholderTextColor={advisorTheme.textMuted}
                    value={externalData.sourceContact}
                    onChangeText={(text) => setExternalData({ ...externalData, sourceContact: text })}
                  />
                </View>

                <View style={styles.inputGroup}>
                  <Text style={styles.inputLabel}>Informacion general</Text>
                  <TextInput
                    style={[styles.input, styles.textArea]}
                    placeholder="Detalles adicionales de la fuente..."
                    placeholderTextColor={advisorTheme.textMuted}
                    multiline
                    numberOfLines={3}
                    value={externalData.sourceNotes}
                    onChangeText={(text) => setExternalData({ ...externalData, sourceNotes: text })}
                  />
                </View>
              </View>
            )}

            {/* Seccion: Comisiones */}
            {renderAccordionSection(
              'commission',
              'Comisiones',
              <DollarSign size={20} color={advisorTheme.accent} />,
              <View style={styles.accordionFields}>
                <View style={styles.inputGroup}>
                  <Text style={styles.inputLabel}>Comision total</Text>
                  <View style={styles.inputWithIcon}>
                    <DollarSign size={20} color={advisorTheme.textMuted} />
                    <TextInput
                      style={styles.inputInner}
                      placeholder="0.00"
                      placeholderTextColor={advisorTheme.textMuted}
                      keyboardType="numeric"
                      value={externalData.totalCommission}
                      onChangeText={(text) => setExternalData({ ...externalData, totalCommission: text })}
                    />
                    <Text style={styles.inputSuffix}>MXN</Text>
                  </View>
                </View>
                
                <View style={styles.inputGroup}>
                  <Text style={styles.inputLabel}>Comision para la otra parte</Text>
                  <View style={styles.inputWithIcon}>
                    <DollarSign size={20} color={advisorTheme.textMuted} />
                    <TextInput
                      style={styles.inputInner}
                      placeholder="0.00"
                      placeholderTextColor={advisorTheme.textMuted}
                      keyboardType="numeric"
                      value={externalData.externalCommission}
                      onChangeText={(text) => setExternalData({ ...externalData, externalCommission: text })}
                    />
                    <Text style={styles.inputSuffix}>MXN</Text>
                  </View>
                </View>

                <View style={styles.inputGroup}>
                  <Text style={styles.inputLabel}>Tu comision</Text>
                  <View style={styles.inputWithIcon}>
                    <DollarSign size={20} color={advisorTheme.textMuted} />
                    <TextInput
                      style={styles.inputInner}
                      placeholder="0.00"
                      placeholderTextColor={advisorTheme.textMuted}
                      keyboardType="numeric"
                      value={externalData.agentCommission}
                      onChangeText={(text) => setExternalData({ ...externalData, agentCommission: text })}
                    />
                    <Text style={styles.inputSuffix}>MXN</Text>
                  </View>
                </View>
              </View>
            )}

            {/* Seccion: Detalles del Inmueble */}
            {renderAccordionSection(
              'details',
              'Detalles del Inmueble',
              <Home size={20} color={advisorTheme.accent} />,
              <View style={styles.accordionFields}>
                <View style={styles.inputRow}>
                  <View style={[styles.inputGroup, { flex: 1 }]}>
                    <Text style={styles.inputLabel}>Recamaras</Text>
                    <View style={styles.inputWithIcon}>
                      <Bed size={20} color={advisorTheme.textMuted} />
                      <TextInput
                        style={styles.inputInner}
                        placeholder="0"
                        placeholderTextColor={advisorTheme.textMuted}
                        keyboardType="numeric"
                        value={externalData.bedrooms}
                        onChangeText={(text) => setExternalData({ ...externalData, bedrooms: text })}
                      />
                    </View>
                  </View>
                  
                  <View style={[styles.inputGroup, { flex: 1 }]}>
                    <Text style={styles.inputLabel}>Banos</Text>
                    <View style={styles.inputWithIcon}>
                      <Bath size={20} color={advisorTheme.textMuted} />
                      <TextInput
                        style={styles.inputInner}
                        placeholder="0"
                        placeholderTextColor={advisorTheme.textMuted}
                        keyboardType="numeric"
                        value={externalData.bathrooms}
                        onChangeText={(text) => setExternalData({ ...externalData, bathrooms: text })}
                      />
                    </View>
                  </View>
                </View>

                <View style={styles.inputRow}>
                  <View style={[styles.inputGroup, { flex: 1 }]}>
                    <Text style={styles.inputLabel}>Estacionamiento</Text>
                    <View style={styles.inputWithIcon}>
                      <Car size={20} color={advisorTheme.textMuted} />
                      <TextInput
                        style={styles.inputInner}
                        placeholder="0"
                        placeholderTextColor={advisorTheme.textMuted}
                        keyboardType="numeric"
                        value={externalData.parking}
                        onChangeText={(text) => setExternalData({ ...externalData, parking: text })}
                      />
                    </View>
                  </View>
                  
                  <View style={[styles.inputGroup, { flex: 1 }]}>
                    <Text style={styles.inputLabel}>m2</Text>
                    <View style={styles.inputWithIcon}>
                      <Ruler size={20} color={advisorTheme.textMuted} />
                      <TextInput
                        style={styles.inputInner}
                        placeholder="0"
                        placeholderTextColor={advisorTheme.textMuted}
                        keyboardType="numeric"
                        value={externalData.sqMeters}
                        onChangeText={(text) => setExternalData({ ...externalData, sqMeters: text })}
                      />
                    </View>
                  </View>
                </View>

                <View style={styles.inputGroup}>
                  <Text style={styles.inputLabel}>Descripcion</Text>
                  <TextInput
                    style={[styles.input, styles.textArea]}
                    placeholder="Descripcion general del inmueble..."
                    placeholderTextColor={advisorTheme.textMuted}
                    multiline
                    numberOfLines={4}
                    value={externalData.description}
                    onChangeText={(text) => setExternalData({ ...externalData, description: text })}
                  />
                </View>

                <View style={styles.inputGroup}>
                  <Text style={styles.inputLabel}>Amenidades</Text>
                  <TextInput
                    style={[styles.input, styles.textArea]}
                    placeholder="Ej: Alberca, gimnasio, seguridad 24/7..."
                    placeholderTextColor={advisorTheme.textMuted}
                    multiline
                    numberOfLines={2}
                    value={externalData.amenities}
                    onChangeText={(text) => setExternalData({ ...externalData, amenities: text })}
                  />
                </View>
              </View>
            )}

            {/* Seccion: Fotos (opcional) */}
            {renderAccordionSection(
              'photos',
              'Fotos (opcional)',
              <Camera size={20} color={advisorTheme.accent} />,
              <View style={styles.accordionFields}>
                <TouchableOpacity style={styles.uploadPhotoButton}>
                  <Upload size={24} color={advisorTheme.accent} />
                  <Text style={styles.uploadPhotoText}>Agregar fotos del inmueble</Text>
                  <Text style={styles.uploadPhotoHint}>Toca para seleccionar imagenes</Text>
                </TouchableOpacity>
                
                {externalData.photos.length > 0 && (
                  <View style={styles.photosPreview}>
                    {externalData.photos.map((photo, index) => (
                      <View key={index} style={styles.photoPreviewItem}>
                        <Text style={styles.photoPreviewText}>Foto {index + 1}</Text>
                      </View>
                    ))}
                  </View>
                )}
              </View>
            )}
          </View>
        )}

        {/* Datos del cliente (comun para ambos) */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Datos del Cliente *</Text>
          
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Nombre completo *</Text>
            <View style={styles.inputWithIcon}>
              <User size={20} color={advisorTheme.textMuted} />
              <TextInput
                style={styles.inputInner}
                placeholder="Nombre del cliente"
                placeholderTextColor={advisorTheme.textMuted}
                value={clientName}
                onChangeText={setClientName}
              />
            </View>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Telefono *</Text>
            <View style={styles.inputWithIcon}>
              <Phone size={20} color={advisorTheme.textMuted} />
              <TextInput
                style={styles.inputInner}
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
            <View style={styles.inputWithIcon}>
              <Mail size={20} color={advisorTheme.textMuted} />
              <TextInput
                style={styles.inputInner}
                placeholder="correo@ejemplo.com"
                placeholderTextColor={advisorTheme.textMuted}
                keyboardType="email-address"
                autoCapitalize="none"
                value={clientEmail}
                onChangeText={setClientEmail}
              />
            </View>
          </View>
        </View>

        {/* Codigo de referido */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Codigo de Referido (opcional)</Text>
          <View style={styles.inputWithIcon}>
            <FileText size={20} color={advisorTheme.textMuted} />
            <TextInput
              style={styles.inputInner}
              placeholder="Ingresa el codigo si aplica"
              placeholderTextColor={advisorTheme.textMuted}
              value={referralCode}
              onChangeText={setReferralCode}
            />
          </View>
        </View>

        {/* Subir documentos */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Documentos (opcional)</Text>
          <TouchableOpacity style={styles.uploadButton}>
            <Upload size={24} color={advisorTheme.accent} />
            <Text style={styles.uploadButtonText}>Subir documentos</Text>
          </TouchableOpacity>
        </View>

        {/* Boton de enviar */}
        <TouchableOpacity 
          style={[styles.submitButton, !isFormValid && styles.submitButtonDisabled]}
          onPress={handleSubmit}
          disabled={!isFormValid}
        >
          <Text style={styles.submitButtonText}>Enviar Registro</Text>
        </TouchableOpacity>

        <View style={{ height: 40 }} />
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
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: advisorTheme.border,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: borderRadius.full,
    backgroundColor: advisorTheme.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: typography.h4.fontSize,
    fontWeight: '700',
    color: advisorTheme.text,
  },
  content: {
    flex: 1,
    padding: spacing.md,
  },
  section: {
    marginBottom: spacing.lg,
  },
  sectionTitle: {
    fontSize: typography.body.fontSize,
    fontWeight: '600',
    color: advisorTheme.text,
    marginBottom: spacing.sm,
  },
  toggleContainer: {
    flexDirection: 'row',
    backgroundColor: advisorTheme.surface,
    borderRadius: borderRadius.lg,
    padding: 4,
  },
  toggleButton: {
    flex: 1,
    paddingVertical: spacing.sm,
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
  sourceContainer: {
    gap: spacing.sm,
  },
  sourceOption: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.md,
    backgroundColor: advisorTheme.surface,
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    borderColor: advisorTheme.border,
  },
  sourceOptionActive: {
    borderColor: advisorTheme.accent,
  },
  sourceOptionRadio: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: advisorTheme.textMuted,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.sm,
  },
  sourceOptionRadioInner: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: advisorTheme.accent,
  },
  sourceOptionContent: {
    flex: 1,
  },
  sourceOptionTitle: {
    fontSize: typography.body.fontSize,
    fontWeight: '600',
    color: advisorTheme.text,
  },
  sourceOptionDesc: {
    fontSize: typography.caption.fontSize,
    color: advisorTheme.textMuted,
    marginTop: 2,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: advisorTheme.surface,
    borderRadius: borderRadius.lg,
    paddingHorizontal: spacing.md,
    borderWidth: 1,
    borderColor: advisorTheme.border,
  },
  searchInput: {
    flex: 1,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.sm,
    color: advisorTheme.text,
    fontSize: typography.body.fontSize,
  },
  selectedPropertyCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: spacing.md,
    backgroundColor: advisorTheme.surface,
    borderRadius: borderRadius.lg,
    marginTop: spacing.sm,
    borderWidth: 1,
    borderColor: advisorTheme.accent,
  },
  selectedPropertyContent: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  selectedPropertyInfo: {
    marginLeft: spacing.sm,
    flex: 1,
  },
  selectedPropertyTitle: {
    fontSize: typography.body.fontSize,
    fontWeight: '600',
    color: advisorTheme.text,
  },
  selectedPropertyLocation: {
    fontSize: typography.caption.fontSize,
    color: advisorTheme.textMuted,
  },
  changeButton: {
    color: advisorTheme.accent,
    fontWeight: '600',
  },
  propertyListContainer: {
    marginTop: spacing.sm,
    backgroundColor: advisorTheme.surface,
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    borderColor: advisorTheme.border,
    maxHeight: 300,
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
    backgroundColor: advisorTheme.accent + '20',
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
  },
  propertyItemPrices: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginTop: spacing.xs,
  },
  propertyItemPrice: {
    fontSize: typography.caption.fontSize,
    color: advisorTheme.accent,
    fontWeight: '600',
  },
  propertyItemMinPrice: {
    fontSize: typography.caption.fontSize,
    color: advisorTheme.textSecondary,
  },
  closeListButton: {
    padding: spacing.sm,
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: advisorTheme.border,
  },
  closeListButtonText: {
    color: advisorTheme.accent,
    fontWeight: '600',
  },
  emptyList: {
    padding: spacing.lg,
    alignItems: 'center',
  },
  emptyListText: {
    color: advisorTheme.textMuted,
  },
  priceOptionsContainer: {
    gap: spacing.sm,
  },
  priceOption: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    padding: spacing.md,
    backgroundColor: advisorTheme.surface,
    borderRadius: borderRadius.lg,
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
    borderColor: advisorTheme.textMuted,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.sm,
    marginTop: 2,
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
    fontSize: typography.h4.fontSize,
    fontWeight: '700',
    color: advisorTheme.accent,
    marginTop: spacing.xs,
  },
  customPriceInput: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: advisorTheme.background,
    borderRadius: borderRadius.md,
    paddingHorizontal: spacing.sm,
    marginTop: spacing.sm,
  },
  customPriceTextInput: {
    flex: 1,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.xs,
    color: advisorTheme.text,
    fontSize: typography.body.fontSize,
  },
  externalContainer: {
    gap: spacing.sm,
  },
  accordionSection: {
    backgroundColor: advisorTheme.surface,
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    borderColor: advisorTheme.border,
    overflow: 'hidden',
  },
  accordionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: spacing.md,
  },
  accordionHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  accordionTitle: {
    fontSize: typography.body.fontSize,
    fontWeight: '600',
    color: advisorTheme.text,
  },
  accordionContent: {
    padding: spacing.md,
    paddingTop: 0,
    borderTopWidth: 1,
    borderTopColor: advisorTheme.border,
  },
  accordionFields: {
    paddingTop: spacing.md,
    gap: spacing.md,
  },
  inputGroup: {
    gap: spacing.xs,
  },
  inputLabel: {
    fontSize: typography.caption.fontSize,
    color: advisorTheme.textSecondary,
    fontWeight: '500',
  },
  input: {
    backgroundColor: advisorTheme.background,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    color: advisorTheme.text,
    fontSize: typography.body.fontSize,
    borderWidth: 1,
    borderColor: advisorTheme.border,
  },
  inputWithIcon: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: advisorTheme.background,
    borderRadius: borderRadius.md,
    paddingHorizontal: spacing.md,
    borderWidth: 1,
    borderColor: advisorTheme.border,
  },
  inputInner: {
    flex: 1,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.sm,
    color: advisorTheme.text,
    fontSize: typography.body.fontSize,
  },
  inputSuffix: {
    color: advisorTheme.textMuted,
    fontSize: typography.caption.fontSize,
  },
  inputRow: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  textArea: {
    height: 100,
    textAlignVertical: 'top',
  },
  propertyTypeContainer: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  propertyTypeButton: {
    flex: 1,
    padding: spacing.sm,
    backgroundColor: advisorTheme.background,
    borderRadius: borderRadius.md,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: advisorTheme.border,
  },
  propertyTypeButtonActive: {
    borderColor: advisorTheme.accent,
    backgroundColor: advisorTheme.accent + '20',
  },
  propertyTypeText: {
    color: advisorTheme.textMuted,
    fontSize: typography.caption.fontSize,
    fontWeight: '500',
  },
  propertyTypeTextActive: {
    color: advisorTheme.accent,
  },
  uploadPhotoButton: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.lg,
    backgroundColor: advisorTheme.background,
    borderRadius: borderRadius.lg,
    borderWidth: 2,
    borderColor: advisorTheme.border,
    borderStyle: 'dashed',
  },
  uploadPhotoText: {
    color: advisorTheme.text,
    fontSize: typography.body.fontSize,
    fontWeight: '600',
    marginTop: spacing.sm,
  },
  uploadPhotoHint: {
    color: advisorTheme.textMuted,
    fontSize: typography.caption.fontSize,
    marginTop: spacing.xs,
  },
  photosPreview: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
    marginTop: spacing.md,
  },
  photoPreviewItem: {
    width: 80,
    height: 80,
    backgroundColor: advisorTheme.background,
    borderRadius: borderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  photoPreviewText: {
    color: advisorTheme.textMuted,
    fontSize: typography.caption.fontSize,
  },
  uploadButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.md,
    backgroundColor: advisorTheme.surface,
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    borderColor: advisorTheme.border,
    gap: spacing.sm,
  },
  uploadButtonText: {
    color: advisorTheme.text,
    fontSize: typography.body.fontSize,
    fontWeight: '500',
  },
  submitButton: {
    backgroundColor: advisorTheme.accent,
    padding: spacing.md,
    borderRadius: borderRadius.lg,
    alignItems: 'center',
    marginTop: spacing.md,
  },
  submitButtonDisabled: {
    opacity: 0.5,
  },
  submitButtonText: {
    color: advisorTheme.background,
    fontSize: typography.body.fontSize,
    fontWeight: '700',
  },
})
