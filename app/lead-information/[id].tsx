import { useEffect, useMemo, useRef, useState } from 'react'
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Modal,
  Pressable,
  Animated,
  PanResponder,
  TextInput,
} from 'react-native'
import { useLocalSearchParams, useRouter } from 'expo-router'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useActivityDomain } from '@/contexts/auth/use-activity-domain'
import { usePropertyDomain } from '@/contexts/auth/use-property-domain'
import { useSessionDomain } from '@/contexts/auth/use-session-domain'
import {
  appendLeadFollowUp,
  createLeadFollowUp,
  findLeadById,
  getAssignedAgentById,
  getLeadPropertyTypeLabel,
  leadContactTypeLabels,
} from '@/lib/services/leads-domain'
import { colors, spacing, typography, borderRadius } from '@/lib/theme'
import type { LeadFollowUp } from '@/lib/types'
import { formatDate } from '@/lib/utils'
import {
  ArrowLeft,
  CalendarDays,
  CircleUserRound,
  FileText,
  Phone,
  MessageCircle,
  Mail,
  Handshake,
  MapPinned,
  ChevronUp,
  X,
} from 'lucide-react-native'

type LeadInfoTab = 'general' | 'followups'

const FOLLOW_UP_TYPE_LABELS: Record<LeadFollowUp['type'], string> = {
  call: 'Llamada',
  whatsapp: 'WhatsApp',
  email: 'Email',
  visit: 'Visita',
  meeting: 'Reunion',
}

const FOLLOW_UP_TYPE_ICONS: Record<LeadFollowUp['type'], typeof Phone> = {
  call: Phone,
  whatsapp: MessageCircle,
  email: Mail,
  visit: MapPinned,
  meeting: Handshake,
}

