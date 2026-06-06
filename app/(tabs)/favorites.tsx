import { useEffect } from 'react'
import { View, Text, StyleSheet, FlatList, TouchableOpacity } from 'react-native'
import { useRouter } from 'expo-router'
import { usePropertyDomain } from '@/contexts/auth/use-property-domain'
import { spacing, typography, borderRadius } from '@/lib/theme'
import { Heart, ArrowLeft } from 'lucide-react-native'
import { AppScreen } from '@/components/ui'
import { useAppTheme } from '@/lib/hooks/useAppTheme'
import { PropertyListCard } from '@/components/properties/PropertyListCard'

export default function FavoritesScreen() {
  const {
    favoriteProperties,
    toggleFavorite,
    loadFavoriteProperties,
  } = usePropertyDomain()
  const router = useRouter()
  const { theme } = useAppTheme()
  const styles = createStyles(theme)

  useEffect(() => {
    loadFavoriteProperties()
  }, [loadFavoriteProperties])

  return (
    <AppScreen>
      <View style={styles.header}>
        <View style={styles.headerSide}>
          <TouchableOpacity
            style={styles.headerBackButton}
            onPress={() => router.replace('/(tabs)')}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <ArrowLeft size={18} color={theme.accent} />
            <Text style={styles.headerBackButtonText}>Volver</Text>
          </TouchableOpacity>
        </View>
        <Text style={styles.headerTitle}>Favoritos</Text>
        <View style={styles.headerSide} />
      </View>

      <FlatList
        data={favoriteProperties}
        renderItem={({ item }) => (
          <PropertyListCard
            property={item}
            favorite
            onPress={() => router.push(`/property/${item.id}`)}
            onToggleFavorite={() => toggleFavorite(item.id)}
          />
        )}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Heart size={48} color={theme.textMuted} />
            <Text style={styles.emptyStateTitle}>Sin favoritos</Text>
            <Text style={styles.emptyStateText}>
              Guarda las propiedades que te interesen para verlas aquí.
            </Text>
          </View>
        }
      />
    </AppScreen>
  )
}

const createStyles = (theme: ReturnType<typeof useAppTheme>['theme']) => StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    paddingTop: spacing.md,
    paddingBottom: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: theme.border,
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
    backgroundColor: theme.surface,
    borderColor: theme.border,
  },
  headerBackButtonText: {
    fontSize: typography.bodySmall.fontSize,
    fontWeight: '600',
    color: theme.text,
  },
  headerTitle: {
    flex: 1,
    textAlign: 'center',
    fontSize: typography.h3.fontSize,
    fontWeight: '700',
    color: theme.text,
  },
  listContent: {
    paddingHorizontal: spacing.md,
    paddingTop: spacing.xl,
    paddingBottom: spacing.xxl,
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
    color: theme.text,
  },
  emptyStateText: {
    fontSize: typography.bodySmall.fontSize,
    textAlign: 'center',
    marginTop: spacing.sm,
    color: theme.textSecondary,
  },
})
