import { useState, useMemo, useEffect } from 'react'
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  TouchableOpacity,
  Linking,
  Image,
  ActivityIndicator,
} from 'react-native'
import { useLocalSearchParams, useRouter } from 'expo-router'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useAuth } from '@/contexts/AuthContext'
import { spacing, typography, borderRadius, clientThemes } from '@/lib/theme'
import { PropertyCatalogItemResponse } from '@/lib/api/endpoints/catalog'
import { 
  MapPin, 
  Bed, 
  Bath, 
  Car,
  Home,
  Building2,
  Map,
  ArrowLeft,
  ExternalLink,
  DollarSign,
  User,
  FileText,
  Eye,
  Tag,
  Layers,
  ImageIcon,
  CheckCircle,
  XCircle,
} from 'lucide-react-native'

// Colores del tema advisor
const advisorTheme = clientThemes.advisor

// Helper para formatear precio
const formatCurrency = (value: number | null | undefined) => {
  if (!value) return 'No especificado'
  return new Intl.NumberFormat('es-MX', {
    style: 'currency',
    currency: 'MXN',
    minimumFractionDigits: 0,
  }).format(value)
}

// Helper para obtener color de status
const getStatusColor = (status: string | null) => {
  if (!status) return advisorTheme.textMuted
  const s = status.toLowerCase()
  if (s.includes('disponible')) return '#4ade80'
  if (s.includes('apartada')) return '#f59e0b'
  if (s.includes('proceso')) return '#3b82f6'
  if (s.includes('alquilada')) return '#ef4444'
  if (s.includes('edición')) return '#8b5cf6'
  return advisorTheme.textMuted
}

