import { useCallback, useEffect, useRef, useState, type ReactNode } from 'react'
import { styles } from './followups.styles'
import { ScrollView, Text, TouchableOpacity, View, KeyboardAvoidingView, Platform } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { router, useLocalSearchParams, usePathname } from 'expo-router'

import {
  ArrowLeft,
  Clock3,
  FileText,
  Image as ImageIcon,
  ListFilter,
  MessageCircle,
  Mic,
  NotebookPen,
  Phone,
  Plus,
  Sparkles,
} from 'lucide-react-native'
import { useSessionDomain } from '@/contexts/auth/use-session-domain'
import {
  getBackendLeadV2Followings,
  type BackendLeadV2FollowingRecord,
} from '@/lib/api'
import { useHideBottomNav } from '@/lib/navigation/bottom-nav-visibility'
import {
  isFollowingImageAttachment,
} from '@/modules/users/leads/hooks/useFollowingAttachmentImage'
import {FollowingImageAttachment, type FollowingImagePreview} from '@/modules/users/leads/components/FollowingImageAttachment'
import {FollowingImagePreviewModal} from '@/modules/users/leads/components/FollowingImagePreviewModal'
import {CreateLeadFollowingModal} from '@/modules/users/leads/components/CreateLeadFollowingModal'

type LeadFollowUpHistoryParams = {
  leadId?: string
  leadName?: string
  returnTo?: string
}

type HistoryFilter = {
  id: string
  label: string
  icon: ReactNode
  active?: boolean
  warm?: boolean
}

const filters: HistoryFilter[] = [
  { id: 'all', label: 'Todos', icon: <ListFilter size={14} color="#ffffff" />, active: true },
  { id: 'messages', label: 'Mensajes', icon: <MessageCircle size={16} color="#12382f" /> },
  { id: 'calls', label: 'Llamadas', icon: <Phone size={16} color="#12382f" /> },
  { id: 'ai', label: 'IA', icon: <Sparkles size={15} color="#c98412" />, warm: true },
  { id: 'files', label: 'Archivos', icon: <FileText size={15} color="#12382f" /> },
]

export default function LeadV2FollowUpsScreen() {
  useHideBottomNav()

  const pathname = usePathname()
  const params = useLocalSearchParams<LeadFollowUpHistoryParams>()
  const { authToken } = useSessionDomain()
  const leadId = getParamValue(params.leadId)
  const leadName = getParamValue(params.leadName) || 'Lead seleccionado'
  const returnTo = getParamValue(params.returnTo)
  const [followings, setFollowings] = useState<BackendLeadV2FollowingRecord[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [isActivityModalOpen, setIsActivityModalOpen] = useState(false)
  const [previewImage, setPreviewImage] = useState<FollowingImagePreview | null>(null)
  const hasLoadedInitialFollowingsRef = useRef(false)

  const loadFollowings = useCallback(async () => {
    if (!authToken || !leadId) {
      setFollowings([])
      setIsLoading(false)
      return
    }

    setIsLoading(true)
    setErrorMessage(null)
    try {
      const records = await getBackendLeadV2Followings(leadId, authToken)
      setFollowings(records)
    } catch (error) {
      console.warn('No se pudieron cargar los seguimientos v2:', error)
      setErrorMessage('No se pudieron cargar los seguimientos')
      setFollowings([])
    } finally {
      setIsLoading(false)
    }
  }, [authToken, leadId])

  useEffect(() => {
    if (!authToken || !leadId || hasLoadedInitialFollowingsRef.current) return

    hasLoadedInitialFollowingsRef.current = true
    console.info('[LeadV2FollowUps][initial-load]', { service: 'followings', leadId })
    loadFollowings()
  }, [authToken, leadId, loadFollowings])

  const goBackToLeadDetail = () => {
    const fallbackPath = pathname.startsWith('/userAdviser')
      ? '/userAdviser/leads'
      : '/userCoordinator/leads'

    router.replace({
      pathname: (returnTo || fallbackPath) as never,
      params: leadId ? { selectedLeadId: leadId } : undefined,
    } as never)
  }

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'bottom']}>
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
      >
        <View style={styles.screen}>
          <TouchableOpacity style={styles.backButton} activeOpacity={0.85} onPress={goBackToLeadDetail}>
            <ArrowLeft size={20} color="#19191f" />
          </TouchableOpacity>

          <View style={styles.brandBlock}>
            <Text style={styles.brandTitle}>INICIO</Text>
            <Text style={styles.brandSubtitle}>REAL ESTATE</Text>
          </View>

          <View style={styles.titleBlock}>
            <Text style={styles.title}>Historial de seguimiento</Text>
            <Text style={styles.subtitle}>Conversacion y acciones de {leadName}</Text>
          </View>

          {/*<ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filterContent} style={styles.filterScroll}>
            {filters.map((filter) => (
              <TouchableOpacity
                key={filter.id}
                style={[styles.filterChip, filter.active && styles.filterChipActive, filter.warm && styles.filterChipWarm]}
                activeOpacity={0.85}
              >
                {filter.icon}
                <Text style={[styles.filterText, filter.active && styles.filterTextActive, filter.warm && styles.filterTextWarm]}>
                  {filter.label}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>*/}

          <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.timelineContent}>
            <View style={styles.timelineRail} />
            {isLoading ? (
              <View style={styles.emptyTimeline}>
                <View style={styles.emptyIconCircle}>
                  <Clock3 size={32} color="#064b38" />
                </View>
                <Text style={styles.emptyTitle}>Cargando seguimientos</Text>
                <Text style={styles.emptyText}>Estamos consultando los registros de este lead.</Text>
              </View>
            ) : errorMessage ? (
              <TouchableOpacity style={styles.emptyTimeline} activeOpacity={0.85} onPress={loadFollowings}>
                <View style={styles.emptyIconCircle}>
                  <MessageCircle size={32} color="#064b38" />
                </View>
                <Text style={styles.emptyTitle}>{errorMessage}</Text>
                <Text style={styles.emptyText}>Toca para intentar de nuevo.</Text>
              </TouchableOpacity>
            ) : followings.length > 0 ? (
              followings.map((following, index) => (
                <FollowingCard
                  following={following}
                  isLast={index === followings.length - 1}
                  key={following.id}
                  onOpenImage={setPreviewImage}
                  token={authToken}
                />
              ))
            ) : (
              <View style={styles.emptyTimeline}>
                <View style={styles.emptyIconCircle}>
                  <MessageCircle size={32} color="#064b38" />
                </View>
                <Text style={styles.emptyTitle}>Sin seguimientos para revisar</Text>
                <Text style={styles.emptyText}>
                  Los mensajes, llamadas, notas, archivos y actividades de IA apareceran aqui cuando existan registros reales.
                </Text>
              </View>
            )}
          </ScrollView>

          <View style={styles.bottomDock}>
            <View style={styles.quickActionsRow}>
              {/*<BottomPill icon={<NotebookPen size={14} color="#12382f" />} label="Agregar nota" />*/}
              <BottomPill icon={<Mic size={14} color="#12382f" />} label="Dictar audio" />
              {/*<BottomPill icon={<ImageIcon size={14} color="#12382f" />} label="Subir imagen" />*/}
              <BottomPill icon={<Sparkles size={14} color="#ffffff" />} label="Asistente IA" dark />
            </View>
            <TouchableOpacity style={styles.addActivityButton} activeOpacity={0.85} onPress={() => setIsActivityModalOpen(true)}>
              <Plus size={15} color="#ffffff" />
              <Text style={styles.addActivityText}>Agregar actividad</Text>
            </TouchableOpacity>
          </View>

          {isActivityModalOpen ? (
            <CreateLeadFollowingModal
              leadId={leadId}
              visible
              onClose={() => setIsActivityModalOpen(false)}
              onCreated={loadFollowings}
            />
          ) : null}

          <FollowingImagePreviewModal image={previewImage} onClose={() => setPreviewImage(null)} />
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  )
}

