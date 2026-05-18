import { View, Text, StyleSheet, FlatList, TouchableOpacity } from 'react-native'
import { useRouter } from 'expo-router'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useAuth } from '@/contexts/AuthContext'
import { colors, spacing, typography, borderRadius } from '@/lib/theme'
import { formatCurrency } from '@/lib/mock-data'
import { Heart, Home, Building2, Map, Bed, Bath, Maximize, ArrowLeft } from 'lucide-react-native'
import type { Property } from '@/lib/types'

export default function FavoritesStandaloneScreen() {
  const { favorites, availableProperties, toggleFavorite, userProperties } = useAuth()
  const router = useRouter()

  const allProperties = [...availableProperties, ...userProperties]
  const favoriteProperties = allProperties.filter(p => favorites.includes(p.id))

  const getPropertyIcon = (type: Property['type']) => {
    switch (type) {
      case 'house': return Home
      case 'apartment': return Building2
      case 'land': return Map
      default: return Home
    }
  }

  const renderProperty = ({ item: property }: { item: Property }) => {
    const Icon = getPropertyIcon(property.type)

    return (
      <TouchableOpacity 
        style={styles.propertyCard}
        onPress={() => router.push(`/property/${property.id}`)}
      >
        <View style={styles.imageContainer}>
          <Icon size={32} color={colors.textMuted} />
          <TouchableOpacity 
            style={styles.favoriteButton}
            onPress={() => toggleFavorite(property.id)}
          >
            <Heart size={18} color="#fff" fill="#fff" />
          </TouchableOpacity>
        </View>

        <View style={styles.cardContent}>
          <Text style={styles.propertyTitle} numberOfLines={1}>{property.title}</Text>
          <Text style={styles.propertyLocation}>{property.city}</Text>
          
          <View style={styles.features}>
            {property.type !== 'land' && (
              <>
                <View style={styles.feature}>
                  <Bed size={14} color={colors.textMuted} />
                  <Text style={styles.featureText}>{property.bedrooms}</Text>
                </View>
                <View style={styles.feature}>
                  <Bath size={14} color={colors.textMuted} />
                  <Text style={styles.featureText}>{property.bathrooms}</Text>
                </View>
              </>
            )}
            <View style={styles.feature}>
              <Maximize size={14} color={colors.textMuted} />
              <Text style={styles.featureText}>{property.sqMeters}m2</Text>
            </View>
          </View>

          <Text style={styles.price}>{formatCurrency(property.price)}</Text>
        </View>
      </TouchableOpacity>
    )
  }

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      {/* Header personalizado */}
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <ArrowLeft size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Favoritos</Text>
        <View style={styles.placeholder} />
      </View>

      <FlatList
        data={favoriteProperties}
        renderItem={renderProperty}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Heart size={48} color={colors.textMuted} />
            <Text style={styles.emptyStateTitle}>Sin favoritos</Text>
            <Text style={styles.emptyStateText}>
              Guarda las propiedades que te interesen para verlas despues
            </Text>
            <TouchableOpacity 
              style={styles.exploreButton}
              onPress={() => router.replace('/catalog-screen')}
            >
              <Text style={styles.exploreButtonText}>Explorar Catalogo</Text>
            </TouchableOpacity>
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
    justifyContent: 'space-between',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xxl,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: borderRadius.full,
    backgroundColor: colors.surface,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: typography.h3.fontSize,
    fontWeight: '700',
    color: colors.text,
  },
  placeholder: {
    width: 40,
  },
  listContent: {
    padding: spacing.md,
    flexGrow: 1,
  },
  propertyCard: {
    flexDirection: 'row',
    backgroundColor: colors.surface,
    borderRadius: borderRadius.xl,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: spacing.md,
  },
  imageContainer: {
    width: 120,
    height: 120,
    backgroundColor: colors.background,
    justifyContent: 'center',
    alignItems: 'center',
  },
  favoriteButton: {
    position: 'absolute',
    top: spacing.sm,
    right: spacing.sm,
    width: 32,
    height: 32,
    borderRadius: borderRadius.full,
    backgroundColor: colors.error,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cardContent: {
    flex: 1,
    padding: spacing.md,
    justifyContent: 'space-between',
  },
  propertyTitle: {
    fontSize: typography.body.fontSize,
    fontWeight: '600',
    color: colors.text,
  },
  propertyLocation: {
    fontSize: typography.bodySmall.fontSize,
    color: colors.textSecondary,
    marginTop: 2,
  },
  features: {
    flexDirection: 'row',
    gap: spacing.md,
    marginTop: spacing.sm,
  },
  feature: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  featureText: {
    fontSize: typography.caption.fontSize,
    color: colors.textSecondary,
  },
  price: {
    fontSize: typography.body.fontSize,
    fontWeight: '700',
    color: colors.text,
    marginTop: spacing.sm,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: spacing.xxl,
    paddingHorizontal: spacing.lg,
  },
  emptyStateTitle: {
    fontSize: typography.h4.fontSize,
    fontWeight: '600',
    color: colors.text,
    marginTop: spacing.md,
  },
  emptyStateText: {
    fontSize: typography.bodySmall.fontSize,
    color: colors.textSecondary,
    textAlign: 'center',
    marginTop: spacing.sm,
  },
  exploreButton: {
    marginTop: spacing.lg,
    backgroundColor: colors.accent,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.lg,
    borderRadius: borderRadius.md,
  },
  exploreButtonText: {
    color: colors.primary,
    fontSize: typography.body.fontSize,
    fontWeight: '600',
  },
})
