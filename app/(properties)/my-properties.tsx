import { useMemo } from 'react'
import { FlatList, StyleSheet, Text, TouchableOpacity, View } from 'react-native'
import { useRouter } from 'expo-router'
import { ArrowLeft, Building2, ChevronRight, Home, Map, MapPin, Plus } from 'lucide-react-native'

import { AppScreen, PrimaryButton, StatusBadge } from '@/components/ui'
import { useSessionDomain } from '@/contexts/auth/use-session-domain'
import { useAppTheme } from '@/lib/hooks/useAppTheme'
import { getPortfolioPropertiesByOwner } from '@/lib/services/property-portfolio'
import { borderRadius, spacing, typography } from '@/lib/theme'
import type { Property } from '@/lib/types'
import { formatCurrency } from '@/lib/utils'

export default function MyPropertiesScreen() {
  const { currentUser } = useSessionDomain()
  const router = useRouter()
  const { theme } = useAppTheme()
  const styles = createStyles(theme)

  const myProperties = useMemo(() => {
    return getPortfolioPropertiesByOwner(currentUser?.id)
  }, [currentUser])

  const getStatusLabel = (status: Property['status']) => {
    switch (status) {
      case 'owned':
        return 'Propio'
      case 'for_sale':
        return 'En Venta'
      case 'for_rent':
        return 'En Renta'
      case 'rented':
        return 'Rentado'
      default:
        return status
    }
  }

  const getStatusTone = (status: Property['status']) => {
    switch (status) {
      case 'rented':
        return 'success' as const
      case 'for_rent':
        return 'warning' as const
      case 'for_sale':
        return 'accent' as const
      default:
        return 'neutral' as const
    }
  }

  const getPropertyIcon = (type: Property['type']) => {
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

  return (
    <AppScreen>
      <View style={styles.header}>
        <TouchableOpacity style={styles.headerButton} onPress={() => router.back()}>
          <ArrowLeft size={24} color={theme.text} />
        </TouchableOpacity>

        <Text style={styles.headerTitle}>Mis Propiedades</Text>

        <TouchableOpacity style={styles.headerButton} onPress={() => router.push('/add-property')}>
          <Plus size={24} color={theme.accent} />
        </TouchableOpacity>
      </View>

      <View style={styles.counterContainer}>
        <Text style={styles.counterText}>
          {myProperties.length} {myProperties.length === 1 ? 'propiedad' : 'propiedades'} en tu portafolio
        </Text>
      </View>

      <FlatList
        data={myProperties}
        renderItem={({ item }) => {
          const Icon = getPropertyIcon(item.type)

          return (
            <TouchableOpacity
              style={styles.propertyCard}
              onPress={() => router.push(`/property-detail?id=${item.id}`)}
              activeOpacity={0.7}
            >
              <View style={styles.propertyIconContainer}>
                <Icon size={32} color={theme.accent} />
              </View>

              <View style={styles.propertyContent}>
                <View style={styles.propertyHeader}>
                  <Text style={styles.propertyTitle} numberOfLines={1}>
                    {item.title}
                  </Text>
                  <StatusBadge label={getStatusLabel(item.status)} tone={getStatusTone(item.status)} />
                </View>

                <View style={styles.locationRow}>
                  <MapPin size={14} color={theme.textMuted} />
                  <Text style={styles.propertyAddress} numberOfLines={1}>
                    {item.address}, {item.city}
                  </Text>
                </View>

                <View style={styles.propertyFooter}>
                  <Text style={styles.propertyValue}>{formatCurrency(item.currentValue || item.price)}</Text>
                  <ChevronRight size={20} color={theme.textMuted} />
                </View>
              </View>
            </TouchableOpacity>
          )
        }}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Building2 size={48} color={theme.textMuted} />
            <Text style={styles.emptyStateTitle}>Sin propiedades</Text>
            <Text style={styles.emptyStateText}>
              Agrega tu primera propiedad para comenzar a monitorear tu portafolio
            </Text>
            <PrimaryButton onPress={() => router.push('/add-property')} style={styles.emptyStateButton}>
              Agregar propiedad
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
      paddingVertical: spacing.md,
      borderBottomWidth: 1,
      borderBottomColor: theme.border,
    },
    headerButton: {
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
    counterContainer: {
      paddingHorizontal: spacing.lg,
      paddingVertical: spacing.md,
    },
    counterText: {
      fontSize: typography.bodySmall.fontSize,
      color: theme.textSecondary,
    },
    listContent: {
      padding: spacing.md,
      gap: spacing.md,
    },
    propertyCard: {
      flexDirection: 'row',
      backgroundColor: theme.surface,
      borderRadius: borderRadius.lg,
      padding: spacing.md,
      borderWidth: 1,
      borderColor: theme.border,
    },
    propertyIconContainer: {
      width: 60,
      height: 60,
      borderRadius: borderRadius.lg,
      backgroundColor: `${theme.accent}15`,
      justifyContent: 'center',
      alignItems: 'center',
      marginRight: spacing.md,
    },
    propertyContent: {
      flex: 1,
    },
    propertyHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      gap: spacing.sm,
    },
    propertyTitle: {
      fontSize: typography.body.fontSize,
      fontWeight: '600',
      color: theme.text,
      flex: 1,
    },
    locationRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing.xs,
      marginTop: spacing.xs,
    },
    propertyAddress: {
      fontSize: typography.bodySmall.fontSize,
      color: theme.textSecondary,
      flex: 1,
    },
    propertyFooter: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      marginTop: spacing.md,
    },
    propertyValue: {
      fontSize: typography.body.fontSize,
      fontWeight: '700',
      color: theme.accent,
    },
    emptyState: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      paddingVertical: spacing.xxl * 2,
    },
    emptyStateTitle: {
      fontSize: typography.h4.fontSize,
      fontWeight: '600',
      color: theme.text,
      marginTop: spacing.md,
    },
    emptyStateText: {
      fontSize: typography.body.fontSize,
      color: theme.textMuted,
      marginTop: spacing.xs,
      textAlign: 'center',
      paddingHorizontal: spacing.xl,
    },
    emptyStateButton: {
      marginTop: spacing.lg,
    },
  })
