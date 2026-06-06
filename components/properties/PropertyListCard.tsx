import { Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native'
import { Bath, Bed, Building2, Heart, Home, Map } from 'lucide-react-native'

import { useAppTheme } from '@/lib/hooks/useAppTheme'
import { borderRadius, colors, spacing, typography } from '@/lib/theme'
import type { Property } from '@/lib/types'
import { formatCurrency } from '@/lib/utils'

type PropertyListCardProps = {
  property: Property
  favorite: boolean
  onPress: () => void
  onToggleFavorite: () => void
  showPendingBadge?: boolean
}

export function PropertyListCard({
  favorite,
  onPress,
  onToggleFavorite,
  property,
  showPendingBadge = false,
}: PropertyListCardProps) {
  const { theme } = useAppTheme()
  const styles = createStyles(theme)

  const hasImage = property.images && property.images.length > 0 && property.images[0]
  const isPending = property.status === 'pending_sale' || property.status === 'pending_rent'
  const Icon = getPropertyIcon(property.type)

  return (
    <TouchableOpacity style={styles.propertyCard} onPress={onPress} activeOpacity={0.8}>
      <View style={styles.imageContainer}>
        {hasImage ? (
          <Image source={{ uri: property.images![0] }} style={styles.propertyImage} resizeMode="cover" />
        ) : (
          <Icon size={40} color={theme.textMuted} />
        )}

        <View style={styles.badgeContainer}>
          <View style={styles.locationBadge}>
            <Text style={styles.locationBadgeText}>{property.city}</Text>
          </View>
          {showPendingBadge && isPending ? (
            <View style={styles.pendingBadge}>
              <Text style={styles.pendingBadgeText}>En Proceso</Text>
            </View>
          ) : null}
        </View>

        <TouchableOpacity
          style={[styles.favoriteButton, favorite && styles.favoriteButtonActive]}
          onPress={onToggleFavorite}
        >
          <Heart size={18} color={favorite ? '#fff' : theme.textMuted} fill={favorite ? '#fff' : 'transparent'} />
        </TouchableOpacity>

        {property.status === 'for_rent' && property.monthlyRent ? (
          <View style={styles.rentBadge}>
            <Text style={styles.rentBadgeLabel}>RENTA</Text>
            <Text style={styles.rentBadgePrice}>{formatCurrency(property.monthlyRent)}/mes</Text>
          </View>
        ) : null}
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
          {property.type !== 'land' ? (
            <>
              <View style={styles.feature}>
                <Bed size={16} color={theme.textMuted} />
                <Text style={styles.featureText}>{property.bedrooms}</Text>
              </View>
              <View style={styles.feature}>
                <Bath size={16} color={theme.textMuted} />
                <Text style={styles.featureText}>{property.bathrooms}</Text>
              </View>
            </>
          ) : null}
        </View>

        <View style={styles.priceRow}>
          <Text style={styles.price}>{formatCurrency(property.price)}</Text>
          <TouchableOpacity style={styles.viewButton} onPress={onPress}>
            <Text style={styles.viewButtonText}>Ver mas</Text>
          </TouchableOpacity>
        </View>
      </View>
    </TouchableOpacity>
  )
}

function getPropertyIcon(type: Property['type']) {
  switch (type) {
    case 'house':
      return Home
    case 'apartment':
      return Building2
    case 'land':
      return Map
    default:
      return Home
  }
}

const createStyles = (theme: ReturnType<typeof useAppTheme>['theme']) =>
  StyleSheet.create({
    propertyCard: {
      backgroundColor: theme.surface,
      borderRadius: borderRadius.xl,
      overflow: 'hidden',
      borderWidth: 1,
      borderColor: theme.border,
      marginBottom: spacing.md,
    },
    imageContainer: {
      height: 180,
      backgroundColor: theme.primary,
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
      backgroundColor: theme.surface,
      paddingVertical: spacing.xs,
      paddingHorizontal: spacing.sm,
      borderRadius: borderRadius.full,
    },
    locationBadgeText: {
      color: theme.accent,
      fontSize: typography.caption.fontSize,
      fontWeight: '500',
    },
    pendingBadge: {
      backgroundColor: colors.info,
      paddingVertical: spacing.xs,
      paddingHorizontal: spacing.sm,
      borderRadius: borderRadius.full,
    },
    pendingBadgeText: {
      color: '#fff',
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
      backgroundColor: theme.surface,
      justifyContent: 'center',
      alignItems: 'center',
      borderWidth: 1,
      borderColor: theme.border,
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
      backgroundColor: theme.accent,
      color: theme.primary,
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
      color: theme.text,
    },
    propertyAddress: {
      fontSize: typography.bodySmall.fontSize,
      color: theme.textSecondary,
      marginTop: spacing.xs,
    },
    divider: {
      height: 1,
      backgroundColor: theme.border,
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
      color: theme.textSecondary,
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
      color: theme.text,
    },
    viewButton: {
      backgroundColor: theme.accent,
      paddingVertical: spacing.sm,
      paddingHorizontal: spacing.md,
      borderRadius: borderRadius.md,
    },
    viewButtonText: {
      color: theme.primary,
      fontSize: typography.bodySmall.fontSize,
      fontWeight: '600',
    },
  })

export default PropertyListCard