function FollowingCard({
  following,
  isLast,
  onOpenImage,
  token,
}: {
  following: BackendLeadV2FollowingRecord
  isLast: boolean
  onOpenImage: (image: FollowingImagePreview) => void
  token?: string | null
}) {
  const text = following.text.trim() || 'Seguimiento sin texto'
  const imageAttachments = following.attachments.filter(isFollowingImageAttachment)

  return (
    <View style={[styles.timelineRow, isLast && styles.timelineRowLast]}>
      <View style={styles.dotColumn}>
        <View style={styles.smallDot} />
        <View style={styles.iconCircle}>
          <MessageCircle size={17} color="#ffffff" />
        </View>
      </View>
      <View style={styles.followingCard}>
        <View style={styles.followingHeader}>
          <View style={styles.timeRow}>
            <Text style={styles.dateText}>{formatDate(following.createdAt)}</Text>
            <Text style={styles.timeText}>{formatTime(following.createdAt)}</Text>
          </View>
          <View style={styles.tagPill}>
            <Text style={styles.tagText}>{formatAuthorType(following.authorType)}</Text>
          </View>
        </View>
        <View style={styles.messageBubble}>
          <Text style={styles.followingText}>{text}</Text>
        </View>
        {imageAttachments.length > 0 ? (
          <View style={styles.attachmentGrid}>
            {imageAttachments.map((attachment, index) => (
              <FollowingImageAttachment
                attachment={attachment}
                followingId={following.id}
                index={index}
                key={attachment._id || attachment.storageKey || `${following.id}-image-${index}`}
                leadId={following.leadId}
                onOpenImage={onOpenImage}
                token={token}
              />
            ))}
          </View>
        ) : null}
      </View>
    </View>
  )
}

function BottomPill({ dark = false, icon, label }: { dark?: boolean; icon: ReactNode; label: string }) {
  return (
    <TouchableOpacity style={[styles.bottomPill, dark && styles.bottomPillDark]} activeOpacity={0.85}>
      {icon}
      <Text style={[styles.bottomPillText, dark && styles.bottomPillTextDark]} numberOfLines={1}>{label}</Text>
    </TouchableOpacity>
  )
}

function getParamValue(value?: string | string[]) {
  if (Array.isArray(value)) return value[0] ?? ''
  return value ?? ''
}

function formatAuthorType(value: string) {
  if (value === 'coordinator') return 'Coordinador'
  if (value === 'agent') return 'Asesor'
  return 'Seguimiento'
}

function formatDate(value?: string) {
  if (!value) return 'Sin fecha'
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return 'Sin fecha'
  const today = new Date()
  if (date.toDateString() === today.toDateString()) return 'Hoy'
  return date.toLocaleDateString('es-MX', { day: '2-digit', month: 'short' })
}

function formatTime(value?: string) {
  if (!value) return ''
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return ''
  return date.toLocaleTimeString('es-MX', { hour: 'numeric', minute: '2-digit' }).toLowerCase()
}
