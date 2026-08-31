import {
    View,
    Text,
    Pressable,
    Image,
    StyleSheet
} from 'react-native'
import { icons } from '@/assets'
import { styles } from './styles/PropertyLsitCard.styles'
import { memo } from 'react'
import { ReactNode } from 'react'
import { Armchair,
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
  TreePine,
  Waves, 
} from 'lucide-react-native'
import { ListingProperty } from '@/lib/types'
export const PropertyCard = memo(function PropertyCard({
  property,
  isSelected,
  isSelecting,
  onToggleSelection,
  onPress,
}: {
  property: ListingProperty
  isSelected: boolean
  isSelecting: boolean
  onToggleSelection: (propertyId: string) => void
  onPress?: () => void
}) {
  const primaryTags = property.tags.slice(0, 4)
  const detailTags = property.tags.slice(4, 6)
  const shouldShowPropertyDetails = !property.isLand

  return (
    <Pressable
      style={[styles.propertyCard, isSelected && styles.propertyCardSelected]}
      onPress={isSelecting ? () => onToggleSelection(property.id) : onPress}
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
          <icons.Place />
          <Text style={styles.locationPillText} numberOfLines={1}>{property.city}</Text>
        </View>
        <View style={styles.availablePill}>
          <Text style={styles.availablePillText}>Disponible</Text>
        </View>
        {property.solarPanelLabel ? (
          <View style={styles.SolarPanelPill}>
            <Text style={styles.locationPillText}>Paneles Solares</Text>
          </View>
        ): <View></View>}
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
          <Text style={styles.price}>{property.priceLabel || property.price}</Text>
          {property.status === 'for_rent' || property.status === 'pending_rent' ? (
            <Text style={styles.priceMeta}></Text>
          ) : null}
        </View>
        {shouldShowPropertyDetails ? (
          <>
        <View style={styles.featuresRow}>
          <Feature icon={<icons.Bed />} value={property.bedrooms} label="Recamaras" />
          <View style={styles.featureDivider} />
          <Feature icon={<icons.Bathroom />} value={property.bathrooms} label="Baños" />
          <View style={styles.featureDivider} />
          <Feature icon={<icons.Car/>} value={property.parking} label="Estac." />
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
          </>
        ) : null}
        <View style={[styles.amenitiesSpace, property.isLand && styles.landPropertyCar]}>
          <View style={styles.viewBlock}>
            <icons.Fluid/>
            {property.view ? (
              <Text style={styles.viewText}>
                {property.view}
              </Text>
            ) : null}
          </View>
          {property.furnishedLabel ?(
            <View style={styles.furnishedBlock}>
              <icons.Fluid/>
              {property.furnishedLabel ? (
                <Text 
                  style={styles.viewText}
                  numberOfLines={1}
                >
                  {property.furnishedLabel}
                </Text>
            ) : null}
            </View>
          ): null}
        </View>
        <View style={styles.cardFooter}>
          <Text style={styles.detailLink}>Ver detalles </Text>
        </View>
      </View>
    </Pressable>
  )
})


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
      <Text 
        adjustsFontSizeToFit
        style={styles.amenityText} numberOfLines={2}>{splitAmenityLabel(label)}</Text>
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
