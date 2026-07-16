import { memo, useCallback, useEffect, useMemo, useState, type ReactNode } from 'react'
import { ActivityIndicator, Alert, BackHandler, FlatList, Image, InteractionManager, Modal, Pressable, ScrollView, Text, TextInput, TouchableOpacity, useWindowDimensions, View, type ListRenderItem } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useLocalSearchParams, usePathname, useRouter } from 'expo-router'
import {
  Armchair,
  Bath,
  BedDouble,
  Car,
  ChevronDown,
  ChevronLeft,
  Home,
  Map as MapIcon,
  MapPin,
  PawPrint,
  Search,
  ShieldCheck,
  SlidersHorizontal,
  Star,
  TreePine,
  Waves,
} from 'lucide-react-native'
import { useAuth } from '@/contexts/AuthContext'
import { usePropertyDomain } from '@/contexts/auth/use-property-domain'
import { createAndOpenTemporaryPropertyListPdf } from '@/lib/api'
import { useHideBottomNav } from '@/lib/navigation/bottom-nav-visibility'
import type { PdfReportAgentName, PdfReportDesign } from '@/lib/api'
import type { Property } from '@/lib/types'
import { formatCurrency } from '@/lib/utils'
import { styles } from './properties-list.styles'

type ListingProperty = {
  id: string
  title: string
  code: string
  city: string
  price: number
  bedrooms: string
  bedroomsCount: number
  bathrooms: string
  bathroomsCount: number
  parking: string
  parkingCount: number
  isFurnished: boolean
  image?: string
  tags: string[]
  status: Property['status']
}

type ListingFilter = 'all' | 'rent' | 'sale'
type FurnishingFilter = 'all' | 'furnished' | 'unfurnished'
type SortOption = 'price_desc' | 'price_asc' | 'rent_under_10' | 'rent_under_20' | 'rent_over_20'

const PDF_AGENTS: PdfReportAgentName[] = [
  'AlexaDiaz',
  'JoseAntonio',
  'CitlalliTapia',
  'JorgeSanchez',
  'VictorPerea',
  'HectorEspinoza',
  'CarlosTrujeque',
  'MatteoAguilar',
  'EdgarZavala',
  'DiegoLedezma',
  'DanielaVillanueva',
]

const PDF_AGENT_LABELS: Record<PdfReportAgentName, string> = {
  AlexaDiaz: 'Alexa Diaz',
  JoseAntonio: 'Jose Antonio',
  CitlalliTapia: 'Citlalli Tapia',
  JorgeSanchez: 'Jorge Sanchez',
  VictorPerea: 'Victor Perea',
  HectorEspinoza: 'Hector Espinoza',
  CarlosTrujeque: 'Carlos Trujeque',
  MatteoAguilar: 'Matteo Aguilar',
  EdgarZavala: 'Edgar Zavala',
  DiegoLedezma: 'Diego Ledezma',
  DanielaVillanueva: 'Daniela Villanueva',
}

const PDF_REPORT_LOCATION = 'TODAS'
const PDF_DESIGNS: PdfReportDesign[] = ['modern', 'original', 'whiteBoard']
const pdfDesignLabels: Record<string, string> = {
  modern: 'Modern',
  original: 'Original',
  whiteBoard: 'White Board',
}

function mapPropertyToListing(property: Property): ListingProperty {
  const amenities = property.amenities?.length ? property.amenities : property.features ?? []
  const parkingCount = getParkingValue(amenities)

  return {
    id: property.id || property._id || property.title,
    title: property.title || 'Propiedad disponible',
    code: property.address || property.city || 'Inventario de renta',
    city: property.city || 'Zona sin asignar',
    price: property.monthlyRent ?? property.price ?? 0,
    bedrooms: String(property.bedrooms ?? 0),
    bedroomsCount: property.bedrooms ?? 0,
    bathrooms: String(property.bathrooms ?? 0),
    bathroomsCount: property.bathrooms ?? 0,
    parking: String(parkingCount),
    parkingCount,
    isFurnished: amenities.some(amenity => /amuebl/i.test(amenity)),
    image: property.images?.[0],
    tags: normalizeTags(amenities),
    status: property.status,
  }
}

