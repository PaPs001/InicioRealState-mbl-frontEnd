import { useState, useMemo } from 'react'
import { 
  View, 
  Text, 
  StyleSheet, 
  FlatList, 
  TouchableOpacity, 
  TextInput,
  Modal 
} from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useAuth } from '@/contexts/AuthContext'
import { colors, spacing, typography, borderRadius } from '@/lib/theme'
import { formatShortDate } from '@/lib/mock-data'
import type { PropertyLead } from '@/lib/types'
import { 
  Search, 
  Filter, 
  Phone, 
  Mail, 
  MessageCircle,
  User,
  ChevronDown,
  X
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
  const { userLeads, getPropertyById, isAdmin } = useAuth()
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

  const renderLead = ({ item: lead }: { item: PropertyLead }) => {
    const property = getPropertyById(lead.propertyId)
    const status = statusLabels[lead.status] || statusLabels.nuevo

    return (
      <View style={styles.leadCard}>
        <View style={styles.leadHeader}>
          <View style={styles.avatarContainer}>
            <Text style={styles.avatarText}>
              {lead.name.split(' ').map(n => n[0]).join('').slice(0, 2)}
            </Text>
          </View>
          <View style={styles.leadInfo}>
            <Text style={styles.leadName}>{lead.name}</Text>
            <Text style={styles.leadProperty} numberOfLines={1}>
              {property?.title || 'Sin propiedad'}
            </Text>
          </View>
          <View style={[styles.statusBadge, { backgroundColor: status.color + '20' }]}>
            <Text style={[styles.statusText, { color: status.color }]}>{status.label}</Text>
          </View>
        </View>

        <View style={styles.leadDetails}>
          <View style={styles.detailRow}>
            <Phone size={14} color={colors.textMuted} />
            <Text style={styles.detailText}>{lead.phone}</Text>
          </View>
          {lead.email && (
            <View style={styles.detailRow}>
              <Mail size={14} color={colors.textMuted} />
              <Text style={styles.detailText}>{lead.email}</Text>
            </View>
          )}
          <View style={styles.detailRow}>
            <MessageCircle size={14} color={colors.textMuted} />
            <Text style={styles.detailText}>Fuente: {lead.source}</Text>
          </View>
        </View>

        <View style={styles.leadFooter}>
          <Text style={styles.dateText}>
            Creado: {formatShortDate(lead.createdDate)}
          </Text>
          <View style={styles.actionButtons}>
            <TouchableOpacity style={styles.actionButton}>
              <Phone size={16} color={colors.accent} />
            </TouchableOpacity>
            <TouchableOpacity style={styles.actionButton}>
              <MessageCircle size={16} color={colors.accent} />
            </TouchableOpacity>
          </View>
        </View>
      </View>
    )
  }

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      {/* Barra de busqueda */}
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

      {/* Filtro activo */}
      {statusFilter !== 'todos' && (
        <View style={styles.activeFilter}>
          <Text style={styles.activeFilterText}>
            Filtro: {statusLabels[statusFilter]?.label}
          </Text>
          <TouchableOpacity onPress={() => setStatusFilter('todos')}>
            <X size={16} color={colors.textLight} />
          </TouchableOpacity>
        </View>
      )}

      {/* Lista de leads */}
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

      {/* Modal de filtros */}
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
    marginBottom: spacing.md,
  },
  avatarContainer: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.primaryDark,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    fontSize: typography.body.fontSize,
    fontWeight: '600',
    color: colors.accent,
  },
  leadInfo: {
    flex: 1,
    marginLeft: spacing.md,
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
  statusBadge: {
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.sm,
    borderRadius: borderRadius.full,
  },
  statusText: {
    fontSize: typography.caption.fontSize,
    fontWeight: '600',
  },
  leadDetails: {
    gap: spacing.sm,
    paddingBottom: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderDark,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  detailText: {
    fontSize: typography.bodySmall.fontSize,
    color: colors.textMuted,
  },
  leadFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: spacing.md,
  },
  dateText: {
    fontSize: typography.caption.fontSize,
    color: colors.textMuted,
  },
  actionButtons: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  actionButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.primaryDark,
    justifyContent: 'center',
    alignItems: 'center',
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
