import { useCallback, useEffect, useMemo, useState } from 'react'
import { Alert, InteractionManager, useWindowDimensions } from 'react-native'
import { useLocalSearchParams } from 'expo-router'
import { createAndOpenTemporaryPropertyListPdf, type PdfReportAgentName } from '@/lib/api'
import type { ListingProperty, Property } from '@/lib/types'
import { useAuth } from '@/contexts/AuthContext'
import { usePropertyDomain } from '@/contexts/auth/use-property-domain'
import { useOperationMode } from '@/modules/settings'

export type ListingFilter = 'all' | 'rent' | 'sale' | 'developments'
export type FurnishingFilter = 'all' | 'furnished' | 'unfurnished'
export type SortOption = 'price_desc' | 'price_asc' | 'rent_under_10' | 'rent_under_20' | 'rent_over_20'
export const PDF_AGENTS: PdfReportAgentName[] = [
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
  'DanielaVillanueva'
]

export const PDF_AGENT_LABELS: Record<PdfReportAgentName, string> = {
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

const normalizeText = (value: string) => value.trim().toLowerCase()
const parsePrice = (value: string) => { const price = Number(value.replace(/[^\d.]/g, '')); return Number.isFinite(price) && price > 0 ? price : null }
const isDisplayValue = (value?: string | null) => Boolean(value?.trim()) && !/^(sin dato|sin datos|sin tipo|sin vista|sin link|sin carpeta|sin descripcion|n\/a|na|null|undefined)$/i.test(value!.trim())
const isRentListing = (property: ListingProperty) => property.status === 'for_rent' || property.status === 'pending_rent'

function mapProperty(property: Property): ListingProperty {
  const amenities = property.amenities?.length ? property.amenities : property.features ?? []
  const parkingMatch = amenities.find(value => /estac|parking|auto/i.test(value))?.match(/\d+/)
  const parking = property.parking ?? Number(parkingMatch?.[0] ?? 2)
  return {
    id: property.id || property._id || property.title, title: property.title || 'Propiedad disponible',
    code: property.address || property.city || 'Inventario de renta', city: property.city || 'Zona sin asignar',
    price: property.monthlyRent ?? property.price ?? 0, priceLabel: property.priceLabel,
    listingType: property.listingType, view: property.view, description: property.description,
    solarPanelLabel: property.solarPanelLabel, propertyType: property.type,
    googleDriveImages: property.googleDriveImages, locationUrl: property.locationUrl,
    bedrooms: String(property.bedrooms ?? 0), bedroomsCount: property.bedrooms ?? 0,
    bathrooms: String(property.bathrooms ?? 0), bathroomsCount: property.bathrooms ?? 0,
    parking: String(parking), parkingCount: parking,
    isFurnished: property.isFurnished ?? amenities.some(value => /amuebl/i.test(value)),
    furnishedLabel: property.furnishedLabel, isLand: property.type === 'land', image: property.images?.[0],
    tags: amenities.filter(isDisplayValue).slice(0, 6), status: property.status,
  }
}

export function getSortLabel(option: SortOption) {
  if (option === 'price_asc') return 'Menor a mayor'
  if (option === 'rent_under_10') return 'Rentas menores de 10'
  if (option === 'rent_under_20') return 'Rentas menores de 20'
  if (option === 'rent_over_20') return 'Rentas mayores de 20'
  return 'Ordernar'
}

export function usePropertiesScreen() {
  const params = useLocalSearchParams<{ type?: string }>()
  const { authToken, currentUser, isLoading: isAuthLoading } = useAuth()
  const { operationMode } = useOperationMode()
  const { width } = useWindowDimensions()
  const domain = usePropertyDomain()
  const initialFilter: ListingFilter = params.type === 'sale' || params.type === 'rent' ? params.type : operationMode === 'both' ? 'rent' : operationMode
  const [searchQuery, setSearchQuery] = useState('')
  const [isMapMode, setIsMapMode] = useState(false)
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false)
  const [isPdfCleanupMode, setIsPdfCleanupMode] = useState(false)
  const [isSelectingProperties, setIsSelectingProperties] = useState(false)
  const [selectedPropertyIds, setSelectedPropertyIds] = useState<string[]>([])
  const [isPdfOptionsVisible, setIsPdfOptionsVisible] = useState(false)
  const [pdfAgentName, setPdfAgentName] = useState<PdfReportAgentName>('AlexaDiaz')
  const [listingFilter, setListingFilter] = useState<ListingFilter>(initialFilter)
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

  useEffect(() => setListingFilter(
    params.type === 'sale' || params.type === 'rent' 
    ? params.type : operationMode === 'both' 
    ? 'rent' : operationMode
  ), [operationMode, params.type])

  useEffect(() => {
    if (!isAuthLoading && authToken && !domain.hasLoadedCatalog && !domain.isCatalogLoading) domain.newLoadCatalogProperties()
  }, [
      authToken, 
      domain.hasLoadedCatalog, 
      domain.isCatalogLoading, 
      domain.newLoadCatalogProperties, 
      isAuthLoading
    ])

  const listings = useMemo(() => (domain.catalogProperties.length ? domain.catalogProperties : domain.availableProperties)
    .filter(property => {
      if (!property.title?.trim()) return false
      const sale = property.status === 'for_sale' || property.status === 'pending_sale'
      const rent = property.status === 'for_rent' || property.status === 'pending_rent' || Boolean(property.monthlyRent)
      return listingFilter === 'sale' ? sale : listingFilter === 'rent' ? rent : sale || rent
    }).map(mapProperty), [domain.availableProperties, domain.catalogProperties, listingFilter])

  const filteredListings = useMemo(() => {
    const query = normalizeText(searchQuery), zone = normalizeText(zoneFilter)
    const min = parsePrice(minPriceFilter), max = parsePrice(maxPriceFilter)
    
    const result = listings.filter(property => {
      const searchable = `${property.title} ${property.code} ${property.city}`.toLowerCase()
      return (!query || searchable.includes(query)) && (!zone || normalizeText(property.city).includes(zone) || normalizeText(property.code).includes(zone))
        && (min === null || property.price >= min) && (max === null || property.price <= max)
        && (bedroomsFilter === null || property.bedroomsCount >= bedroomsFilter)
        && (bathroomsFilter === null || property.bathroomsCount >= bathroomsFilter)
        && (parkingFilter === null || property.parkingCount >= parkingFilter)
        && (furnishingFilter === 'all' || property.isFurnished === (furnishingFilter === 'furnished'))
    }).filter(property => {
      if (listingFilter !== 'rent') return true
      if (sortOption === 'rent_under_10') return isRentListing(property) && property.price < 10000
      if (sortOption === 'rent_under_20') return isRentListing(property) && property.price < 20000
      if (sortOption === 'rent_over_20') return isRentListing(property) && property.price >= 20000
      return true
    })
    return [...result].sort((a, b) => ['price_asc', 'rent_under_10', 'rent_under_20'].includes(sortOption) ? a.price - b.price : b.price - a.price)
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
    zoneFilter
  ])

  const activeAdvancedFilterCount = useMemo(() => [
      zoneFilter.trim(), 
      minPriceFilter.trim(), 
      maxPriceFilter.trim(), 
      bedroomsFilter, 
      bathroomsFilter, 
      parkingFilter, 
      furnishingFilter !== 'all' 
        ? furnishingFilter 
        : null].filter(Boolean).length, 
      [
        bathroomsFilter, 
        bedroomsFilter, 
        furnishingFilter, 
        maxPriceFilter, 
        minPriceFilter, 
        parkingFilter, 
        zoneFilter
      ])

  const availableSortOptions = useMemo<SortOption[]>(() => listingFilter === 'rent' ? [
    'price_desc', 
    'price_asc', 
    'rent_under_10', 
    'rent_under_20', 
    'rent_over_20'
  ] : ['price_desc', 'price_asc'], [listingFilter])

  useEffect(() => { if (!availableSortOptions.includes(sortOption)) setSortOption('price_desc') }, [availableSortOptions, sortOption])

  const resetAdvancedFilters = useCallback(() => { 
    setZoneFilter(''); 
    setMinPriceFilter(''); 
    setMaxPriceFilter(''); 
    setBedroomsFilter(null); 
    setBathroomsFilter(null); 
    setParkingFilter(null); 
    setFurnishingFilter('all') 
  }, [])
  
  const togglePropertySelection = useCallback((id: string) => setSelectedPropertyIds(ids => ids.includes(id) ? ids.filter(value => value !== id) : [...ids, id]), [])
  const keyExtractor = useCallback((property: ListingProperty) => property.id, [])
  const openPdfOptions = useCallback(() => { if (!isGeneratingPdf) setIsPdfOptionsVisible(true) }, [isGeneratingPdf])
  const handleToggleSelectionMode = useCallback(() => setIsSelectingProperties(value => !value), [])
  
  const handleGeneratePdf = useCallback(async () => {
    if (isGeneratingPdf) return
    setIsPdfOptionsVisible(false); 
    setIsGeneratingPdf(true); 
    setIsPdfCleanupMode(true); 
    setSearchQuery(''); 
    setIsMapMode(false)
    
    const list = listingFilter === 'sale' ? 'sale' : 'rent'
    
    try {
      await new Promise<void>(resolve => InteractionManager.runAfterInteractions(() => setTimeout(resolve, 120)))
      const payload = { ...(currentUser?.agentPresentationKey 
        ? { agentName: 'a' as const, agentPresentation: currentUser.agentPresentationKey } 
        : { agentName: pdfAgentName }), sales: listingFilter === 'sale', items: selectedPropertyIds, action: selectedPropertyIds.length ? 'SelectProperties' 
        : list, location: 'TODAS', list, design: 'modern' } as const

      await createAndOpenTemporaryPropertyListPdf(authToken, payload)
      Alert.alert('PDF descargado', 'El PDF se ha descargado.'); setIsSelectingProperties(false); setIsPdfCleanupMode(false)
    } catch (error: any) { setIsPdfCleanupMode(false); Alert.alert('No se pudo descargar y abrir el PDF', error?.message || 'Revisa la conexion con PDF Reports.') }
    finally { setIsGeneratingPdf(false) }
  }, [authToken, currentUser?.agentPresentationKey, isGeneratingPdf, listingFilter, pdfAgentName, selectedPropertyIds])

  return { 
    operationMode, 
    canvasWidth: Math.min(width, 440), 
    filteredListings, 
    keyExtractor,
    shouldSkipPdfAgentList: Boolean(currentUser?.agentPresentationKey),
    searchQuery, 
    setSearchQuery, 
    isMapMode, 
    setIsMapMode, 
    isGeneratingPdf, 
    isPdfCleanupMode, 
    isSelectingProperties,
    selectedPropertyIds, 
    isPdfOptionsVisible, 
    setIsPdfOptionsVisible, 
    pdfAgentName, 
    setPdfAgentName, 
    listingFilter, 
    setListingFilter,
    isFiltersVisible, 
    setIsFiltersVisible, 
    isSortVisible, 
    setIsSortVisible, 
    zoneFilter, 
    setZoneFilter,
    minPriceFilter, 
    setMinPriceFilter, 
    maxPriceFilter, 
    setMaxPriceFilter, 
    bedroomsFilter, 
    setBedroomsFilter,
    bathroomsFilter, 
    setBathroomsFilter, 
    parkingFilter, 
    setParkingFilter, 
    furnishingFilter, 
    setFurnishingFilter,
    sortOption, 
    setSortOption, 
    activeAdvancedFilterCount, 
    availableSortOptions, 
    resetAdvancedFilters,
    togglePropertySelection, 
    openPdfOptions, 
    handleToggleSelectionMode, 
    handleGeneratePdf }
}