function getParkingValue(amenities: string[]) {
  const parkingAmenity = amenities.find(amenity => /estac|parking|auto/i.test(amenity))
  const match = parkingAmenity?.match(/\d+/)

  return Number(match?.[0] ?? 2)
}

function normalizeTags(amenities: string[]) {
  const preferredTags = amenities.filter(Boolean).slice(0, 6)

  return preferredTags.length > 0
    ? preferredTags
    : ['Seguridad 24/7', 'Areas verdes', 'Alberca', 'Pet friendly', 'Vista Alberca', 'Amueblada']
}

function waitForHeavyUiToUnmount() {
  return new Promise<void>(resolve => {
    InteractionManager.runAfterInteractions(() => {
      setTimeout(resolve, 120)
    })
  })
}

function normalizeText(value: string) {
  return value.trim().toLowerCase()
}

function parsePriceFilter(value: string) {
  const parsed = Number(value.replace(/[^\d.]/g, ''))

  return Number.isFinite(parsed) && parsed > 0 ? parsed : null
}

function isRentListing(property: ListingProperty) {
  return property.status === 'for_rent' || property.status === 'pending_rent'
}

function getSortLabel(sortOption: SortOption) {
  switch (sortOption) {
    case 'price_asc':
      return 'Menor a mayor'
    case 'rent_under_10':
      return 'Rentas menores de 10'
    case 'rent_under_20':
      return 'Rentas menores de 20'
    case 'rent_over_20':
      return 'Rentas mayores de 20'
    default:
      return 'Mayor a menor'
  }
}

