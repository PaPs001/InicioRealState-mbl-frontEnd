import { Linking, Text, TouchableOpacity, View } from 'react-native'

import { Check, ExternalLink, Bath, Bed, ImageIcon, Map, MapPin, Maximize, Building2, Home } from 'lucide-react-native'

import type { AppTheme } from '@/lib/theme'
import type { Property } from '@/lib/types/property'
import { formatCurrency } from '@/lib/utils'

import { styles } from './styles'

type PropertyInfoTabProps = {
  isForRent: boolean
  property: Property
  theme: AppTheme
}

export function PropertyInfoTab({ isForRent, property, theme }: PropertyInfoTabProps) {
  const openLink = (url?: string) => {
    if (url) {
      Linking.openURL(url)
    }
  }

  const Icon = property.type === 'apartment' ? Building2 : property.type === 'land' ? Map : Home

  return (
    <View style={styles.tabContent}>
      {property.description && (
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: theme.text }]}>Descripción</Text>
          <Text style={[styles.description, { color: theme.textSecondary }]}>{property.description}</Text>
        </View>
      )}

      {property.type !== 'land' && (
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: theme.text }]}>Caracteristicas</Text>
          <View style={[styles.featuresCard, { backgroundColor: theme.surface, borderColor: theme.border }]}>
            <View style={styles.featureItem}>
              <Bed size={24} color={theme.accent} />
              <Text style={[styles.featureValue, { color: theme.text }]}>{property.bedrooms}</Text>
              <Text style={[styles.featureLabel, { color: theme.textMuted }]}>Recámaras</Text>
            </View>
            <View style={[styles.featureDivider, { backgroundColor: theme.border }]} />
            <View style={styles.featureItem}>
              <Bath size={24} color={theme.accent} />
              <Text style={[styles.featureValue, { color: theme.text }]}>{property.bathrooms}</Text>
              <Text style={[styles.featureLabel, { color: theme.textMuted }]}>Baños</Text>
            </View>
            <View style={[styles.featureDivider, { backgroundColor: theme.border }]} />
            <View style={styles.featureItem}>
              <Maximize size={24} color={theme.accent} />
              <Text style={[styles.featureValue, { color: theme.text }]}>{property.sqMeters}</Text>
              <Text style={[styles.featureLabel, { color: theme.textMuted }]}>m2</Text>
            </View>
          </View>
        </View>
      )}

      {property.amenities.length > 0 && (
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: theme.text }]}>Amenidades</Text>
          <View style={styles.amenitiesGrid}>
            {property.amenities.map((amenity) => (
              <View
                key={amenity}
                style={[
                  styles.amenityChip,
                  { backgroundColor: `${theme.accent}15`, borderColor: `${theme.accent}30` },
                ]}
              >
                <Check size={14} color={theme.accent} />
                <Text style={[styles.amenityText, { color: theme.accent }]}>{amenity}</Text>
              </View>
            ))}
          </View>
        </View>
      )}

      {!!property.features?.length && (
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: theme.text }]}>Incluye</Text>
          <View style={styles.featuresList}>
            {property.features.map((feature) => (
              <View
                key={feature}
                style={[styles.featureChip, { backgroundColor: theme.surface, borderColor: theme.border }]}
              >
                <Check size={14} color={theme.accent} />
                <Text style={[styles.featureChipText, { color: theme.text }]}>{feature}</Text>
              </View>
            ))}
          </View>
        </View>
      )}

      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: theme.text }]}>Ubicacion</Text>
        <View style={[styles.locationCard, { backgroundColor: theme.surface, borderColor: theme.border }]}>
          <Icon size={20} color={theme.accent} />
          <View style={styles.locationInfo}>
            <Text style={[styles.locationAddress, { color: theme.text }]}>{property.address}</Text>
            <Text style={[styles.locationCity, { color: theme.textSecondary }]}>{property.city}</Text>
          </View>
          <MapPin size={20} color={theme.accent} />
        </View>
        {property.locationUrl && (
          <TouchableOpacity
            style={[styles.linkButton, { backgroundColor: `${theme.accent}15`, borderColor: `${theme.accent}30` }]}
            onPress={() => openLink(property.locationUrl)}
          >
            <ExternalLink size={16} color={theme.accent} />
            <Text style={[styles.linkButtonText, { color: theme.accent }]}>Ver ubicación en Google Maps</Text>
          </TouchableOpacity>
        )}
      </View>

      {property.googleDriveImages && (
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: theme.text }]}>Fotos</Text>
          <TouchableOpacity
            style={[styles.linkButton, { backgroundColor: theme.surface, borderColor: theme.border }]}
            onPress={() => openLink(property.googleDriveImages)}
          >
            <ImageIcon size={18} color={theme.accent} />
            <Text style={[styles.linkButtonText, { color: theme.text }]}>Ver todas las fotos en Drive</Text>
          </TouchableOpacity>
        </View>
      )}

      {isForRent && property.monthlyRent ? (
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: theme.text }]}>Detalles de Renta</Text>
          <View style={[styles.rentDetailsCard, { backgroundColor: theme.surface, borderColor: theme.border }]}>
            <View style={styles.rentDetailRow}>
              <Text style={[styles.rentDetailLabel, { color: theme.textMuted }]}>Renta mensual</Text>
              <Text style={[styles.rentDetailValue, { color: theme.accent }]}>{formatCurrency(property.monthlyRent)}</Text>
            </View>
            <View style={[styles.rentDivider, { backgroundColor: theme.border }]} />
            <View style={styles.rentDetailRow}>
              <Text style={[styles.rentDetailLabel, { color: theme.textMuted }]}>Deposito estimado</Text>
              <Text style={[styles.rentDetailValue, { color: theme.text }]}>{formatCurrency(property.monthlyRent * 2)}</Text>
            </View>
          </View>
        </View>
      ) : null}
    </View>
  )
}