export default function LeadInformationScreen() {
  const { id } = useLocalSearchParams<{ id: string }>()
  const router = useRouter()
  const { userLeads } = useActivityDomain()
  const { getPropertyById } = usePropertyDomain()
  const { isAgent, isAdmin } = useSessionDomain()
  const [activeTab, setActiveTab] = useState<LeadInfoTab>('general')
  const [selectedFollowUp, setSelectedFollowUp] = useState<LeadFollowUp | null>(null)
  const [sheetExpanded, setSheetExpanded] = useState(false)
  const [showCreateFollowUpModal, setShowCreateFollowUpModal] = useState(false)
  const [newFollowUpType, setNewFollowUpType] = useState<LeadFollowUp['type']>('call')
  const [newFollowUpNotes, setNewFollowUpNotes] = useState('')
  const translateY = useRef(new Animated.Value(0)).current

  const lead = useMemo(() => {
    return findLeadById({ id: id ?? '', isAdmin, userLeads })
  }, [id, isAdmin, userLeads])

  const [localFollowUps, setLocalFollowUps] = useState<LeadFollowUp[]>([])

  const property = useMemo(() => {
    return lead ? getPropertyById(lead.propertyId) : undefined
  }, [getPropertyById, lead])

  const assignedAgent = useMemo(() => {
    return getAssignedAgentById(lead?.agentId)
  }, [lead?.agentId])

  useEffect(() => {
    if (lead) {
      setLocalFollowUps(lead.followUps || [])
    }
  }, [lead])

  const panResponder = useRef(
    PanResponder.create({
      onMoveShouldSetPanResponder: (_, gestureState) => Math.abs(gestureState.dy) > 8,
      onPanResponderMove: (_, gestureState) => {
        if (gestureState.dy < 0) {
          translateY.setValue(Math.max(gestureState.dy, -160))
        } else {
          translateY.setValue(Math.min(gestureState.dy, 80))
        }
      },
      onPanResponderRelease: (_, gestureState) => {
        const shouldExpand = gestureState.dy < -40
        const shouldCollapse = gestureState.dy > 40

        if (shouldExpand) {
          setSheetExpanded(true)
        } else if (shouldCollapse) {
          setSheetExpanded(false)
        }

        Animated.spring(translateY, {
          toValue: 0,
          useNativeDriver: true,
          bounciness: 6,
        }).start()
      },
    })
  ).current

  const openFollowUpSheet = (followUp: LeadFollowUp) => {
    setSelectedFollowUp(followUp)
    setSheetExpanded(false)
    translateY.setValue(0)
  }

  const closeFollowUpSheet = () => {
    setSelectedFollowUp(null)
    setSheetExpanded(false)
    translateY.setValue(0)
  }

  const closeCreateFollowUpModal = () => {
    setShowCreateFollowUpModal(false)
    setNewFollowUpType('call')
    setNewFollowUpNotes('')
  }

  const handleCreateFollowUp = () => {
    if (!newFollowUpNotes.trim()) {
      return
    }

    const followUp = createLeadFollowUp({
      leadId: lead?.id || 'lead',
      type: newFollowUpType,
      notes: newFollowUpNotes,
    })

    const nextFollowUps = appendLeadFollowUp({
      leadId: lead?.id || 'lead',
      followUp,
      isAdmin,
      userLeads,
    })

    setLocalFollowUps(nextFollowUps)
    setActiveTab('followups')
    closeCreateFollowUpModal()
  }

  if (!lead) {
    return (
      <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
        <View style={styles.notFound}>
          <Text style={styles.notFoundText}>Lead no encontrado</Text>
        </View>
      </SafeAreaView>
    )
  }

  const followUps = localFollowUps
  const sheetHeightStyle = sheetExpanded ? styles.sheetExpanded : styles.sheetDefault

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <ArrowLeft size={18} color={colors.accent} />
          <Text style={styles.backButtonText}>Volver</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Informacion</Text>
        {(isAgent || isAdmin) ? (
          <TouchableOpacity style={styles.headerActionButton} onPress={() => setShowCreateFollowUpModal(true)}>
            <Text style={styles.headerActionButtonText}>Nuevo</Text>
          </TouchableOpacity>
        ) : (
          <View style={styles.headerSpacer} />
        )}
      </View>

      <View style={styles.tabsContainer}>
        <TouchableOpacity
          style={[styles.tabButton, activeTab === 'general' && styles.tabButtonActive]}
          onPress={() => setActiveTab('general')}
        >
          <Text style={[styles.tabButtonText, activeTab === 'general' && styles.tabButtonTextActive]}>
            Informacion general
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tabButton, activeTab === 'followups' && styles.tabButtonActive]}
          onPress={() => setActiveTab('followups')}
        >
          <Text style={[styles.tabButtonText, activeTab === 'followups' && styles.tabButtonTextActive]}>
            Seguimientos
          </Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content} contentContainerStyle={styles.contentContainer}>
        {activeTab === 'general' ? (
          <>
            <View style={styles.card}>
              <Text style={styles.cardTitle}>Lead</Text>
              <View style={styles.infoRow}>
                <CircleUserRound size={18} color={colors.accent} />
                <Text style={styles.infoText}>{lead.name}</Text>
              </View>
              <View style={styles.infoRow}>
                <Phone size={18} color={colors.accent} />
                <Text style={styles.infoText}>{lead.phone}</Text>
              </View>
              {lead.email && (
                <View style={styles.infoRow}>
                  <Mail size={18} color={colors.accent} />
                  <Text style={styles.infoText}>{lead.email}</Text>
                </View>
              )}
            </View>

            <View style={styles.card}>
              <Text style={styles.cardTitle}>Propiedad</Text>
              <View style={styles.infoRow}>
                <FileText size={18} color={colors.accent} />
                <Text style={styles.infoText}>{property?.title || 'Sin propiedad'}</Text>
              </View>
              <View style={styles.infoRow}>
                <MapPinned size={18} color={colors.accent} />
                <Text style={styles.infoText}>{getLeadPropertyTypeLabel(property?.type)}</Text>
              </View>
            </View>

            <View style={styles.card}>
              <Text style={styles.cardTitle}>Origen</Text>
              <View style={styles.infoRow}>
                <MessageCircle size={18} color={colors.accent} />
                <Text style={styles.infoText}>{lead.source}</Text>
              </View>
              <View style={styles.infoRow}>
                <CircleUserRound size={18} color={colors.accent} />
                <Text style={styles.infoText}>{lead.assignedAgentName || assignedAgent?.name || 'Sin asesor asignado'}</Text>
              </View>
              <View style={styles.infoRow}>
                <CalendarDays size={18} color={colors.accent} />
                <Text style={styles.infoText}>{formatDate(lead.firstContactDate || lead.createdDate)}</Text>
              </View>
              <View style={styles.infoRow}>
                <MessageCircle size={18} color={colors.accent} />
                <Text style={styles.infoText}>{lead.contactType ? leadContactTypeLabels[lead.contactType] : 'Sin tipo de contacto'}</Text>
              </View>
              <View style={styles.infoRow}>
                <MapPinned size={18} color={colors.accent} />
                <Text style={styles.infoText}>{lead.searchIntent === 'rent' ? 'Busca renta' : 'Busca compra'}</Text>
              </View>
              {lead.notes && (
                <View style={styles.noteBox}>
                  <Text style={styles.noteLabel}>Nota general</Text>
                  <Text style={styles.noteText}>{lead.notes}</Text>
                </View>
              )}
            </View>
          </>
        ) : (
          <>
            {followUps.length > 0 ? (
              followUps.map(followUp => {
                const FollowUpIcon = FOLLOW_UP_TYPE_ICONS[followUp.type]
                return (
                  <TouchableOpacity
                    key={followUp.id}
                    style={styles.followUpCard}
                    activeOpacity={0.82}
                    onPress={() => openFollowUpSheet(followUp)}
                  >
                    <View style={styles.followUpHeader}>
                      <View>
                        <Text style={styles.followUpDate}>{followUp.date}</Text>
                        <View style={styles.followUpSourceRow}>
                          <FollowUpIcon size={15} color={colors.accent} />
                          <Text style={styles.followUpSource}>{FOLLOW_UP_TYPE_LABELS[followUp.type]}</Text>
                        </View>
                      </View>
                      <ChevronUp size={18} color={colors.textMuted} />
                    </View>
                  </TouchableOpacity>
                )
              })
            ) : (
              <View style={styles.emptyState}>
                <Text style={styles.emptyStateText}>Este lead aun no tiene seguimientos</Text>
              </View>
            )}
          </>
        )}
      </ScrollView>

      <Modal
        visible={!!selectedFollowUp}
        transparent
        animationType="fade"
        onRequestClose={closeFollowUpSheet}
      >
        <Pressable style={styles.sheetOverlay} onPress={closeFollowUpSheet}>
          <Animated.View
            style={[
              styles.sheetContainer,
              sheetHeightStyle,
              { transform: [{ translateY }] },
            ]}
            {...panResponder.panHandlers}
          >
            <Pressable style={styles.sheetBody} onPress={() => {}}>
              <View style={styles.sheetHandle} />
              <View style={styles.sheetHeader}>
                <View>
                  <Text style={styles.sheetTitle}>Seguimiento</Text>
                  <Text style={styles.sheetSubtitle}>
                    {selectedFollowUp?.date} · {selectedFollowUp ? FOLLOW_UP_TYPE_LABELS[selectedFollowUp.type] : ''}
                  </Text>
                </View>
                <TouchableOpacity style={styles.sheetCloseButton} onPress={closeFollowUpSheet}>
                  <X size={18} color={colors.textLight} />
                </TouchableOpacity>
              </View>
              <ScrollView style={styles.sheetScroll} showsVerticalScrollIndicator={false}>
                <Text style={styles.sheetNoteText}>{selectedFollowUp?.notes}</Text>
              </ScrollView>
            </Pressable>
          </Animated.View>
        </Pressable>
      </Modal>

      <Modal
        visible={showCreateFollowUpModal}
        transparent
        animationType="fade"
        onRequestClose={closeCreateFollowUpModal}
      >
        <Pressable style={styles.sheetOverlay} onPress={closeCreateFollowUpModal}>
          <Pressable style={styles.createModalCard} onPress={() => {}}>
            <Text style={styles.createModalTitle}>Nuevo seguimiento</Text>
            <Text style={styles.createModalSubtitle}>Registra la siguiente accion realizada con este lead.</Text>

            <View style={styles.typeChipsRow}>
              {(['call', 'whatsapp', 'email', 'visit', 'meeting'] as LeadFollowUp['type'][]).map(type => (
                <TouchableOpacity
                  key={type}
                  style={[
                    styles.typeChip,
                    newFollowUpType === type && styles.typeChipActive,
                  ]}
                  onPress={() => setNewFollowUpType(type)}
                >
                  <Text
                    style={[
                      styles.typeChipText,
                      newFollowUpType === type && styles.typeChipTextActive,
                    ]}
                  >
                    {FOLLOW_UP_TYPE_LABELS[type]}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <TextInput
              style={styles.followUpInput}
              placeholder="Escribe una nota del seguimiento"
              placeholderTextColor={colors.textMuted}
              value={newFollowUpNotes}
              onChangeText={setNewFollowUpNotes}
              multiline
              numberOfLines={4}
              textAlignVertical="top"
            />

            <View style={styles.createModalActions}>
              <TouchableOpacity style={styles.createModalSecondaryButton} onPress={closeCreateFollowUpModal}>
                <Text style={styles.createModalSecondaryButtonText}>Cancelar</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.createModalPrimaryButton, !newFollowUpNotes.trim() && styles.createModalPrimaryButtonDisabled]}
                onPress={handleCreateFollowUp}
                disabled={!newFollowUpNotes.trim()}
              >
                <Text style={styles.createModalPrimaryButtonText}>Guardar</Text>
              </TouchableOpacity>
            </View>
          </Pressable>
        </Pressable>
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
  headerActionButton: {
    minWidth: 104,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.full,
    backgroundColor: colors.accent,
  },
  headerActionButtonText: {
    color: colors.primaryDark,
    fontSize: typography.bodySmall.fontSize,
    fontWeight: '700',
  },
  tabsContainer: {
    flexDirection: 'row',
    paddingHorizontal: spacing.md,
    paddingTop: spacing.lg,
    gap: spacing.sm,
  },
  tabButton: {
    flex: 1,
    paddingVertical: spacing.md,
    borderRadius: borderRadius.full,
    backgroundColor: colors.surfaceDark,
    borderWidth: 1,
    borderColor: colors.borderDark,
    alignItems: 'center',
  },
  tabButtonActive: {
    backgroundColor: colors.accent,
    borderColor: colors.accent,
  },
  tabButtonText: {
    fontSize: typography.bodySmall.fontSize,
    fontWeight: '600',
    color: colors.textMuted,
  },
  tabButtonTextActive: {
    color: colors.primaryDark,
  },
  content: {
    flex: 1,
  },
  contentContainer: {
    padding: spacing.md,
    gap: spacing.md,
    paddingBottom: spacing.xxl,
  },
  card: {
    backgroundColor: colors.surfaceDark,
    borderRadius: borderRadius.xl,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.borderDark,
  },
  cardTitle: {
    fontSize: typography.body.fontSize,
    fontWeight: '700',
    color: colors.textLight,
    marginBottom: spacing.md,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginBottom: spacing.sm,
  },
  infoText: {
    fontSize: typography.body.fontSize,
    color: colors.textLight,
    flex: 1,
  },
  noteBox: {
    marginTop: spacing.sm,
    padding: spacing.md,
    borderRadius: borderRadius.lg,
    backgroundColor: colors.primaryDark,
    borderWidth: 1,
    borderColor: colors.borderDark,
  },
  noteLabel: {
    fontSize: typography.caption.fontSize,
    color: colors.accent,
    fontWeight: '600',
    marginBottom: spacing.xs,
  },
  noteText: {
    fontSize: typography.bodySmall.fontSize,
    color: colors.textSecondary,
    lineHeight: 20,
  },
  followUpCard: {
    backgroundColor: colors.surfaceDark,
    borderRadius: borderRadius.xl,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.borderDark,
    marginBottom: spacing.md,
  },
  followUpHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  followUpDate: {
    fontSize: typography.body.fontSize,
    fontWeight: '700',
    color: colors.textLight,
  },
  followUpSourceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    marginTop: spacing.xs,
  },
  followUpSource: {
    fontSize: typography.bodySmall.fontSize,
    color: colors.accent,
    fontWeight: '600',
  },
  emptyState: {
    paddingVertical: spacing.xxl,
    alignItems: 'center',
  },
  emptyStateText: {
    fontSize: typography.body.fontSize,
    color: colors.textMuted,
  },
  notFound: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  notFoundText: {
    color: colors.textMuted,
    fontSize: typography.body.fontSize,
  },
  sheetOverlay: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0, 0, 0, 0.55)',
  },
  sheetContainer: {
    width: '100%',
  },
  sheetDefault: {
    height: '44%',
  },
  sheetExpanded: {
    height: '78%',
  },
  sheetBody: {
    flex: 1,
    backgroundColor: colors.surfaceDark,
    borderTopLeftRadius: borderRadius.xl,
    borderTopRightRadius: borderRadius.xl,
    borderWidth: 1,
    borderBottomWidth: 0,
    borderColor: colors.borderDark,
    padding: spacing.md,
    paddingBottom: spacing.xl,
  },
  sheetHandle: {
    width: 48,
    height: 5,
    borderRadius: borderRadius.full,
    alignSelf: 'center',
    backgroundColor: colors.borderDark,
    marginBottom: spacing.md,
  },
  sheetHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.md,
  },
  sheetTitle: {
    fontSize: typography.h4.fontSize,
    fontWeight: '700',
    color: colors.textLight,
  },
  sheetSubtitle: {
    fontSize: typography.bodySmall.fontSize,
    color: colors.textMuted,
    marginTop: spacing.xs,
  },
  sheetCloseButton: {
    width: 36,
    height: 36,
    borderRadius: borderRadius.full,
    backgroundColor: colors.primaryDark,
    borderWidth: 1,
    borderColor: colors.borderDark,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sheetScroll: {
    flex: 1,
  },
  sheetNoteText: {
    fontSize: typography.body.fontSize,
    lineHeight: 24,
    color: colors.textLight,
  },
  createModalCard: {
    marginHorizontal: spacing.md,
    marginTop: 'auto',
    marginBottom: spacing.xl,
    backgroundColor: colors.surfaceDark,
    borderRadius: borderRadius.xl,
    borderWidth: 1,
    borderColor: colors.borderDark,
    padding: spacing.md,
  },
  createModalTitle: {
    fontSize: typography.h4.fontSize,
    fontWeight: '700',
    color: colors.textLight,
  },
  createModalSubtitle: {
    fontSize: typography.bodySmall.fontSize,
    color: colors.textMuted,
    marginTop: spacing.xs,
    marginBottom: spacing.md,
  },
  typeChipsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
    marginBottom: spacing.md,
  },
  typeChip: {
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    borderRadius: borderRadius.full,
    backgroundColor: colors.primaryDark,
    borderWidth: 1,
    borderColor: colors.borderDark,
  },
  typeChipActive: {
    backgroundColor: colors.accent,
    borderColor: colors.accent,
  },
  typeChipText: {
    color: colors.textMuted,
    fontSize: typography.bodySmall.fontSize,
    fontWeight: '600',
  },
  typeChipTextActive: {
    color: colors.primaryDark,
  },
  followUpInput: {
    minHeight: 120,
    borderRadius: borderRadius.lg,
    backgroundColor: colors.primaryDark,
    borderWidth: 1,
    borderColor: colors.borderDark,
    color: colors.textLight,
    padding: spacing.md,
    fontSize: typography.body.fontSize,
  },
  createModalActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: spacing.sm,
    marginTop: spacing.md,
  },
  createModalSecondaryButton: {
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    borderRadius: borderRadius.full,
    backgroundColor: colors.primaryDark,
    borderWidth: 1,
    borderColor: colors.borderDark,
  },
  createModalSecondaryButtonText: {
    color: colors.textLight,
    fontSize: typography.bodySmall.fontSize,
    fontWeight: '600',
  },
  createModalPrimaryButton: {
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    borderRadius: borderRadius.full,
    backgroundColor: colors.accent,
  },
  createModalPrimaryButtonDisabled: {
    opacity: 0.5,
  },
  createModalPrimaryButtonText: {
    color: colors.primaryDark,
    fontSize: typography.bodySmall.fontSize,
    fontWeight: '700',
  },
})