export default function CoordinatorPropertiesListScreen() {
  const router = useRouter()
  const pathname = usePathname()
  const params = useLocalSearchParams<{ type?: string }>()
  const { authToken } = useAuth()
  const { width } = useWindowDimensions()
  const canvasWidth = Math.min(width, 440)
  const initialListingFilter: ListingFilter = params.type === 'sale' ? 'sale' : params.type === 'rent' ? 'rent' : 'all'
  const routeBase = pathname.startsWith('/userAdviser') ? '/userAdviser' : '/userCoordinator'
  const {
    availableProperties,
    catalogProperties,
    hasLoadedCatalog,
    isCatalogLoading,
    loadCatalogProperties,
  } = usePropertyDomain()
  const [searchQuery, setSearchQuery] = useState('')
  const [isMapMode, setIsMapMode] = useState(false)
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false)
  const [isPdfCleanupMode, setIsPdfCleanupMode] = useState(false)
  const [isSelectingProperties, setIsSelectingProperties] = useState(false)
  const [selectedPropertyIds, setSelectedPropertyIds] = useState<string[]>([])
  const [isPdfOptionsVisible, setIsPdfOptionsVisible] = useState(false)
  const [pdfAgentName, setPdfAgentName] = useState<PdfReportAgentName>('AlexaDiaz')
  const [pdfDesign, setPdfDesign] = useState<PdfReportDesign>('modern')
  const [listingFilter, setListingFilter] = useState<ListingFilter>(initialListingFilter)
  const [isFiltersVisible, setIsFiltersVisible] = useState(false)
  const [isSortVisible, setIsSortVisible] = useState(false)
  const [zoneFilter, setZoneFilter] = useState('')
  const [minPriceFilter, setMinPriceFilter] = useState('')
  const [maxPriceFilter, setMaxPriceFilter] = useState('')
  const [bedroomsFilter, setBedroomsFilter] = useState<number | null>(null)
  const [bathroomsFilter, setBathroomsFilter] = useState<number | null>(null)
  const [parkingFilter, setParkingFilter] = useState<number | null>(null)
  const [furnishingFilter, setFurnishingFilter] = useState<FurnishingFilter>('all')
  const [sortOption, setSortOption] = useState<SortOption>('price_desc')

  useEffect(() => {
    if (!hasLoadedCatalog && !isCatalogLoading) {
      loadCatalogProperties()
    }
  }, [hasLoadedCatalog, isCatalogLoading, loadCatalogProperties])

  const listings = useMemo(() => {
    const source = (catalogProperties.length > 0 ? catalogProperties : availableProperties)
      .filter(property => {
        const isSale = property.status === 'for_sale' || property.status === 'pending_sale'
        const isRent = property.status === 'for_rent' || property.status === 'pending_rent' || !!property.monthlyRent

        if (listingFilter === 'sale') return isSale
        if (listingFilter === 'rent') return isRent
        return isSale || isRent
      })
      .map(mapPropertyToListing)

    return source
  }, [availableProperties, catalogProperties, listingFilter])

  const filteredListings = useMemo(() => {
    const normalizedQuery = searchQuery.trim().toLowerCase()
    const normalizedZone = normalizeText(zoneFilter)
    const minPrice = parsePriceFilter(minPriceFilter)
    const maxPrice = parsePriceFilter(maxPriceFilter)

    const nextListings = listings.filter(property => {
      const searchableText = `${property.title} ${property.code} ${property.city}`.toLowerCase()
      const matchesSearch = !normalizedQuery || searchableText.includes(normalizedQuery)
      const matchesZone = !normalizedZone || normalizeText(property.city).includes(normalizedZone) || normalizeText(property.code).includes(normalizedZone)
      const matchesMinPrice = minPrice === null || property.price >= minPrice
      const matchesMaxPrice = maxPrice === null || property.price <= maxPrice
      const matchesBedrooms = bedroomsFilter === null || property.bedroomsCount >= bedroomsFilter
      const matchesBathrooms = bathroomsFilter === null || property.bathroomsCount >= bathroomsFilter
      const matchesParking = parkingFilter === null || property.parkingCount >= parkingFilter
      const matchesFurnishing =
        furnishingFilter === 'all' ||
        (furnishingFilter === 'furnished' && property.isFurnished) ||
        (furnishingFilter === 'unfurnished' && !property.isFurnished)

      return matchesSearch && matchesZone && matchesMinPrice && matchesMaxPrice && matchesBedrooms && matchesBathrooms && matchesParking && matchesFurnishing
    })

    const rentBandFilteredListings = nextListings.filter(property => {
      if (listingFilter !== 'rent') return true
      if (sortOption === 'rent_under_10') return isRentListing(property) && property.price < 10000
      if (sortOption === 'rent_under_20') return isRentListing(property) && property.price < 20000
      if (sortOption === 'rent_over_20') return isRentListing(property) && property.price >= 20000
      return true
    })

    return [...rentBandFilteredListings].sort((firstProperty, secondProperty) => {
      if (sortOption === 'price_asc' || sortOption === 'rent_under_10' || sortOption === 'rent_under_20') {
        return firstProperty.price - secondProperty.price
      }

      return secondProperty.price - firstProperty.price
    })
  }, [
    bathroomsFilter,
    bedroomsFilter,
    furnishingFilter,
    listings,
    listingFilter,
    maxPriceFilter,
    minPriceFilter,
    parkingFilter,
    searchQuery,
    sortOption,
    zoneFilter,
  ])

  const activeAdvancedFilterCount = useMemo(() => {
    return [
      zoneFilter.trim(),
      minPriceFilter.trim(),
      maxPriceFilter.trim(),
      bedroomsFilter,
      bathroomsFilter,
      parkingFilter,
      furnishingFilter !== 'all' ? furnishingFilter : null,
    ].filter(Boolean).length
  }, [bathroomsFilter, bedroomsFilter, furnishingFilter, maxPriceFilter, minPriceFilter, parkingFilter, zoneFilter])

  const availableSortOptions = useMemo<SortOption[]>(() => {
    const baseOptions: SortOption[] = ['price_desc', 'price_asc']

    return listingFilter === 'rent'
      ? [...baseOptions, 'rent_under_10', 'rent_under_20', 'rent_over_20']
      : baseOptions
  }, [listingFilter])

  useEffect(() => {
    if (!availableSortOptions.includes(sortOption)) {
      setSortOption('price_desc')
    }
  }, [availableSortOptions, sortOption])

  const resetAdvancedFilters = useCallback(() => {
    setZoneFilter('')
    setMinPriceFilter('')
    setMaxPriceFilter('')
    setBedroomsFilter(null)
    setBathroomsFilter(null)
    setParkingFilter(null)
    setFurnishingFilter('all')
  }, [])

  const togglePropertySelection = useCallback((propertyId: string) => {
    setSelectedPropertyIds(currentIds => (
      currentIds.includes(propertyId)
        ? currentIds.filter(id => id !== propertyId)
        : [...currentIds, propertyId]
    ))
  }, [])

  const renderProperty: ListRenderItem<ListingProperty> = useCallback(({ item }) => (
    <PropertyCard
      property={item}
      isSelected={selectedPropertyIds.includes(item.id)}
      isSelecting={isSelectingProperties}
      onToggleSelection={togglePropertySelection}
    />
  ), [isSelectingProperties, selectedPropertyIds, togglePropertySelection])

  const keyExtractor = useCallback((property: ListingProperty) => property.id, [])

  const ListHeader = useMemo(() => (
    <View style={[styles.listCanvas, { width: canvasWidth }]}>
      <View style={styles.headerCanvas}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => {
            if (isMapMode) {
              setIsMapMode(false)
              return
            }

            router.replace(`${routeBase}/properties` as never)
          }}
          activeOpacity={0.85}
        >
          <ChevronLeft size={25} color="#19191f" />
        </TouchableOpacity>

        <Text style={styles.title}>Propiedades Disponibles</Text>
        <Text style={styles.subtitle}>Inventario de renta y venta</Text>

        <View style={styles.controlsBlock}>
          <View style={styles.segmentedControl}>
            <FilterChip label="Todo" active={listingFilter === 'all'} onPress={() => setListingFilter('all')} />
            <FilterChip label="Renta" active={listingFilter === 'rent'} onPress={() => setListingFilter('rent')} />
            <FilterChip label="Venta" active={listingFilter === 'sale'} onPress={() => setListingFilter('sale')} />
          </View>

          <View style={styles.searchRow}>
            <Search size={13} color="#717171" />
            <TextInput
              value={searchQuery}
              onChangeText={setSearchQuery}
              placeholder="Buscar por zona, nombre o ID"
              placeholderTextColor="#717171"
              style={styles.searchInput}
            />
          </View>

          <View style={styles.controlsRow}>
            <TouchableOpacity style={styles.controlButton} activeOpacity={0.85} onPress={() => setIsFiltersVisible(true)}>
              <SlidersHorizontal size={13} color="#0c6740" />
              <Text style={styles.toggleText}>Filtros</Text>
              {activeAdvancedFilterCount > 0 ? (
                <View style={styles.filterBadge}>
                  <Text style={styles.filterBadgeText}>{activeAdvancedFilterCount}</Text>
                </View>
              ) : null}
            </TouchableOpacity>
            <TouchableOpacity style={styles.controlButton} activeOpacity={0.85} onPress={() => setIsSortVisible(true)}>
              <Text style={styles.toggleText}>{getSortLabel(sortOption)}</Text>
              <ChevronDown size={15} color="#0c6740" />
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </View>
  ), [activeAdvancedFilterCount, canvasWidth, isMapMode, listingFilter, routeBase, router, searchQuery, sortOption])

  const openPdfOptions = () => {
    if (isGeneratingPdf) return
    setIsPdfOptionsVisible(true)
  }

  const handleToggleSelectionMode = () => {
    setIsSelectingProperties(isSelecting => !isSelecting)
  }

  const handleGeneratePdf = async () => {
    if (isGeneratingPdf) return

    setIsPdfOptionsVisible(false)
    setIsGeneratingPdf(true)
    setIsPdfCleanupMode(true)
    setSearchQuery('')
    setIsMapMode(false)

    const pdfListingType = listingFilter === 'sale' ? 'sale' : 'rent'
    const isPdfSaleList = listingFilter === 'sale'

    try {
      await waitForHeavyUiToUnmount()
      const pdfPayload = {
        agentName: pdfAgentName,
        sales: isPdfSaleList,
        items: selectedPropertyIds,
        action: selectedPropertyIds.length > 0 ? 'SelectProperties' : pdfListingType,
        location: PDF_REPORT_LOCATION,
        list: pdfListingType,
        design: pdfDesign,
      } as const

      console.log('Payload PDF coordinador:', pdfPayload)

      const report = await createAndOpenTemporaryPropertyListPdf(authToken, pdfPayload)

      console.log('PDF temporal descargado y abierto correctamente:', {
        filename: report.filename,
        byteLength: report.byteLength,
        contentType: report.contentType,
        expiresAt: report.expiresAt,
        url: report.url,
        localUri: report.localUri,
        savedUri: report.savedUri,
        openUri: report.openUri,
        payload: pdfPayload,
      })

      Alert.alert('PDF descargado', 'El PDF se ha descargado.')
      setIsSelectingProperties(false)
      setIsPdfCleanupMode(false)
    } catch (error: any) {
      console.warn('No se pudo generar el PDF de propiedades:', error)
      setIsPdfCleanupMode(false)
      Alert.alert('No se pudo descargar y abrir el PDF', error?.message || 'Revisa la conexion con PDF Reports.')
    } finally {
      setIsGeneratingPdf(false)
    }
  }

  if (isPdfCleanupMode) {
    return <PdfLoadingScreen />
  }

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'bottom']}>
      <FlatList
        data={isMapMode ? [] : filteredListings}
        keyExtractor={keyExtractor}
        renderItem={renderProperty}
        ListHeaderComponent={ListHeader}
        ItemSeparatorComponent={ListSeparator}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.listContent}
        initialNumToRender={4}
        maxToRenderPerBatch={3}
        updateCellsBatchingPeriod={80}
        windowSize={5}
        removeClippedSubviews
      />

      <View style={styles.exportPanel}>
        <TouchableOpacity
          style={styles.exportButtonSecondary}
          activeOpacity={0.85}
          onPress={openPdfOptions}
          disabled={isGeneratingPdf}
        >
          <Text style={styles.exportButtonSecondaryText}>
            {isGeneratingPdf ? 'Generando...' : 'Generar'}{'\n'}Pdf / Cards
          </Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.exportButtonPrimary} activeOpacity={0.85} onPress={handleToggleSelectionMode}>
          <Text style={styles.exportButtonPrimaryText}>
            {isSelectingProperties ? 'Terminar' : 'Seleccionar'}{'\n'}propiedades
          </Text>
        </TouchableOpacity>
        <Text style={styles.exportHint}>
          {selectedPropertyIds.length ? `${selectedPropertyIds.length} seleccionadas` : 'Comparte tu inventario'}{'\n'}con un clic
        </Text>
      </View>

      <Modal
        visible={isPdfOptionsVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setIsPdfOptionsVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.pdfOptionsPanel}>
            <Text style={styles.pdfOptionsTitle}>Opciones del PDF</Text>
            <Text style={styles.pdfOptionsMeta}>
              {selectedPropertyIds.length ? `${selectedPropertyIds.length} propiedades seleccionadas` : 'Sin seleccion: se enviaran todas'}
            </Text>

            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.pdfOptionsScroll}>
              <PdfOptionGroup title="Asesor">
                {PDF_AGENTS.map(agent => (
                  <PdfChip
                    key={agent}
                    label={PDF_AGENT_LABELS[agent]}
                    active={pdfAgentName === agent}
                    onPress={() => setPdfAgentName(agent)}
                  />
                ))}
              </PdfOptionGroup>

              <PdfOptionGroup title="Diseño">
                {PDF_DESIGNS.map(design => (
                  <PdfChip
                    key={design}
                    label={pdfDesignLabels[design] ?? design}
                    active={pdfDesign === design}
                    onPress={() => setPdfDesign(design)}
                  />
                ))}
              </PdfOptionGroup>

              <View style={styles.pdfActionsRow}>
                <TouchableOpacity
                  style={styles.pdfCancelButton}
                  activeOpacity={0.85}
                  onPress={() => setIsPdfOptionsVisible(false)}
                >
                  <Text style={styles.pdfCancelButtonText}>Cancelar</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.pdfGenerateButton}
                  activeOpacity={0.85}
                  onPress={handleGeneratePdf}
                  disabled={isGeneratingPdf}
                >
                  <Text style={styles.pdfGenerateButtonText}>Generar PDF</Text>
                </TouchableOpacity>
              </View>
            </ScrollView>
          </View>
        </View>
      </Modal>

      <Modal
        visible={isFiltersVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setIsFiltersVisible(false)}
      >
        <Pressable style={styles.modalOverlay} onPress={() => setIsFiltersVisible(false)}>
          <Pressable style={styles.filterOptionsPanel} onPress={event => event.stopPropagation()}>
            <View style={styles.filterModalHeader}>
              <View>
                <Text style={styles.pdfOptionsTitle}>Filtros</Text>
                <Text style={styles.pdfOptionsMeta}>
                  {activeAdvancedFilterCount ? `${activeAdvancedFilterCount} filtros activos` : 'Sin filtros avanzados'}
                </Text>
              </View>
              <View style={styles.filterHeaderActions}>
                <TouchableOpacity style={styles.clearFiltersButton} activeOpacity={0.85} onPress={resetAdvancedFilters}>
                  <Text style={styles.clearFiltersButtonText}>Limpiar</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.closeFiltersButton} activeOpacity={0.85} onPress={() => setIsFiltersVisible(false)}>
                  <Text style={styles.closeFiltersButtonText}>Cerrar</Text>
                </TouchableOpacity>
              </View>
            </View>

            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.pdfOptionsScroll}>
              <Text style={styles.pdfFieldLabel}>Zona</Text>
              <TextInput
                value={zoneFilter}
                onChangeText={setZoneFilter}
                placeholder="Ej. Temozon, Centro, Altabrisa"
                placeholderTextColor="#717171"
                style={styles.filterTextInput}
              />

              <View style={styles.filterPriceRow}>
                <View style={styles.filterPriceField}>
                  <Text style={styles.pdfFieldLabel}>Precio minimo</Text>
                  <TextInput
                    value={minPriceFilter}
                    onChangeText={setMinPriceFilter}
                    placeholder="0"
                    placeholderTextColor="#717171"
                    keyboardType="numeric"
                    style={styles.filterTextInput}
                  />
                </View>
                <View style={styles.filterPriceField}>
                  <Text style={styles.pdfFieldLabel}>Precio maximo</Text>
                  <TextInput
                    value={maxPriceFilter}
                    onChangeText={setMaxPriceFilter}
                    placeholder="Sin limite"
                    placeholderTextColor="#717171"
                    keyboardType="numeric"
                    style={styles.filterTextInput}
                  />
                </View>
              </View>

              <FilterOptionGroup title="Recamaras">
                <FilterValueChip label="Todas" active={bedroomsFilter === null} onPress={() => setBedroomsFilter(null)} />
                {[1, 2, 3, 4].map(value => (
                  <FilterValueChip key={value} label={`${value}+`} active={bedroomsFilter === value} onPress={() => setBedroomsFilter(value)} />
                ))}
              </FilterOptionGroup>

              <FilterOptionGroup title="Banos">
                <FilterValueChip label="Todos" active={bathroomsFilter === null} onPress={() => setBathroomsFilter(null)} />
                {[1, 2, 3, 4].map(value => (
                  <FilterValueChip key={value} label={`${value}+`} active={bathroomsFilter === value} onPress={() => setBathroomsFilter(value)} />
                ))}
              </FilterOptionGroup>

              <FilterOptionGroup title="Estacionamientos">
                <FilterValueChip label="Todos" active={parkingFilter === null} onPress={() => setParkingFilter(null)} />
                {[1, 2, 3, 4].map(value => (
                  <FilterValueChip key={value} label={`${value}+`} active={parkingFilter === value} onPress={() => setParkingFilter(value)} />
                ))}
              </FilterOptionGroup>

              <FilterOptionGroup title="Mobiliario">
                <FilterValueChip label="Todos" active={furnishingFilter === 'all'} onPress={() => setFurnishingFilter('all')} />
                <FilterValueChip label="Amueblados" active={furnishingFilter === 'furnished'} onPress={() => setFurnishingFilter('furnished')} />
                <FilterValueChip label="Sin amueblar" active={furnishingFilter === 'unfurnished'} onPress={() => setFurnishingFilter('unfurnished')} />
              </FilterOptionGroup>

              <TouchableOpacity style={styles.applyFiltersButton} activeOpacity={0.85} onPress={() => setIsFiltersVisible(false)}>
                <Text style={styles.applyFiltersButtonText}>Aplicar filtros</Text>
              </TouchableOpacity>
            </ScrollView>
          </Pressable>
        </Pressable>
      </Modal>

      <Modal
        visible={isSortVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setIsSortVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.sortOptionsPanel}>
            <Text style={styles.pdfOptionsTitle}>Ordenar</Text>
            <Text style={styles.pdfOptionsMeta}>
              {listingFilter === 'rent' ? 'Incluye rangos especiales para rentas' : 'Orden disponible para esta vista'}
            </Text>

            <View style={styles.sortOptionsList}>
              {availableSortOptions.map(option => (
                <TouchableOpacity
                  key={option}
                  style={[styles.sortOptionButton, sortOption === option && styles.sortOptionButtonActive]}
                  activeOpacity={0.85}
                  onPress={() => {
                    setSortOption(option)
                    setIsSortVisible(false)
                  }}
                >
                  <Text style={[styles.sortOptionText, sortOption === option && styles.sortOptionTextActive]}>
                    {getSortLabel(option)}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        </View>
      </Modal>

      {isMapMode ? null : (
        <TouchableOpacity style={styles.mapFloatingButton} onPress={() => setIsMapMode(true)} activeOpacity={0.85}>
          <Text style={styles.mapFloatingButtonText}>Mapa</Text>
          <MapIcon size={16} color="#ffffff" fill="#ffffff" />
        </TouchableOpacity>
      )}

    </SafeAreaView>
  )
}

const PropertyCard = memo(function PropertyCard({
  property,
  isSelected,
  isSelecting,
  onToggleSelection,
}: {
  property: ListingProperty
  isSelected: boolean
  isSelecting: boolean
  onToggleSelection: (propertyId: string) => void
}) {
  const primaryTags = property.tags.slice(0, 4)
  const detailTags = property.tags.slice(4, 6)

  return (
    <TouchableOpacity
      style={[styles.propertyCard, isSelected && styles.propertyCardSelected]}
      activeOpacity={isSelecting ? 0.82 : 1}
      onPress={isSelecting ? () => onToggleSelection(property.id) : undefined}
    >
      <View style={styles.imageWrap}>
        {property.image ? (
          <Image source={{ uri: property.image }} style={styles.propertyImage} resizeMode="cover" />
        ) : (
          <View style={styles.imagePlaceholder}>
            <Home size={50} color="#d2bd7f" />
          </View>
        )}
        <View style={styles.locationPill}>
          <MapPin size={10} color="#0c6740" />
          <Text style={styles.locationPillText} numberOfLines={1}>{property.city}</Text>
        </View>
        <View style={styles.availablePill}>
          <Text style={styles.availablePillText}>Disponible</Text>
        </View>
        {isSelecting ? (
          <View style={[styles.selectionPill, isSelected && styles.selectionPillActive]}>
            <Text style={[styles.selectionPillText, isSelected && styles.selectionPillTextActive]}>
              {isSelected ? 'Seleccionada' : 'Seleccionar'}
            </Text>
          </View>
        ) : null}
      </View>

      <View style={styles.propertyInfo}>
        <Text style={styles.propertyTitle} numberOfLines={1}>{property.title}</Text>
        <Text style={styles.propertyCode} numberOfLines={1}>{property.code}</Text>

        <View style={styles.priceRow}>
          <Text style={styles.price}>{formatCurrency(property.price)}</Text>
          {property.status === 'for_rent' || property.status === 'pending_rent' ? (
            <Text style={styles.priceMeta}>MXN / mes </Text>
          ) : null}
        </View>

        <View style={styles.featuresRow}>
          <Feature icon={<BedDouble size={13} color="#0c6740" />} value={property.bedrooms} label="Recamaras" />
          <View style={styles.featureDivider} />
          <Feature icon={<Bath size={13} color="#0c6740" />} value={property.bathrooms} label="Baños" />
          <View style={styles.featureDivider} />
          <Feature icon={<Car size={14} color="#0c6740" />} value={property.parking} label="Estac." />
        </View>

        <View style={styles.amenitiesRow}>
          {primaryTags.map(tag => (
            <Amenity key={tag} label={tag} />
          ))}
        </View>

        <View style={styles.detailTagsRow}>
          {detailTags.map(tag => (
            <DetailTag key={tag} label={tag} />
          ))}
        </View>

        <View style={styles.cardFooter}>
          <Text style={styles.detailLink}>Ver detalles </Text>
          <TouchableOpacity style={styles.favoriteButton} activeOpacity={0.85}>
            <Star size={13} color="#0c6740" fill="#0c6740" />
          </TouchableOpacity>
        </View>
      </View>
    </TouchableOpacity>
  )
})

function ListSeparator() {
  return <View style={styles.listSeparator} />
}

function FilterChip({ label, active, onPress }: { label: string; active: boolean; onPress: () => void }) {
  return (
    <TouchableOpacity
      style={[styles.filterChip, active && styles.filterChipActive]}
      activeOpacity={0.85}
      onPress={onPress}
    >
      <Text style={[styles.filterChipText, active && styles.filterChipTextActive]}>{label}</Text>
    </TouchableOpacity>
  )
}

function PdfLoadingScreen() {
  useHideBottomNav()

  useEffect(() => {
    const subscription = BackHandler.addEventListener('hardwareBackPress', () => true)

    return () => {
      subscription.remove()
    }
  }, [])

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'bottom']}>
      <View style={styles.pdfWorkState}>
        <ActivityIndicator size="large" color="#0c6740" />
        <Text style={styles.pdfWorkTitle}>Cargando PDF</Text>
        <Text style={styles.pdfWorkText}>Preparando el archivo para descargar...</Text>
      </View>
    </SafeAreaView>
  )
}

