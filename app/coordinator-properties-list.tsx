import { useEffect, useMemo, useState, type ReactNode } from 'react'
import { Image, ScrollView, Text, TextInput, TouchableOpacity, useWindowDimensions, View } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useRouter } from 'expo-router'
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
import { usePropertyDomain } from '@/contexts/auth/use-property-domain'
import type { Property } from '@/lib/types'
import { formatCurrency } from '@/lib/utils'
import { CoordinatorBottomNav } from '@/components/coordinator/CoordinatorBottomNav'
import { styles } from './coordinator-properties-list.styles'

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

export default function CoordinatorPropertiesListScreen() {
  const router = useRouter()
  const { width } = useWindowDimensions()
  const canvasWidth = Math.min(width, 440)
  const {
    availableProperties,
    catalogProperties,
    hasLoadedCatalog,
    isCatalogLoading,
    loadCatalogProperties,
  } = usePropertyDomain()
  const [searchQuery, setSearchQuery] = useState('')
  const [isMapMode, setIsMapMode] = useState(false)

  useEffect(() => {
    if (!hasLoadedCatalog && !isCatalogLoading) {
      loadCatalogProperties()
    }
  }, [hasLoadedCatalog, isCatalogLoading, loadCatalogProperties])

  const listings = useMemo(() => {
    const source = (catalogProperties.length > 0 ? catalogProperties : availableProperties)
      .filter(property => property.status === 'for_rent' || property.status === 'pending_rent' || property.monthlyRent || property.status === 'for_sale')
      .map(mapPropertyToListing)

    return source
  }, [availableProperties, catalogProperties])

  const filteredListings = useMemo(() => {
    const normalizedQuery = searchQuery.trim().toLowerCase()
    if (!normalizedQuery) return listings

    return listings.filter(property =>
      `${property.title} ${property.code} ${property.city}`.toLowerCase().includes(normalizedQuery),
    )
  }, [listings, searchQuery])

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'bottom']}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        <View style={[styles.canvas, { width: canvasWidth }]}>
          <View style={styles.headerCanvas}>
            <TouchableOpacity
              style={styles.backButton}
              onPress={() => {
                if (isMapMode) {
                  setIsMapMode(false)
                  return
                }

                router.back()
              }}
              activeOpacity={0.85}
            >
              <ChevronLeft size={25} color="#19191f" />
            </TouchableOpacity>

            <Text style={styles.title}>Propiedades Disponibles</Text>
            <Text style={styles.subtitle}>Inventario de renta </Text>

            <View style={styles.controlsBlock}>
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

          {isMapMode ? null : (
            <View style={styles.list}>
              {filteredListings.map(property => (
                <PropertyCard key={property.id} property={property} />
              ))}
            </View>
          )}
        </View>
      </ScrollView>

      <View style={styles.exportPanel}>
        <TouchableOpacity style={styles.exportButtonSecondary} activeOpacity={0.85}>
          <Text style={styles.exportButtonSecondaryText}>Generar{'\n'}Pdf / Cards</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.exportButtonPrimary} activeOpacity={0.85}>
          <Text style={styles.exportButtonPrimaryText}>Seleccionar{'\n'}propiedades</Text>
        </TouchableOpacity>
        <Text style={styles.exportHint}>Comparte tu inventario{'\n'}con un clic</Text>
      </View>

      {isMapMode ? null : (
        <TouchableOpacity style={styles.mapFloatingButton} onPress={() => setIsMapMode(true)} activeOpacity={0.85}>
          <Text style={styles.mapFloatingButtonText}>Mapa</Text>
          <MapIcon size={16} color="#ffffff" fill="#ffffff" />
        </TouchableOpacity>
      )}

      <CoordinatorBottomNav />
    </SafeAreaView>
  )
}

function PropertyCard({ property }: { property: ListingProperty }) {
  const primaryTags = property.tags.slice(0, 4)
  const detailTags = property.tags.slice(4, 6)

  return (
    <View style={styles.propertyCard}>
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
    </View>
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
