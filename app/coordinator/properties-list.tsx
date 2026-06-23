import { memo, useCallback, useEffect, useMemo, useState, type ReactNode } from 'react'
import { Alert, FlatList, Image, InteractionManager, Modal, ScrollView, Text, TextInput, TouchableOpacity, useWindowDimensions, View, type ListRenderItem } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useLocalSearchParams, useRouter } from 'expo-router'
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
  bathrooms: string
  parking: string
  image?: string
  tags: string[]
  status: Property['status']
}

type ListingFilter = 'all' | 'rent' | 'sale'

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

const PDF_DESIGNS: PdfReportDesign[] = ['modern', 'original', 'whiteBoard', 'sale', 'rent', 'BahiaProjects', 'contract']
const pdfDesignLabels: Record<string, string> = {
  modern: 'Modern',
  original: 'Original',
  whiteBoard: 'White Board',
  sale: 'Sale',
  rent: 'Rent',
  BahiaProjects: 'Bahia',
  contract: 'Contract',
}

function mapPropertyToListing(property: Property): ListingProperty {
  const amenities = property.amenities?.length ? property.amenities : property.features ?? []

  return {
    id: property.id || property._id || property.title,
    title: property.title || 'Propiedad disponible',
    code: property.address || property.city || 'Inventario de renta',
    city: property.city || 'Zona sin asignar',
    price: property.monthlyRent ?? property.price ?? 0,
    bedrooms: String(property.bedrooms ?? 0),
    bathrooms: String(property.bathrooms ?? 0),
    parking: getParkingValue(amenities),
    image: property.images?.[0],
    tags: normalizeTags(amenities),
    status: property.status,
  }
}

function getParkingValue(amenities: string[]) {
  const parkingAmenity = amenities.find(amenity => /estac|parking|auto/i.test(amenity))
  const match = parkingAmenity?.match(/\d+/)

  return match?.[0] ?? '2'
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

export default function CoordinatorPropertiesListScreen() {
  const router = useRouter()
  const params = useLocalSearchParams<{ type?: string }>()
  const { authToken } = useAuth()
  const { width } = useWindowDimensions()
  const canvasWidth = Math.min(width, 440)
  const initialListingFilter: ListingFilter = params.type === 'sale' ? 'sale' : params.type === 'rent' ? 'rent' : 'all'
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
  const [pdfLocation, setPdfLocation] = useState('TODAS')
  const [listingFilter, setListingFilter] = useState<ListingFilter>(initialListingFilter)

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
    if (!normalizedQuery) return listings

    return listings.filter(property =>
      `${property.title} ${property.code} ${property.city}`.toLowerCase().includes(normalizedQuery),
    )
  }, [listings, searchQuery])

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

            router.replace('/coordinator/properties' as never)
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
            <TouchableOpacity style={styles.controlButton} activeOpacity={0.85}>
              <SlidersHorizontal size={13} color="#0c6740" />
              <Text style={styles.toggleText}>Filtros</Text>
              <View style={styles.filterBadge}>
                <Text style={styles.filterBadgeText}>2</Text>
              </View>
            </TouchableOpacity>
            <TouchableOpacity style={styles.controlButton} activeOpacity={0.85}>
              <Text style={styles.toggleText}>Ordenar </Text>
              <ChevronDown size={15} color="#0c6740" />
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </View>
  ), [canvasWidth, isMapMode, listingFilter, router, searchQuery])

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
      const normalizedLocation = pdfLocation.trim().toUpperCase() || 'TODAS'
      const pdfPayload = {
        agentName: pdfAgentName,
        sales: isPdfSaleList,
        items: selectedPropertyIds,
        action: selectedPropertyIds.length > 0 ? 'SelectProperties' : pdfListingType,
        location: normalizedLocation,
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
    return (
      <SafeAreaView style={styles.safeArea} edges={['top', 'bottom']}>
        <View style={styles.pdfWorkState}>
          <Text style={styles.pdfWorkTitle}>Preparando PDF</Text>
          <Text style={styles.pdfWorkText}>Liberando el listado antes de descargar...</Text>
        </View>
      </SafeAreaView>
    )
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
                    label={agent}
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

              <Text style={styles.pdfFieldLabel}>Ubicacion</Text>
              <TextInput
                value={pdfLocation}
                onChangeText={setPdfLocation}
                placeholder="TODAS"
                placeholderTextColor="#717171"
                autoCapitalize="characters"
                style={styles.pdfLocationInput}
              />

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