function PdfOptionGroup({ title, children }: { title: string; children: ReactNode }) {
  return (
    <View style={styles.pdfOptionGroup}>
      <Text style={styles.pdfFieldLabel}>{title}</Text>
      <View style={styles.pdfChipWrap}>{children}</View>
    </View>
  )
}

function PdfChip({ label, active, onPress }: { label: string; active: boolean; onPress: () => void }) {
  return (
    <TouchableOpacity
      style={[styles.pdfChip, active && styles.pdfChipActive]}
      activeOpacity={0.85}
      onPress={onPress}
    >
      <Text style={[styles.pdfChipText, active && styles.pdfChipTextActive]}>{label}</Text>
    </TouchableOpacity>
  )
}

function FilterOptionGroup({ title, children }: { title: string; children: ReactNode }) {
  return (
    <View style={styles.filterOptionGroup}>
      <Text style={styles.pdfFieldLabel}>{title}</Text>
      <View style={styles.filterChipWrap}>{children}</View>
    </View>
  )
}

function FilterValueChip({ label, active, onPress }: { label: string; active: boolean; onPress: () => void }) {
  return (
    <TouchableOpacity
      style={[styles.filterValueChip, active && styles.filterValueChipActive]}
      activeOpacity={0.85}
      onPress={onPress}
    >
      <Text style={[styles.filterValueChipText, active && styles.filterValueChipTextActive]}>{label}</Text>
    </TouchableOpacity>
  )
}