export default function AgentPropertyDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>()
  const router = useRouter()
  const { agentCatalogRawData, loadAgentCatalogProperties, isAgentCatalogLoading, hasLoadedAgentCatalog } = useAuth()

  // Cargar datos si no están disponibles
  useEffect(() => {
    if (!hasLoadedAgentCatalog && !isAgentCatalogLoading) {
      loadAgentCatalogProperties()
    }
  }, [hasLoadedAgentCatalog, isAgentCatalogLoading, loadAgentCatalogProperties])

  // Buscar la propiedad en los datos raw
  const property = useMemo(() => {
    return agentCatalogRawData.find(p => p.id === id)
  }, [agentCatalogRawData, id])

  // Mostrar loading mientras se cargan los datos
  if (isAgentCatalogLoading || (!hasLoadedAgentCatalog && !property)) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
            <ArrowLeft size={24} color={advisorTheme.text} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Cargando...</Text>
          <View style={{ width: 40 }} />
        </View>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={advisorTheme.accent} />
          <Text style={styles.loadingText}>Cargando propiedad...</Text>
        </View>
      </SafeAreaView>
    )
  }

  if (!property) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity 
            style={styles.backButton}
            onPress={() => router.back()}
          >
            <ArrowLeft size={24} color={advisorTheme.text} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Detalle de Propiedad</Text>
          <View style={{ width: 40 }} />
        </View>
        <View style={styles.notFound}>
          <Text style={styles.notFoundText}>Propiedad no encontrada</Text>
        </View>
      </SafeAreaView>
    )
  }

  const getPropertyIcon = () => {
    if (property.isALand) return Map
    if (property.bed && parseInt(property.bed) > 0) return Home
    return Building2
  }

  const Icon = getPropertyIcon()

  const openLink = (url: string | null) => {
    if (url) {
      Linking.openURL(url)
    }
  }

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <ArrowLeft size={24} color={advisorTheme.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Detalle de Propiedad</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Imagen */}
        {property.urlImage && (
          <View style={styles.imageContainer}>
            <Image 
              source={{ uri: property.urlImage }}
              style={styles.propertyImage}
              resizeMode="cover"
            />
            {property.banner && (
              <View style={styles.bannerBadge}>
                <Text style={styles.bannerText}>Destacada</Text>
              </View>
            )}
          </View>
        )}

        {/* Encabezado de propiedad */}
        <View style={styles.propertyHeader}>
          <View style={styles.propertyIconContainer}>
            <Icon size={32} color={advisorTheme.accent} />
          </View>
          <View style={styles.propertyMainInfo}>
            <Text style={styles.propertyName}>{property.name}</Text>
            <View style={styles.statusContainer}>
              <View style={[styles.statusBadge, { backgroundColor: getStatusColor(property.status) + '20' }]}>
                <View style={[styles.statusDot, { backgroundColor: getStatusColor(property.status) }]} />
                <Text style={[styles.statusText, { color: getStatusColor(property.status) }]}>
                  {property.status || 'Sin status'}
                </Text>
              </View>
              <View style={styles.listBadge}>
                <Text style={styles.listText}>
                  {property.list === 'rent' ? 'Renta' : 'Venta'}
                </Text>
              </View>
            </View>
          </View>
        </View>

        {/* Precios */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Precios</Text>
          <View style={styles.card}>
            <View style={styles.priceRow}>
              <View style={styles.priceItem}>
                <DollarSign size={20} color={advisorTheme.accent} />
                <View>
                  <Text style={styles.priceLabel}>Precio Publicado</Text>
                  <Text style={styles.priceValue}>{property.priceData || 'No especificado'}</Text>
                </View>
              </View>
            </View>
            <View style={styles.divider} />
            <View style={styles.priceGrid}>
              <View style={styles.priceGridItem}>
                <Text style={styles.priceGridLabel}>Precio Min</Text>
                <Text style={styles.priceGridValue}>{formatCurrency(property.minPrice)}</Text>
              </View>
              <View style={styles.priceGridItem}>
                <Text style={styles.priceGridLabel}>Precio Max</Text>
                <Text style={styles.priceGridValue}>{formatCurrency(property.maxPrice)}</Text>
              </View>
              <View style={styles.priceGridItem}>
                <Text style={styles.priceGridLabel}>Precio Especial</Text>
                <Text style={[styles.priceGridValue, property.priceSpecial && { color: '#4ade80' }]}>
                  {formatCurrency(property.priceSpecial)}
                </Text>
              </View>
            </View>
            {property.offer && (
              <View style={styles.offerBadge}>
                <Tag size={14} color="#fff" />
                <Text style={styles.offerText}>En Oferta</Text>
              </View>
            )}
          </View>
        </View>

        {/* Caracteristicas */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Caracteristicas</Text>
          <View style={styles.card}>
            <View style={styles.featuresGrid}>
              {property.bed && (
                <View style={styles.featureItem}>
                  <Bed size={20} color={advisorTheme.accent} />
                  <Text style={styles.featureValue}>{property.bed}</Text>
                </View>
              )}
              {property.wc && (
                <View style={styles.featureItem}>
                  <Bath size={20} color={advisorTheme.accent} />
                  <Text style={styles.featureValue}>{property.wc}</Text>
                </View>
              )}
              {property.parking && (
                <View style={styles.featureItem}>
                  <Car size={20} color={advisorTheme.accent} />
                  <Text style={styles.featureValue}>{property.parking} Est.</Text>
                </View>
              )}
            </View>
            {(property.propertyArea || property.propertyDimensions) && (
              <>
                <View style={styles.divider} />
                <View style={styles.infoRow}>
                  <Layers size={18} color={advisorTheme.textMuted} />
                  <View>
                    {property.propertyArea && (
                      <Text style={styles.infoText}>Area: {property.propertyArea}</Text>
                    )}
                    {property.propertyDimensions && (
                      <Text style={styles.infoText}>Dimensiones: {property.propertyDimensions}</Text>
                    )}
                  </View>
                </View>
              </>
            )}
          </View>
        </View>

        {/* Ubicacion */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Ubicacion</Text>
          <View style={styles.card}>
            <View style={styles.infoRow}>
              <MapPin size={20} color={advisorTheme.accent} />
              <Text style={styles.addressText}>{property.address}</Text>
            </View>
            {property.zonaText && (
              <View style={styles.infoRow}>
                <Map size={18} color={advisorTheme.textMuted} />
                <Text style={styles.infoText}>Zona: {property.zonaText}</Text>
              </View>
            )}
            {property.propertyView && (
              <View style={styles.infoRow}>
                <Eye size={18} color={advisorTheme.textMuted} />
                <Text style={styles.infoText}>Vista: {property.propertyView}</Text>
              </View>
            )}
            {property.locationUrl && (
              <TouchableOpacity 
                style={styles.linkButton}
                onPress={() => openLink(property.locationUrl)}
              >
                <ExternalLink size={16} color={advisorTheme.accent} />
                <Text style={styles.linkText}>Ver en Google Maps</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>

        {/* Propietario */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Propietario</Text>
          <View style={styles.card}>
            <View style={styles.infoRow}>
              <User size={20} color={advisorTheme.accent} />
              <Text style={styles.ownerText}>{property.owner || 'No especificado'}</Text>
            </View>
            {property.propertyPayment && (
              <View style={styles.infoRow}>
                <DollarSign size={18} color={advisorTheme.textMuted} />
                <Text style={styles.infoText}>Forma de pago: {property.propertyPayment}</Text>
              </View>
            )}
          </View>
        </View>

        {/* Descripcion e Informacion */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Descripcion</Text>
          <View style={styles.card}>
            {property.propertyDescription && (
              <View style={styles.descriptionBlock}>
                <Text style={styles.descriptionLabel}>Descripcion</Text>
                <Text style={styles.descriptionText}>{property.propertyDescription}</Text>
              </View>
            )}
            {property.propertyInformation && (
              <View style={styles.descriptionBlock}>
                <Text style={styles.descriptionLabel}>Informacion adicional</Text>
                <Text style={styles.descriptionText}>{property.propertyInformation}</Text>
              </View>
            )}
            {property.propertyAmenities && (
              <View style={styles.descriptionBlock}>
                <Text style={styles.descriptionLabel}>Amenidades</Text>
                <Text style={styles.descriptionText}>{property.propertyAmenities}</Text>
              </View>
            )}
          </View>
        </View>

        {/* Fotos */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Fotos</Text>
          <View style={styles.card}>
            <View style={styles.photosStatus}>
              <View style={styles.photoStatusItem}>
                {property.originalPhotos === 'SI' ? (
                  <CheckCircle size={18} color="#4ade80" />
                ) : (
                  <XCircle size={18} color={advisorTheme.textMuted} />
                )}
                <Text style={styles.photoStatusText}>
                  Fotos originales: {property.originalPhotos || 'No'}
                </Text>
              </View>
              <View style={styles.photoStatusItem}>
                {property.editedPhotos === 'SI' ? (
                  <CheckCircle size={18} color="#4ade80" />
                ) : (
                  <XCircle size={18} color={advisorTheme.textMuted} />
                )}
                <Text style={styles.photoStatusText}>
                  Fotos editadas: {property.editedPhotos || 'No'}
                </Text>
              </View>
            </View>
            {property.googleDriveImages && (
              <TouchableOpacity 
                style={styles.linkButton}
                onPress={() => openLink(property.googleDriveImages)}
              >
                <ImageIcon size={16} color={advisorTheme.accent} />
                <Text style={styles.linkText}>Ver todas las fotos en Drive</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>

        {/* ID de la propiedad */}
        <View style={styles.section}>
          <View style={styles.idContainer}>
            <FileText size={14} color={advisorTheme.textMuted} />
            <Text style={styles.idText}>ID: {property.id}</Text>
          </View>
        </View>

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
    borderRadius: borderRadius.lg,
    backgroundColor: advisorTheme.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: typography.h4.fontSize,
    fontWeight: '600',
    color: advisorTheme.text,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: spacing.xl,
  },
  notFound: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  notFoundText: {
    color: advisorTheme.textMuted,
    fontSize: typography.body.fontSize,
  },
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.md,
  },
  loadingText: {
    color: advisorTheme.textMuted,
    fontSize: typography.body.fontSize,
  },
  imageContainer: {
    width: '100%',
    height: 220,
    position: 'relative',
  },
  propertyImage: {
    width: '100%',
    height: '100%',
  },
  bannerBadge: {
    position: 'absolute',
    top: spacing.md,
    right: spacing.md,
    backgroundColor: advisorTheme.accent,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.sm,
  },
  bannerText: {
    color: advisorTheme.background,
    fontSize: typography.caption.fontSize,
    fontWeight: '600',
  },
  propertyHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    padding: spacing.md,
    gap: spacing.md,
  },
  propertyIconContainer: {
    width: 56,
    height: 56,
    borderRadius: borderRadius.lg,
    backgroundColor: advisorTheme.accent + '20',
    alignItems: 'center',
    justifyContent: 'center',
  },
  propertyMainInfo: {
    flex: 1,
  },
  propertyName: {
    fontSize: typography.h4.fontSize,
    fontWeight: '700',
    color: advisorTheme.text,
    marginBottom: spacing.xs,
  },
  statusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.full,
    gap: spacing.xs,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  statusText: {
    fontSize: typography.caption.fontSize,
    fontWeight: '600',
  },
  listBadge: {
    backgroundColor: advisorTheme.surface,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.full,
  },
  listText: {
    fontSize: typography.caption.fontSize,
    color: advisorTheme.textSecondary,
    fontWeight: '500',
  },
  section: {
    paddingHorizontal: spacing.md,
    marginBottom: spacing.md,
  },
  sectionTitle: {
    fontSize: typography.body.fontSize,
    fontWeight: '600',
    color: advisorTheme.text,
    marginBottom: spacing.sm,
  },
  card: {
    backgroundColor: advisorTheme.surface,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: advisorTheme.border,
  },
  priceRow: {
    marginBottom: spacing.sm,
  },
  priceItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  priceLabel: {
    fontSize: typography.caption.fontSize,
    color: advisorTheme.textMuted,
  },
  priceValue: {
    fontSize: typography.h4.fontSize,
    fontWeight: '700',
    color: advisorTheme.accent,
  },
  divider: {
    height: 1,
    backgroundColor: advisorTheme.border,
    marginVertical: spacing.sm,
  },
  priceGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  priceGridItem: {
    flex: 1,
    alignItems: 'center',
  },
  priceGridLabel: {
    fontSize: typography.caption.fontSize,
    color: advisorTheme.textMuted,
    marginBottom: 2,
  },
  priceGridValue: {
    fontSize: typography.body.fontSize,
    fontWeight: '600',
    color: advisorTheme.text,
  },
  offerBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#ef4444',
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.sm,
    marginTop: spacing.sm,
    gap: spacing.xs,
  },
  offerText: {
    color: '#fff',
    fontSize: typography.caption.fontSize,
    fontWeight: '600',
  },
  featuresGrid: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  featureItem: {
    alignItems: 'center',
    gap: spacing.xs,
  },
  featureValue: {
    fontSize: typography.body.fontSize,
    fontWeight: '600',
    color: advisorTheme.text,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.sm,
    marginBottom: spacing.sm,
  },
  infoText: {
    fontSize: typography.body.fontSize,
    color: advisorTheme.textSecondary,
    flex: 1,
  },
  addressText: {
    fontSize: typography.body.fontSize,
    color: advisorTheme.text,
    flex: 1,
    fontWeight: '500',
  },
  ownerText: {
    fontSize: typography.body.fontSize,
    color: advisorTheme.text,
    fontWeight: '600',
  },
  linkButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.xs,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.md,
    backgroundColor: advisorTheme.accent + '15',
    marginTop: spacing.xs,
  },
  linkText: {
    color: advisorTheme.accent,
    fontSize: typography.body.fontSize,
    fontWeight: '500',
  },
  descriptionBlock: {
    marginBottom: spacing.sm,
  },
  descriptionLabel: {
    fontSize: typography.caption.fontSize,
    color: advisorTheme.textMuted,
    marginBottom: spacing.xs,
    textTransform: 'uppercase',
  },
  descriptionText: {
    fontSize: typography.body.fontSize,
    color: advisorTheme.textSecondary,
    lineHeight: 22,
  },
  photosStatus: {
    gap: spacing.sm,
    marginBottom: spacing.sm,
  },
  photoStatusItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  photoStatusText: {
    fontSize: typography.body.fontSize,
    color: advisorTheme.textSecondary,
  },
  idContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.xs,
    paddingVertical: spacing.sm,
  },
  idText: {
    fontSize: typography.caption.fontSize,
    color: advisorTheme.textMuted,
  },
})
