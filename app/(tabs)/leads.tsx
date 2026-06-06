import { useMemo, useState } from 'react'
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
import { LeadCard } from '@/components/leads/LeadCard'
import { NewLeadModal } from '@/components/leads/NewLeadModal'
import { LeadStatusFilterModal } from '@/components/leads/LeadStatusFilterModal'
import { useActivityDomain } from '@/contexts/auth/use-activity-domain'
import { usePropertyDomain } from '@/contexts/auth/use-property-domain'
import { useSessionDomain } from '@/contexts/auth/use-session-domain'
import { colors, spacing, typography, borderRadius } from '@/lib/theme'
import {
  buildLead,
  filterLeads,
  getLeadAgentOptions,
  getLeadCollection,
  getLeadPropertyOptions,
  getLeadStatusMeta,
  getScopedLeads,
  initialLeadForm,
  leadStatusLabels,
  summarizeLeads,
  type LeadScope,
  type NewLeadForm,
} from '@/lib/services/leads-domain'
import type { PropertyLead } from '@/lib/types'
import {
  ArrowLeft,
  Search,
  Filter,
  Phone,
  MessageCircle,
  User,
  X,
  Plus,
} from 'lucide-react-native'

export default function LeadsScreen() {
  const router = useRouter()
  const { userLeads } = useActivityDomain()
  const { availableProperties, getPropertyById, userProperties } = usePropertyDomain()
  const { currentUser, isAdmin } = useSessionDomain()
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState('todos')
  const [showFilterModal, setShowFilterModal] = useState(false)
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [leadScope, setLeadScope] = useState<LeadScope>('mine')
  const [newLead, setNewLead] = useState<NewLeadForm>({
    ...initialLeadForm,
    agentId: currentUser?.id ?? '',
  })
  const [refreshKey, setRefreshKey] = useState(0)

  const agentOptions = useMemo(() => {
    return getLeadAgentOptions()
  }, [refreshKey])

  const propertyOptions = useMemo(() => {
    return getLeadPropertyOptions([...availableProperties, ...userProperties])
  }, [availableProperties, userProperties])

  const allLeads = useMemo(() => {
    return getLeadCollection({ isAdmin, userLeads })
  }, [isAdmin, refreshKey, userLeads])

  const scopedLeads = useMemo(() => {
    return getScopedLeads({
      allLeads,
      currentUserId: currentUser?.id,
      isAdmin,
      leadScope,
    })
  }, [allLeads, currentUser?.id, isAdmin, leadScope])

  const filteredLeads = useMemo(() => {
    return filterLeads({
      leads: scopedLeads,
      searchQuery,
      statusFilter,
      getPropertyById,
    })
  }, [scopedLeads, getPropertyById, searchQuery, statusFilter])

  const summary = useMemo(() => {
    return summarizeLeads(filteredLeads)
  }, [filteredLeads])

  const handleCall = (phone: string) => {
    Linking.openURL(`tel:${phone}`)
  }

  const handleMessage = (phone: string) => {
    const sanitizedPhone = phone.replace(/[^\d+]/g, '').replace('+', '')
    Linking.openURL(`https://wa.me/${sanitizedPhone}`)
  }

  const resetNewLead = () => {
    setNewLead({
      ...initialLeadForm,
      agentId: currentUser?.id ?? agentOptions[0]?.id ?? '',
    })
  }

  const createLead = () => {
    if (!newLead.name.trim() || !newLead.phone.trim() || !newLead.source.trim() || !newLead.propertyId) {
      return
    }

    buildLead({
      form: newLead,
      currentUser,
      isAdmin,
    })
    setRefreshKey(prev => prev + 1)
    resetNewLead()
    setShowCreateModal(false)
  }

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.replace('/(tabs)')}>
          <ArrowLeft size={18} color={colors.accent} />
          <Text style={styles.backButtonText}>Volver</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Leads</Text>
        <TouchableOpacity style={styles.addButton} onPress={() => setShowCreateModal(true)}>
          <Plus size={18} color={colors.primaryDark} />
        </TouchableOpacity>
      </View>

      {isAdmin && (
        <View style={styles.scopeTabs}>
          <TouchableOpacity
            style={[styles.scopeTab, leadScope === 'mine' && styles.scopeTabActive]}
            onPress={() => setLeadScope('mine')}
          >
            <Text style={[styles.scopeTabText, leadScope === 'mine' && styles.scopeTabTextActive]}>
              Mis leads
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.scopeTab, leadScope === 'team' && styles.scopeTabActive]}
            onPress={() => setLeadScope('team')}
          >
            <Text style={[styles.scopeTabText, leadScope === 'team' && styles.scopeTabTextActive]}>
              Leads del equipo
            </Text>
          </TouchableOpacity>
        </View>
      )}

      <View style={styles.statsRow}>
        <View style={styles.statCard}>
          <Text style={styles.statValue}>{summary.total}</Text>
          <Text style={styles.statLabel}>Totales</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statValue}>{summary.pending}</Text>
          <Text style={styles.statLabel}>Activos</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statValue}>{summary.sale}</Text>
          <Text style={styles.statLabel}>Compra</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statValue}>{summary.rent}</Text>
          <Text style={styles.statLabel}>Renta</Text>
        </View>
      </View>

      <View style={styles.searchContainer}>
        <View style={styles.searchInputContainer}>
          <Search size={20} color={colors.textMuted} />
          <TextInput
            style={styles.searchInput}
            placeholder="Buscar por nombre, fuente o propiedad"
            placeholderTextColor={colors.textMuted}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>
        <TouchableOpacity style={styles.filterButton} onPress={() => setShowFilterModal(true)}>
          <Filter size={20} color={colors.accent} />
        </TouchableOpacity>
      </View>

      {statusFilter !== 'todos' && (
        <View style={styles.activeFilter}>
          <Text style={styles.activeFilterText}>Filtro: {getLeadStatusMeta(statusFilter).label}</Text>
          <TouchableOpacity onPress={() => setStatusFilter('todos')}>
            <X size={16} color={colors.primaryDark} />
          </TouchableOpacity>
        </View>
      )}

      <FlatList
        data={filteredLeads}
        renderItem={({ item }) => (
          <LeadCard
            lead={item}
            isAdmin={isAdmin}
            property={getPropertyById(item.propertyId)}
            onCall={handleCall}
            onMessage={handleMessage}
            onPress={() => router.push(`/lead-information/${item.id}`)}
            styles={styles}
          />
        )}
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

      <LeadStatusFilterModal
        visible={showFilterModal}
        onClose={() => setShowFilterModal(false)}
        onSelectStatus={setStatusFilter}
        statusFilter={statusFilter}
        styles={styles}
      />

      <NewLeadModal
        visible={showCreateModal}
        onClose={() => {
          setShowCreateModal(false)
          resetNewLead()
        }}
        onSubmit={createLead}
        newLead={newLead}
        onChange={(updater) => setNewLead((current) => updater(current))}
        propertyOptions={propertyOptions}
        agentOptions={agentOptions}
        isAdmin={isAdmin}
        styles={styles}
      />
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
  addButton: {
    width: 42,
    height: 42,
    borderRadius: borderRadius.full,
    backgroundColor: colors.accent,
    alignItems: 'center',
    justifyContent: 'center',
  },
  scopeTabs: {
    flexDirection: 'row',
    gap: spacing.sm,
    paddingHorizontal: spacing.md,
    paddingTop: spacing.md,
  },
  scopeTab: {
    flex: 1,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.full,
    backgroundColor: colors.surfaceDark,
    borderWidth: 1,
    borderColor: colors.borderDark,
    alignItems: 'center',
  },
  scopeTabActive: {
    backgroundColor: colors.accent,
    borderColor: colors.accent,
  },
  scopeTabText: {
    fontSize: typography.bodySmall.fontSize,
    color: colors.textMuted,
    fontWeight: '600',
  },
  scopeTabTextActive: {
    color: colors.primaryDark,
  },
  statsRow: {
    flexDirection: 'row',
    gap: spacing.sm,
    paddingHorizontal: spacing.md,
    paddingTop: spacing.md,
  },
  statCard: {
    flex: 1,
    backgroundColor: colors.surfaceDark,
    borderRadius: borderRadius.lg,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.sm,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.borderDark,
  },
  statValue: {
    color: colors.textLight,
    fontSize: typography.h4.fontSize,
    fontWeight: '700',
  },
  statLabel: {
    color: colors.textMuted,
    fontSize: typography.caption.fontSize,
    marginTop: 2,
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
    paddingBottom: spacing.xxl,
  },
  leadCard: {
    backgroundColor: colors.surfaceDark,
    borderRadius: borderRadius.xl,
    padding: spacing.md,
    marginBottom: spacing.md,
    borderWidth: 1,
    borderColor: colors.borderDark,
  },
  leadCardTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  statusPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    paddingVertical: 6,
    paddingHorizontal: spacing.sm,
    borderRadius: borderRadius.full,
  },
  statusPillText: {
    fontSize: typography.caption.fontSize,
    fontWeight: '700',
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  intentPill: {
    paddingVertical: 6,
    paddingHorizontal: spacing.sm,
    borderRadius: borderRadius.full,
    backgroundColor: colors.primaryDark,
    borderWidth: 1,
    borderColor: colors.borderDark,
  },
  intentPillText: {
    color: colors.textLight,
    fontSize: typography.caption.fontSize,
    fontWeight: '600',
  },
  leadMainRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  leadAvatar: {
    width: 46,
    height: 46,
    borderRadius: 23,
    backgroundColor: colors.primaryDark,
    borderWidth: 1,
    borderColor: colors.borderDark,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.md,
  },
  leadBody: {
    flex: 1,
    paddingRight: spacing.sm,
  },
  leadName: {
    fontSize: typography.body.fontSize,
    fontWeight: '700',
    color: colors.textLight,
  },
  leadMeta: {
    fontSize: typography.bodySmall.fontSize,
    color: colors.accent,
    marginTop: 2,
  },
  leadProperty: {
    fontSize: typography.bodySmall.fontSize,
    color: colors.textMuted,
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
  leadFooter: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
    marginTop: spacing.md,
  },
  infoChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    paddingVertical: 6,
    paddingHorizontal: spacing.sm,
    borderRadius: borderRadius.full,
    backgroundColor: colors.primaryDark,
    borderWidth: 1,
    borderColor: colors.borderDark,
  },
  infoChipText: {
    fontSize: typography.caption.fontSize,
    color: colors.textSecondary,
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
    backgroundColor: 'rgba(0,0,0,0.72)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: colors.surfaceDark,
    borderTopLeftRadius: borderRadius.xl,
    borderTopRightRadius: borderRadius.xl,
    padding: spacing.lg,
    paddingBottom: spacing.xxl,
  },
  createModalContent: {
    maxHeight: '88%',
    backgroundColor: colors.surfaceDark,
    borderTopLeftRadius: borderRadius.xl,
    borderTopRightRadius: borderRadius.xl,
    padding: spacing.lg,
    paddingBottom: spacing.xl,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  modalTitle: {
    fontSize: typography.h4.fontSize,
    fontWeight: '700',
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
  inputLabel: {
    color: colors.textLight,
    fontSize: typography.bodySmall.fontSize,
    fontWeight: '600',
    marginBottom: spacing.xs,
    marginTop: spacing.sm,
  },
  textField: {
    backgroundColor: colors.primaryDark,
    borderWidth: 1,
    borderColor: colors.borderDark,
    borderRadius: borderRadius.lg,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    color: colors.textLight,
    fontSize: typography.body.fontSize,
  },
  chipsWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
    marginBottom: spacing.sm,
  },
  choiceChip: {
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    borderRadius: borderRadius.full,
    backgroundColor: colors.primaryDark,
    borderWidth: 1,
    borderColor: colors.borderDark,
  },
  choiceChipActive: {
    backgroundColor: colors.accent,
    borderColor: colors.accent,
  },
  choiceChipText: {
    color: colors.textMuted,
    fontSize: typography.bodySmall.fontSize,
    fontWeight: '600',
  },
  choiceChipTextActive: {
    color: colors.primaryDark,
  },
  segmentedRow: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginBottom: spacing.sm,
  },
  segmentedButton: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.lg,
    backgroundColor: colors.primaryDark,
    borderWidth: 1,
    borderColor: colors.borderDark,
  },
  segmentedButtonActive: {
    backgroundColor: colors.accent,
    borderColor: colors.accent,
  },
  segmentedButtonText: {
    color: colors.textMuted,
    fontSize: typography.bodySmall.fontSize,
    fontWeight: '600',
  },
  segmentedButtonTextActive: {
    color: colors.primaryDark,
  },
  primaryButton: {
    marginTop: spacing.lg,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    paddingVertical: spacing.md,
    borderRadius: borderRadius.lg,
    backgroundColor: colors.accent,
  },
  primaryButtonText: {
    color: colors.primaryDark,
    fontSize: typography.body.fontSize,
    fontWeight: '700',
  },
})
