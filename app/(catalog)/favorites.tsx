import { FlatList, StyleSheet, Text, TouchableOpacity, View } from 'react-native'
import { useRouter } from 'expo-router'
import { ArrowLeft, Heart } from 'lucide-react-native'

import { PropertyListCard } from '@/components/properties/PropertyListCard'
import { AppScreen, PrimaryButton } from '@/components/ui'
import { usePropertyDomain } from '@/contexts/auth/use-property-domain'
import { useAppTheme } from '@/lib/hooks/useAppTheme'
import { borderRadius, spacing, typography } from '@/lib/theme'

export default function FavoritesStandaloneScreen() {
  const { favorites, availableProperties, toggleFavorite, userProperties } = usePropertyDomain()
  const router = useRouter()
  const { theme } = useAppTheme()
  const styles = createStyles(theme)

  const allProperties = [...availableProperties, ...userProperties]
  const favoriteProperties = allProperties.filter(property => favorites.includes(property.id))

  return (
    <AppScreen>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <ArrowLeft size={24} color={theme.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Favoritos</Text>
        <View style={styles.placeholder} />
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
            <Text style={styles.emptyStateText}>Guarda las propiedades que te interesen para verlas después</Text>
            <PrimaryButton onPress={() => router.replace('/catalog')} style={styles.exploreButton}>
              Explorar Catalogo
            </PrimaryButton>
          </View>
        }
      />
    </AppScreen>
  )
}

const createStyles = (theme: ReturnType<typeof useAppTheme>['theme']) =>
  StyleSheet.create({
    header: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingHorizontal: spacing.md,
      paddingVertical: spacing.xxl,
      borderBottomWidth: 1,
      borderBottomColor: theme.border,
    },
    backButton: {
      width: 40,
      height: 40,
      borderRadius: borderRadius.full,
      backgroundColor: theme.surface,
      justifyContent: 'center',
      alignItems: 'center',
    },
    headerTitle: {
      fontSize: typography.h3.fontSize,
      fontWeight: '700',
      color: theme.text,
    },
    placeholder: {
      width: 40,
    },
    listContent: {
      padding: spacing.md,
      flexGrow: 1,
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
      color: theme.text,
      marginTop: spacing.md,
    },
    emptyStateText: {
      fontSize: typography.bodySmall.fontSize,
      color: theme.textSecondary,
      textAlign: 'center',
      marginTop: spacing.sm,
    },
    exploreButton: {
      marginTop: spacing.lg,
    },
  })
