import { useEffect, useMemo } from 'react'
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Image } from 'react-native'
import { useRouter } from 'expo-router'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useAuth } from '@/contexts/AuthContext'
import { colors, spacing, typography, borderRadius, clientThemes } from '@/lib/theme'
import { formatCurrency } from '@/lib/mock-data'
import { Heart, Bed, Bath, ArrowLeft, Home, Building2, Map } from 'lucide-react-native'
import type { Property } from '@/lib/types'

export default function FavoritesScreen() {
  const {
    favoriteProperties,
    toggleFavorite,
    isFavorite,
    loadFavoriteProperties,
    currentUser,
  } = useAuth()
  const router = useRouter()

  const isInvestor = currentUser?.role === 'investor'
  const isTenant = currentUser?.role === 'tenant'
  const isSearching = currentUser?.role === 'searching'
  const theme = useMemo(() => {
    if (isInvestor) return clientThemes.investor
    if (isTenant) return clientThemes.tenant
    if (isSearching) return clientThemes.searching
    return null
  }, [isInvestor, isTenant, isSearching])

  useEffect(() => {
    loadFavoriteProperties()
  }, [loadFavoriteProperties])

  const backgroundColor = theme?.background || colors.background
  const surfaceColor = theme?.surface || colors.surface
  const borderColor = theme?.border || colors.border
  const textColor = theme?.text || colors.text
  const textSecondaryColor = theme?.textSecondary || colors.textSecondary
  const textMutedColor = theme?.textMuted || colors.textMuted
  const accentColor = theme?.accent || colors.accent
  const primaryColor = theme?.primary || colors.primary

  const getPropertyIcon = (type: Property['type']) => {
    switch (type) {
      case 'house': return Home
      case 'apartment': return Building2
      case 'land': return Map
      default: return Home
    }
  }

  const renderPropertyCard = ({ item: property }: { item: Property }) => {
    const Icon = getPropertyIcon(property.type)
    const favorite = isFavorite(property.id)
    const hasImage = property.images && property.images.length > 0 && property.images[0]

    return (
      <TouchableOpacity
        style={[styles.propertyCard, { backgroundColor: surfaceColor, borderColor }]}
        onPress={() => router.push(`/property/${property.id}`)}
        activeOpacity={0.8}
      >
        <View style={[styles.imageContainer, { backgroundColor: theme?.primary || backgroundColor }]}>
          {hasImage ? (
            <Image
              source={{ uri: property.images![0] }}
              style={styles.propertyImage}
              resizeMode="cover"
            />
          ) : (
            <Icon size={40} color={textMutedColor} />
          )}

          <View style={styles.badgeContainer}>
            <View style={[styles.locationBadge, { backgroundColor: surfaceColor }]}>
              <Text style={[styles.locationBadgeText, { color: accentColor }]}>{property.city}</Text>
            </View>
          </View>

          <TouchableOpacity
            style={[
              styles.favoriteButton,
              { backgroundColor: surfaceColor, borderColor },
              favorite && styles.favoriteButtonActive,
            ]}
            onPress={() => toggleFavorite(property.id)}
          >
            <Heart
              size={18}
              color={favorite ? '#fff' : textMutedColor}
              fill={favorite ? '#fff' : 'transparent'}
            />
          </TouchableOpacity>

          {property.status === 'for_rent' && property.monthlyRent && (
            <View style={styles.rentBadge}>
              <Text style={styles.rentBadgeLabel}>RENTA</Text>
              <Text style={[styles.rentBadgePrice, { backgroundColor: accentColor, color: primaryColor }]}>
                {formatCurrency(property.monthlyRent)}/mes
              </Text>
            </View>
          )}
        </View>

        <View style={styles.cardContent}>
          <Text style={[styles.propertyTitle, { color: textColor }]} numberOfLines={1}>
            {property.title}
          </Text>
          <Text style={[styles.propertyAddress, { color: textSecondaryColor }]} numberOfLines={1}>
            {property.address}
          </Text>

          <View style={[styles.divider, { backgroundColor: borderColor }]} />

          <View style={styles.features}>
            {property.type !== 'land' && (
              <>
                <View style={styles.feature}>
                  <Bed size={16} color={textMutedColor} />
                  <Text style={[styles.featureText, { color: textSecondaryColor }]}>{property.bedrooms}</Text>
                </View>
                <View style={styles.feature}>
                  <Bath size={16} color={textMutedColor} />
                  <Text style={[styles.featureText, { color: textSecondaryColor }]}>{property.bathrooms}</Text>
                </View>
              </>
            )}
          </View>

          <View style={styles.priceRow}>
            <Text style={[styles.price, { color: textColor }]}>{formatCurrency(property.price)}</Text>
            <TouchableOpacity
              style={[styles.viewButton, { backgroundColor: accentColor }]}
              onPress={() => router.push(`/property/${property.id}`)}
            >
              <Text style={[styles.viewButtonText, { color: primaryColor }]}>Ver mas</Text>
            </TouchableOpacity>
          </View>
        </View>
      </TouchableOpacity>
    )
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor }]} edges={['top', 'bottom']}>
      <View style={[styles.header, { backgroundColor, borderBottomColor: borderColor }]}>
        <View style={styles.headerSide}>
          <TouchableOpacity
            style={[styles.headerBackButton, { backgroundColor: surfaceColor, borderColor }]}
            onPress={() => router.replace('/(tabs)')}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <ArrowLeft size={18} color={accentColor} />
            <Text style={[styles.headerBackButtonText, { color: textColor }]}>Volver</Text>
          </TouchableOpacity>
        </View>
        <Text style={[styles.headerTitle, { color: textColor }]}>Favoritos</Text>
        <View style={styles.headerSide} />
      </View>

      <FlatList
        data={favoriteProperties}
        renderItem={renderPropertyCard}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Heart size={48} color={textMutedColor} />
            <Text style={[styles.emptyStateTitle, { color: textColor }]}>Sin favoritos</Text>
            <Text style={[styles.emptyStateText, { color: textSecondaryColor }]}>
              Guarda las propiedades que te interesen para verlas aqui.
            </Text>
          </View>
        }
      />
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    paddingTop: spacing.md,
    paddingBottom: spacing.md,
    borderBottomWidth: 1,
  },
  headerSide: {
    width: 112,
    justifyContent: 'center',
  },
  headerBackButton: {
    alignSelf: 'flex-start',
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.full,
    borderWidth: 1,
  },
  headerBackButtonText: {
    fontSize: typography.bodySmall.fontSize,
    fontWeight: '600',
  },
  headerTitle: {
    flex: 1,
    textAlign: 'center',
    fontSize: typography.h3.fontSize,
    fontWeight: '700',
  },
  listContent: {
    paddingHorizontal: spacing.md,
    paddingTop: spacing.xl,
    paddingBottom: spacing.xxl,
  },
  propertyCard: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.xl,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: spacing.md,
  },
  imageContainer: {
    height: 180,
    backgroundColor: colors.background,
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
  },
  locationBadge: {
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.sm,
    borderRadius: borderRadius.full,
  },
  locationBadgeText: {
    fontSize: typography.caption.fontSize,
    fontWeight: '500',
  },
  favoriteButton: {
    position: 'absolute',
    top: spacing.sm,
    right: spacing.sm,
    width: 36,
    height: 36,
    borderRadius: borderRadius.full,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
  },
  favoriteButtonActive: {
    backgroundColor: colors.error,
  },
  rentBadge: {
    position: 'absolute',
    bottom: spacing.sm,
    left: '50%',
    transform: [{ translateX: -60 }],
    alignItems: 'center',
  },
  rentBadgeLabel: {
    backgroundColor: colors.error,
    color: '#fff',
    fontSize: 10,
    fontWeight: '700',
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
    borderTopLeftRadius: borderRadius.sm,
    borderTopRightRadius: borderRadius.sm,
  },
  rentBadgePrice: {
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
  },
  propertyAddress: {
    fontSize: typography.bodySmall.fontSize,
    marginTop: spacing.xs,
  },
  divider: {
    height: 1,
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
  },
  viewButton: {
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    borderRadius: borderRadius.md,
  },
  viewButtonText: {
    fontSize: typography.bodySmall.fontSize,
    fontWeight: '600',
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: spacing.xxl,
    paddingHorizontal: spacing.lg,
  },
  emptyStateTitle: {
    fontSize: typography.h4.fontSize,
    fontWeight: '600',
    marginTop: spacing.md,
  },
  emptyStateText: {
    fontSize: typography.bodySmall.fontSize,
    textAlign: 'center',
    marginTop: spacing.sm,
  },
})
