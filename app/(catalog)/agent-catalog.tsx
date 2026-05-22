import { useState, useMemo, useEffect } from 'react'
import { 
  View, 
  Text, 
  StyleSheet, 
  FlatList, 
  TouchableOpacity, 
  TextInput,
  ScrollView,
  ActivityIndicator,
  Image,
} from 'react-native'
import { useRouter } from 'expo-router'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useAuth } from '@/contexts/AuthContext'
import { colors, spacing, typography, borderRadius, clientThemes } from '@/lib/theme'
import { formatCurrency } from '@/lib/mock-data'
import type { Property } from '@/lib/types'
import { getAgentCatalogRentProperties, getAgentCatalogSaleProperties, PropertyCatalogItemResponse } from '@/lib/api/endpoints/catalog'
import { 
  Search, 
  Filter, 
  Bed, 
  Bath, 
  Home,
  Building2,
  Map,
  ArrowLeft,
  RefreshCw
} from 'lucide-react-native'

// Colores del tema advisor
const advisorColors = clientThemes.advisor

export default function AgentCatalogScreen() {
  const { currentUser } = useAuth()
  const router = useRouter()
  
  const [properties, setProperties] = useState<Property[]>([])
  const [rawData, setRawData] = useState<PropertyCatalogItemResponse[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [filter, setFilter] = useState<'all' | 'sale' | 'rent'>('all')
  const [statusFilter, setStatusFilter] = useState<string>('all')

  const loadProperties = async () => {
    setIsLoading(true)
    try {
      const [rentResult, saleResult] = await Promise.all([
        getAgentCatalogRentProperties(),
        getAgentCatalogSaleProperties()
      ])
      
      setProperties([...rentResult.properties, ...saleResult.properties])
      setRawData([...rentResult.rawData, ...saleResult.rawData])
    } catch (error) {
      console.error('Error cargando catalogo de asesores:', error)
      setProperties([])
      setRawData([])
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    loadProperties()
  }, [])

  const availableStatuses = useMemo(() => {
    const statuses = new Set(rawData.map(item => item.status || 'Sin status'))
    return Array.from(statuses).sort()
  }, [rawData])

  // Filtrar propiedades
  const filteredProperties = useMemo(() => {
    return properties.filter(property => {
      const matchesSearch = property.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        property.city.toLowerCase().includes(searchQuery.toLowerCase())
      
      const matchesFilter = filter === 'all' ||
        (filter === 'sale' && (property.status === 'for_sale' || property.status === 'available')) ||
        (filter === 'rent' && (property.status === 'for_rent' || property.status === 'available'))
      
      let matchesStatus = true
      if (statusFilter !== 'all') {
        const rawItem = rawData.find(item => item.id === property.id)
        matchesStatus = rawItem?.status?.toLowerCase().includes(statusFilter.toLowerCase()) || false
      }
      
      return matchesSearch && matchesFilter && matchesStatus
    })
  }, [properties, rawData, searchQuery, filter, statusFilter])

  const getPropertyIcon = (type: Property['type']) => {
    switch (type) {
      case 'house': return Home
      case 'apartment': return Building2
      case 'land': return Map
      default: return Home
    }
  }

  const getPropertyStatus = (propertyId: string) => {
    const rawItem = rawData.find(item => item.id === propertyId)
    return rawItem?.status || 'Sin status'
  }

  const getStatusColor = (status: string) => {
    const s = status.toLowerCase()
    if (s.includes('disponible')) return '#22c55e'
    if (s.includes('apartada')) return '#f59e0b'
    if (s.includes('proceso')) return '#6366f1'
    if (s.includes('alquilada')) return '#06b6d4'
    if (s.includes('edición')) return '#8b5cf6'
    return advisorColors.textMuted
  }

  const renderPropertyCard = ({ item: property }: { item: Property }) => {
    const Icon = getPropertyIcon(property.type)
    const status = getPropertyStatus(property.id)
    const hasImage = property.images && property.images.length > 0 && property.images[0]

    return (
      <TouchableOpacity 
        style={styles.propertyCard}
        onPress={() => router.push(`/agent-property/${property.id}`)}
        activeOpacity={0.7}
      >
        <View style={styles.imageContainer}>
          {hasImage ? (
            <Image
              source={{ uri: property.images![0] }}
              style={styles.propertyImage}
              resizeMode="cover"
            />
          ) : (
            <Icon size={40} color={advisorColors.textMuted} />
          )}
          
          <View style={styles.badgeContainer}>
            <View style={styles.locationBadge}>
              <Text style={styles.locationBadgeText}>{property.city}</Text>
            </View>
            <View style={[styles.statusBadge, { backgroundColor: getStatusColor(status) }]}>
              <Text style={styles.statusBadgeText}>{status}</Text>
            </View>
          </View>

          {property.status === 'for_rent' && property.monthlyRent && (
            <View style={styles.rentBadge}>
              <Text style={styles.rentBadgeLabel}>RENTA</Text>
              <Text style={styles.rentBadgePrice}>
                {formatCurrency(property.monthlyRent)}/mes
              </Text>
            </View>
          )}
        </View>

        <View style={styles.cardContent}>
          <Text style={styles.propertyTitle} numberOfLines={1}>
            {property.title}
          </Text>
          <Text style={styles.propertyAddress} numberOfLines={1}>
            {property.address}
          </Text>

          <View style={styles.divider} />
          
          <View style={styles.features}>
            {property.type !== 'land' && (
              <>
                <View style={styles.feature}>
                  <Bed size={16} color={advisorColors.textMuted} />
                  <Text style={styles.featureText}>
                    {property.bedrooms}
                  </Text>
                </View>
                <View style={styles.feature}>
                  <Bath size={16} color={advisorColors.textMuted} />
                  <Text style={styles.featureText}>
                    {property.bathrooms}
                  </Text>
                </View>
              </>
            )}
          </View>

          <View style={styles.priceRow}>
            <Text style={styles.price}>
              {formatCurrency(property.price)}
            </Text>
            <TouchableOpacity 
              style={styles.viewButton}
              onPress={() => router.push(`/property/${property.id}`)}
            >
              <Text style={styles.viewButtonText}>
                Ver detalles
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </TouchableOpacity>
    )
  }

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <ArrowLeft size={24} color={advisorColors.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Catalogo de Propiedades</Text>
        <TouchableOpacity 
          style={styles.refreshButton}
          onPress={loadProperties}
        >
          <RefreshCw size={24} color={advisorColors.accent} />
        </TouchableOpacity>
      </View>

      <View style={styles.counterContainer}>
        <Text style={styles.counterText}>
          {properties.length} propiedades en total
        </Text>
      </View>

      <View style={styles.searchContainer}>
        <View style={styles.searchInputContainer}>
          <Search size={20} color={advisorColors.textMuted} />
          <TextInput
            style={styles.searchInput}
            placeholder="Buscar propiedades..."
            placeholderTextColor={advisorColors.textMuted}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>
        <TouchableOpacity style={styles.filterButton}>
          <Filter size={20} color={advisorColors.accent} />
        </TouchableOpacity>
      </View>

      <View style={styles.filterTabs}>
        <TouchableOpacity 
          style={[styles.filterTab, filter === 'all' && styles.filterTabActive]}
          onPress={() => setFilter('all')}
        >
          <Text style={[styles.filterTabText, filter === 'all' && styles.filterTabTextActive]}>
            Todos
          </Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={[styles.filterTab, filter === 'sale' && styles.filterTabActive]}
          onPress={() => setFilter('sale')}
        >
          <Text style={[styles.filterTabText, filter === 'sale' && styles.filterTabTextActive]}>
            Venta
          </Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={[styles.filterTab, filter === 'rent' && styles.filterTabActive]}
          onPress={() => setFilter('rent')}
        >
          <Text style={[styles.filterTabText, filter === 'rent' && styles.filterTabTextActive]}>
            Renta
          </Text>
        </TouchableOpacity>
      </View>

      {availableStatuses.length > 0 && (
        <View style={styles.statusFilterContainer}>
          <Text style={styles.statusFilterLabel}>Filtrar por status:</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.statusFilterScroll}>
            <TouchableOpacity 
              style={[styles.statusFilterChip, statusFilter === 'all' && styles.statusFilterChipActive]}
              onPress={() => setStatusFilter('all')}
            >
              <Text style={[styles.statusFilterChipText, statusFilter === 'all' && styles.statusFilterChipTextActive]}>
                Todos ({properties.length})
              </Text>
            </TouchableOpacity>
            {availableStatuses.map(status => (
              <TouchableOpacity 
                key={status}
                style={[
                  styles.statusFilterChip, 
                  statusFilter === status.toLowerCase() && styles.statusFilterChipActive
                ]}
                onPress={() => setStatusFilter(status.toLowerCase())}
              >
                <Text style={[
                  styles.statusFilterChipText, 
                  statusFilter === status.toLowerCase() && styles.statusFilterChipTextActive
                ]}>
                  {status} ({rawData.filter(item => item.status === status).length})
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
      )}

      {isLoading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={advisorColors.accent} />
          <Text style={styles.loadingText}>Cargando propiedades...</Text>
        </View>
      ) : (
        <FlatList
          data={filteredProperties}
          renderItem={renderPropertyCard}
          keyExtractor={item => item.id}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            <View style={styles.emptyState}>
              <Building2 size={48} color={advisorColors.textMuted} />
              <Text style={styles.emptyStateText}>
                No se encontraron propiedades
              </Text>
            </View>
          }
        />
      )}
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: advisorColors.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: advisorColors.border,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: borderRadius.full,
    backgroundColor: advisorColors.surface,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: typography.h3.fontSize,
    fontWeight: '700',
    color: advisorColors.text,
  },
  refreshButton: {
    width: 40,
    height: 40,
    borderRadius: borderRadius.full,
    backgroundColor: advisorColors.surface,
    justifyContent: 'center',
    alignItems: 'center',
  },
  counterContainer: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  counterText: {
    fontSize: typography.bodySmall.fontSize,
    color: advisorColors.textSecondary,
  },
  searchContainer: {
    flexDirection: 'row',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    gap: spacing.sm,
  },
  searchInputContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: advisorColors.surface,
    borderRadius: borderRadius.lg,
    paddingHorizontal: spacing.md,
    borderWidth: 1,
    borderColor: advisorColors.border,
  },
  searchInput: {
    flex: 1,
    paddingVertical: spacing.sm,
    paddingLeft: spacing.sm,
    fontSize: typography.body.fontSize,
    color: advisorColors.text,
  },
  filterButton: {
    width: 48,
    height: 48,
    borderRadius: borderRadius.lg,
    backgroundColor: advisorColors.surface,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: advisorColors.border,
  },
  filterTabs: {
    flexDirection: 'row',
    paddingHorizontal: spacing.md,
    paddingBottom: spacing.sm,
    gap: spacing.sm,
  },
  filterTab: {
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    borderRadius: borderRadius.full,
    backgroundColor: advisorColors.surface,
    borderWidth: 1,
    borderColor: advisorColors.border,
  },
  filterTabActive: {
    backgroundColor: advisorColors.accent,
    borderColor: advisorColors.accent,
  },
  filterTabText: {
    fontSize: typography.bodySmall.fontSize,
    color: advisorColors.textSecondary,
  },
  filterTabTextActive: {
    color: advisorColors.background,
    fontWeight: '600',
  },
  statusFilterContainer: {
    paddingHorizontal: spacing.md,
    paddingBottom: spacing.sm,
  },
  statusFilterLabel: {
    fontSize: typography.bodySmall.fontSize,
    color: advisorColors.textMuted,
    marginBottom: spacing.xs,
  },
  statusFilterScroll: {
    flexGrow: 0,
  },
  statusFilterChip: {
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.sm,
    borderRadius: borderRadius.full,
    backgroundColor: advisorColors.surface,
    borderWidth: 1,
    borderColor: advisorColors.border,
    marginRight: spacing.xs,
  },
  statusFilterChipActive: {
    backgroundColor: advisorColors.accent,
    borderColor: advisorColors.accent,
  },
  statusFilterChipText: {
    fontSize: typography.caption.fontSize,
    color: advisorColors.textSecondary,
  },
  statusFilterChipTextActive: {
    color: advisorColors.background,
    fontWeight: '600',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: spacing.md,
    fontSize: typography.body.fontSize,
    color: advisorColors.textMuted,
  },
  listContent: {
    padding: spacing.md,
    gap: spacing.md,
  },
  propertyCard: {
    backgroundColor: advisorColors.surface,
    borderRadius: borderRadius.xl,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: advisorColors.border,
    marginBottom: spacing.md,
  },
  imageContainer: {
    height: 180,
    backgroundColor: advisorColors.background,
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
  },
  propertyImage: {
    width: '100%',
    height: '100%',
  },
  badgeContainer: {
    position: 'absolute',
    top: spacing.sm,
    left: spacing.sm,
    flexDirection: 'row',
    gap: spacing.xs,
    flexWrap: 'wrap',
  },
  locationBadge: {
    backgroundColor: advisorColors.surface,
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.sm,
    borderRadius: borderRadius.full,
  },
  locationBadgeText: {
    color: advisorColors.accent,
    fontSize: typography.caption.fontSize,
    fontWeight: '500',
  },
  statusBadge: {
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.sm,
    borderRadius: borderRadius.full,
  },
  statusBadgeText: {
    color: '#fff',
    fontSize: typography.caption.fontSize,
    fontWeight: '600',
  },
  rentBadge: {
    position: 'absolute',
    bottom: spacing.sm,
    left: '50%',
    transform: [{ translateX: -60 }],
    alignItems: 'center',
  },
  rentBadgeLabel: {
    backgroundColor: '#ef4444',
    color: '#fff',
    fontSize: 10,
    fontWeight: '700',
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
    borderTopLeftRadius: borderRadius.sm,
    borderTopRightRadius: borderRadius.sm,
  },
  rentBadgePrice: {
    backgroundColor: advisorColors.accent,
    color: advisorColors.background,
    fontSize: typography.bodySmall.fontSize,
    fontWeight: '700',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderBottomLeftRadius: borderRadius.sm,
    borderBottomRightRadius: borderRadius.sm,
  },
  cardContent: {
    padding: spacing.md,
  },
  propertyTitle: {
    fontSize: typography.body.fontSize,
    fontWeight: '600',
    color: advisorColors.text,
  },
  propertyAddress: {
    fontSize: typography.bodySmall.fontSize,
    color: advisorColors.textSecondary,
    marginTop: spacing.xs,
  },
  divider: {
    height: 1,
    backgroundColor: advisorColors.border,
    marginVertical: spacing.md,
  },
  features: {
    flexDirection: 'row',
    gap: spacing.lg,
  },
  feature: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  featureText: {
    fontSize: typography.bodySmall.fontSize,
    color: advisorColors.textSecondary,
  },
  priceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: spacing.md,
  },
  price: {
    fontSize: typography.h4.fontSize,
    fontWeight: '700',
    color: advisorColors.text,
  },
  viewButton: {
    backgroundColor: advisorColors.accent,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    borderRadius: borderRadius.md,
  },
  viewButtonText: {
    color: advisorColors.background,
    fontSize: typography.bodySmall.fontSize,
    fontWeight: '600',
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: spacing.xxl,
  },
  emptyStateText: {
    fontSize: typography.body.fontSize,
    color: advisorColors.textMuted,
    marginTop: spacing.md,
  },
})
