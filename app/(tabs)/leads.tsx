import { useState, useMemo } from 'react'
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  TextInput,
  Modal,
  Linking,
} from 'react-native'
import { useRouter } from 'expo-router'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useAuth } from '@/contexts/AuthContext'
import { colors, spacing, typography, borderRadius } from '@/lib/theme'
import type { PropertyLead } from '@/lib/types'
import {
  ArrowLeft,
  Search,
  Filter,
  Phone,
  MessageCircle,
  User,
  X,
} from 'lucide-react-native'

const statusLabels: Record<string, { label: string; color: string }> = {
  nuevo: { label: 'Nuevo', color: '#22c55e' },
  contactado: { label: 'Contactado', color: '#3b82f6' },
  cita_agendada: { label: 'Cita Agendada', color: '#a855f7' },
  visitado: { label: 'Visitado', color: '#f59e0b' },
  negociando: { label: 'Negociando', color: '#ec4899' },
  cerrado: { label: 'Cerrado', color: '#10b981' },
  descartado: { label: 'Descartado', color: '#6b7280' },
}

export default function LeadsScreen() {
  const router = useRouter()
  const { userLeads, getPropertyById } = useAuth()
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState('todos')
  const [showFilterModal, setShowFilterModal] = useState(false)

  const filteredLeads = useMemo(() => {
    return userLeads.filter(lead => {
      const matchesSearch = lead.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        lead.phone.includes(searchQuery)
      const matchesStatus = statusFilter === 'todos' || lead.status === statusFilter
      return matchesSearch && matchesStatus
    })
  }, [userLeads, searchQuery, statusFilter])

  const getPropertyTypeLabel = (type?: string) => {
    switch (type) {
      case 'house':
        return 'Casa'
      case 'apartment':
        return 'Departamento'
      case 'land':
        return 'Terreno'
      default:
        return 'Sin categoria'
    }
  }

  const handleCall = (phone: string) => {
    Linking.openURL(`tel:${phone}`)
  }

  const handleMessage = (phone: string) => {
    const sanitizedPhone = phone.replace(/[^\d+]/g, '').replace('+', '')
    Linking.openURL(`https://wa.me/${sanitizedPhone}`)
  }

  const renderLead = ({ item: lead }: { item: PropertyLead }) => {
    const property = getPropertyById(lead.propertyId)

    return (
      <TouchableOpacity
        style={styles.leadCard}
        activeOpacity={0.8}
        onPress={() => router.push(`/lead-information/${lead.id}`)}
      >
        <View style={styles.leadHeader}>
          <View style={styles.leadInfo}>
            <Text style={styles.leadName}>{lead.name}</Text>
            <Text style={styles.leadProperty} numberOfLines={1}>
              {property?.title || 'Sin propiedad'}
            </Text>
            <Text style={styles.leadCategory}>
              {getPropertyTypeLabel(property?.type)}
            </Text>
          </View>
          <View style={styles.actionButtons}>
            <TouchableOpacity style={styles.actionButton} onPress={() => handleCall(lead.phone)}>
              <Phone size={16} color={colors.accent} />
            </TouchableOpacity>
            <TouchableOpacity style={styles.actionButton} onPress={() => handleMessage(lead.phone)}>
              <MessageCircle size={16} color={colors.accent} />
            </TouchableOpacity>
          </View>
        </View>
      </TouchableOpacity>
    )
  }

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.replace('/(tabs)')}>
          <ArrowLeft size={18} color={colors.accent} />
          <Text style={styles.backButtonText}>Volver</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Leads</Text>
        <View style={styles.headerSpacer} />
      </View>

      <View style={styles.searchContainer}>
        <View style={styles.searchInputContainer}>
          <Search size={20} color={colors.textMuted} />
          <TextInput
            style={styles.searchInput}
            placeholder="Buscar leads..."
            placeholderTextColor={colors.textMuted}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>
        <TouchableOpacity
          style={styles.filterButton}
          onPress={() => setShowFilterModal(true)}
        >
          <Filter size={20} color={colors.accent} />
        </TouchableOpacity>
      </View>

      {statusFilter !== 'todos' && (
        <View style={styles.activeFilter}>
          <Text style={styles.activeFilterText}>
            Filtro: {statusLabels[statusFilter]?.label}
          </Text>
          <TouchableOpacity onPress={() => setStatusFilter('todos')}>
            <X size={16} color={colors.primaryDark} />
          </TouchableOpacity>
        </View>
      )}

      <FlatList
        data={filteredLeads}
        renderItem={renderLead}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <User size={48} color={colors.borderDark} />
            <Text style={styles.emptyStateText}>No se encontraron leads</Text>
          </View>
        }
      />

      <Modal
        visible={showFilterModal}
        animationType="slide"
        transparent
        onRequestClose={() => setShowFilterModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Filtrar por Estado</Text>
              <TouchableOpacity onPress={() => setShowFilterModal(false)}>
                <X size={24} color={colors.textLight} />
              </TouchableOpacity>
            </View>

            <TouchableOpacity
              style={[styles.filterOption, statusFilter === 'todos' && styles.filterOptionActive]}
              onPress={() => {
                setStatusFilter('todos')
                setShowFilterModal(false)
              }}
            >
              <Text style={styles.filterOptionText}>Todos</Text>
            </TouchableOpacity>

            {Object.entries(statusLabels).map(([key, value]) => (
              <TouchableOpacity
                key={key}
                style={[styles.filterOption, statusFilter === key && styles.filterOptionActive]}
                onPress={() => {
                  setStatusFilter(key)
                  setShowFilterModal(false)
                }}
              >
                <View style={[styles.statusDot, { backgroundColor: value.color }]} />
                <Text style={styles.filterOptionText}>{value.label}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.primaryDark,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    paddingTop: spacing.md,
    paddingBottom: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderDark,
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.full,
    backgroundColor: colors.surfaceDark,
    borderWidth: 1,
    borderColor: colors.borderDark,
  },
  backButtonText: {
    fontSize: typography.bodySmall.fontSize,
    fontWeight: '600',
    color: colors.textLight,
  },
  headerTitle: {
    flex: 1,
    textAlign: 'center',
    fontSize: typography.h3.fontSize,
    fontWeight: '700',
    color: colors.textLight,
  },
  headerSpacer: {
    width: 104,
  },
  searchContainer: {
    flexDirection: 'row',
    paddingHorizontal: spacing.md,
    paddingTop: spacing.lg,
    paddingBottom: spacing.sm,
    gap: spacing.sm,
  },
  searchInputContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surfaceDark,
    borderRadius: borderRadius.lg,
    paddingHorizontal: spacing.md,
    borderWidth: 1,
    borderColor: colors.borderDark,
  },
  searchInput: {
    flex: 1,
    paddingVertical: spacing.sm,
    paddingLeft: spacing.sm,
    fontSize: typography.body.fontSize,
    color: colors.textLight,
  },
  filterButton: {
    width: 48,
    height: 48,
    borderRadius: borderRadius.lg,
    backgroundColor: colors.surfaceDark,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.borderDark,
  },
  activeFilter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.accent,
    marginHorizontal: spacing.md,
    marginBottom: spacing.sm,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    borderRadius: borderRadius.md,
  },
  activeFilterText: {
    fontSize: typography.bodySmall.fontSize,
    fontWeight: '600',
    color: colors.primaryDark,
  },
  listContent: {
    padding: spacing.md,
  },
  leadCard: {
    backgroundColor: colors.surfaceDark,
    borderRadius: borderRadius.xl,
    padding: spacing.md,
    marginBottom: spacing.md,
    borderWidth: 1,
    borderColor: colors.borderDark,
  },
  leadHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  leadInfo: {
    flex: 1,
    paddingRight: spacing.md,
  },
  leadName: {
    fontSize: typography.body.fontSize,
    fontWeight: '600',
    color: colors.textLight,
  },
  leadProperty: {
    fontSize: typography.bodySmall.fontSize,
    color: colors.textMuted,
    marginTop: 2,
  },
  leadCategory: {
    fontSize: typography.caption.fontSize,
    color: colors.accent,
    fontWeight: '600',
    marginTop: spacing.xs,
  },
  actionButtons: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  actionButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.primaryDark,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.borderDark,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: spacing.xxl,
  },
  emptyStateText: {
    fontSize: typography.body.fontSize,
    color: colors.textMuted,
    marginTop: spacing.md,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.7)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: colors.surfaceDark,
    borderTopLeftRadius: borderRadius.xl,
    borderTopRightRadius: borderRadius.xl,
    padding: spacing.lg,
    paddingBottom: spacing.xxl,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  modalTitle: {
    fontSize: typography.h4.fontSize,
    fontWeight: '600',
    color: colors.textLight,
  },
  filterOption: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.md,
    borderRadius: borderRadius.lg,
    marginBottom: spacing.xs,
  },
  filterOptionActive: {
    backgroundColor: colors.primaryDark,
  },
  filterOptionText: {
    fontSize: typography.body.fontSize,
    color: colors.textLight,
  },
  statusDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
})