function Feature({ icon, value, label }: { icon: ReactNode; value: string; label: string }) {
  return (
    <View style={styles.feature}>
      <View style={styles.featureValueRow}>
        {icon}
        <Text style={styles.featureValue} numberOfLines={1} adjustsFontSizeToFit minimumFontScale={0.72}>
          {value}
        </Text>
      </View>
      <Text style={styles.featureLabel}>{label}</Text>
    </View>
  )
}

function Amenity({ label }: { label: string }) {
  const Icon = getAmenityIcon(label)

  return (
    <View style={styles.amenity}>
      <Icon size={13} color="#0c6740" />
      <Text style={styles.amenityText} numberOfLines={2}>{splitAmenityLabel(label)}</Text>
    </View>
  )
}

function DetailTag({ label }: { label: string }) {
  const Icon = getAmenityIcon(label)
  const isWarm = /amuebl/i.test(label)

  return (
    <View style={[styles.detailTag, isWarm ? styles.detailTagWarm : styles.detailTagBlue]}>
      <Icon size={13} color={isWarm ? '#bd7600' : '#0c6740'} />
      <Text style={[styles.detailTagText, isWarm && styles.detailTagTextWarm]} numberOfLines={1}>
        {label}
      </Text>
    </View>
  )
}

function splitAmenityLabel(label: string) {
  if (/seguridad/i.test(label)) return 'Seguridad\n24/7'
  if (/areas|verdes/i.test(label)) return 'Areas\nverdes'
  if (/pet/i.test(label)) return 'Pet\nfriendly'
  return label
}

function getAmenityIcon(label: string) {
  const normalizedLabel = label.toLowerCase()
  if (normalizedLabel.includes('alberca') || normalizedLabel.includes('pool') || normalizedLabel.includes('vista')) return Waves
  if (normalizedLabel.includes('verde') || normalizedLabel.includes('jardin')) return TreePine
  if (normalizedLabel.includes('pet')) return PawPrint
  if (normalizedLabel.includes('amuebl')) return Armchair
  return ShieldCheck
}
