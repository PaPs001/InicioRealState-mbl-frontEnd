import { useCallback, useEffect, useRef, useState, type ReactNode } from 'react'
import { styles } from './followups.styles'
import { Image, Modal, ScrollView, Text, TextInput, TouchableOpacity, View, KeyboardAvoidingView, Platform, Pressable } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { router, useLocalSearchParams, usePathname } from 'expo-router'
import * as ImagePicker from 'expo-image-picker'
import * as FileSystem from 'expo-file-system/legacy'

import {
  ArrowLeft,
  Clock3,
  X,
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
  API_URLS,
  createBackendLeadV2Following,
  getBackendLeadV2Followings,
  type BackendLeadV2FollowingRecord,
} from '@/lib/api'
import { useHideBottomNav } from '@/lib/navigation/bottom-nav-visibility'

type LeadFollowUpHistoryParams = {
  leadId?: string
  leadName?: string
  returnTo?: string
}

type SelectedFollowingImage = {
  uri: string
  name: string
  type: string
}

type FollowingImagePreview = {
  uri: string
  title: string
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
  const [activityText, setActivityText] = useState('')
  const [selectedImage, setSelectedImage] = useState<SelectedFollowingImage | null>(null)
  const [previewImage, setPreviewImage] = useState<FollowingImagePreview | null>(null)
  const [isSavingActivity, setIsSavingActivity] = useState(false)
  const [activityError, setActivityError] = useState<string | null>(null)
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

  const closeActivityModal = () => {
    if (isSavingActivity) return
    setIsActivityModalOpen(false)
    setActivityText('')
    setSelectedImage(null)
    setActivityError(null)
  }

  const pickActivityImage = async () => {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync()
    if (!permission.granted) {
      setActivityError('Necesitamos permiso para escoger una imagen.')
      return
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      allowsEditing: false,
      mediaTypes: ['images'],
      quality: 0.8,
    })

    if (result.canceled || !result.assets[0]) return

    const asset = result.assets[0]
    setSelectedImage({
      uri: asset.uri,
      name: asset.fileName || `seguimiento-${Date.now()}.jpg`,
      type: asset.mimeType || 'image/jpeg',
    })
    setActivityError(null)
  }

  const submitActivity = async () => {
    if (!authToken || !leadId) {
      setActivityError('No hay sesion o lead valido para guardar.')
      return
    }

    if (!activityText.trim() && !selectedImage) {
      setActivityError('Agrega texto o una imagen para guardar el seguimiento.')
      return
    }

    setIsSavingActivity(true)
    setActivityError(null)
    try {
      await createBackendLeadV2Following(leadId, {
        text: activityText,
        contactDate: new Date().toISOString(),
        contactType: 'app',
        image: selectedImage,
      }, authToken)
      setIsActivityModalOpen(false)
      setActivityText('')
      setSelectedImage(null)
      await loadFollowings()
    } catch (error) {
      console.warn('No se pudo guardar el seguimiento v2:', error)
      setActivityError('No se pudo guardar el seguimiento. Intenta de nuevo.')
    } finally {
      setIsSavingActivity(false)
    }
  }

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

          <Modal animationType="slide" transparent visible={isActivityModalOpen} onRequestClose={closeActivityModal}>
            <Pressable
              style={styles.modalBackdrop}
              onPress={closeActivityModal}
            >
              <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                style={styles.modalKeyboardAvoidingView}
              >
              <Pressable 
                style={styles.activityModal} 
                onPress={(event) => event.stopPropagation()}
              >
                <View style={styles.modalHeader}>
                  <View style={styles.modalTitleBlock}>
                    <Text style={styles.modalTitle}>Agregar actividad</Text>
                    <Text style={styles.modalSubtitle}>Guarda texto o una imagen en el seguimiento</Text>
                  </View>
                  <TouchableOpacity style={styles.modalCloseButton} activeOpacity={0.85} onPress={closeActivityModal}>
                    <X size={18} color="#19191f" />
                  </TouchableOpacity>
                </View>

                <Text style={styles.inputLabel}>Texto del seguimiento</Text>
                <TextInput
                  style={styles.activityInput}
                  value={activityText}
                  onChangeText={(value) => {
                    setActivityText(value)
                    setActivityError(null)
                  }}
                  placeholder="Escribe la actualizacion del lead"
                  placeholderTextColor="#9a9188"
                  multiline
                  textAlignVertical="top"
                />

                <TouchableOpacity style={styles.imagePickerButton} activeOpacity={0.85} onPress={pickActivityImage}>
                  <ImageIcon size={16} color="#12382f" />
                  <View style={styles.imagePickerCopy}>
                    <Text style={styles.imagePickerTitle}>{selectedImage ? 'Imagen seleccionada' : 'Agregar imagen opcional'}</Text>
                    <Text style={styles.imagePickerMeta} numberOfLines={1}>
                      {selectedImage?.name || 'Puedes guardar solo texto si lo prefieres'}
                    </Text>
                  </View>
                </TouchableOpacity>

                {selectedImage ? (
                  <TouchableOpacity style={styles.removeImageButton} activeOpacity={0.85} onPress={() => setSelectedImage(null)}>
                    <Text style={styles.removeImageText}>Quitar imagen</Text>
                  </TouchableOpacity>
                ) : null}

                {activityError ? <Text style={styles.modalErrorText}>{activityError}</Text> : null}

                <TouchableOpacity
                  style={[styles.saveActivityButton, isSavingActivity && styles.saveActivityButtonDisabled]}
                  activeOpacity={0.85}
                  disabled={isSavingActivity}
                  onPress={submitActivity}
                >
                  <Text style={styles.saveActivityText}>{isSavingActivity ? 'Guardando...' : 'Guardar actividad'}</Text>
                </TouchableOpacity>
              </Pressable>
              </KeyboardAvoidingView>
            </Pressable>
          </Modal>

          <Modal animationType="fade" transparent visible={Boolean(previewImage)} onRequestClose={() => setPreviewImage(null)}>
            <View style={styles.imagePreviewBackdrop}>
              <View style={styles.imagePreviewHeader}>
                <Text style={styles.imagePreviewTitle} numberOfLines={1}>
                  {previewImage?.title || 'Imagen adjunta'}
                </Text>
                <TouchableOpacity style={styles.imagePreviewCloseButton} activeOpacity={0.85} onPress={() => setPreviewImage(null)}>
                  <X size={18} color="#ffffff" />
                </TouchableOpacity>
              </View>
              {previewImage ? (
                <Image source={{ uri: previewImage.uri }} style={styles.imagePreview} resizeMode="contain" />
              ) : null}
            </View>
          </Modal>
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
  const imageAttachments = following.attachments.filter(isImageAttachment)

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

function FollowingImageAttachment({
  attachment,
  followingId,
  index,
  leadId,
  onOpenImage,
  token,
}: {
  attachment: BackendLeadV2FollowingRecord['attachments'][number]
  followingId: string
  index: number
  leadId: string
  onOpenImage: (image: FollowingImagePreview) => void
  token?: string | null
}) {
  const [localUri, setLocalUri] = useState<string | null>(null)
  const [hasLoadError, setHasLoadError] = useState(false)
  const title = attachment.filename || `Imagen ${index + 1}`
  const remoteUri = getAttachmentImageUrl(leadId, attachment)

  useEffect(() => {
    let isMounted = true

    setLocalUri(null)
    setHasLoadError(false)

    if (!remoteUri) {
      setHasLoadError(true)
      return () => {
        isMounted = false
      }
    }

    cacheAttachmentImage(remoteUri, getAttachmentRequestHeaders(token), attachment, followingId, index)
      .then((cachedUri) => {
        if (isMounted) setLocalUri(cachedUri)
      })
      .catch((error) => {
        console.warn('No se pudo cachear la imagen del seguimiento:', error)
        if (isMounted) setHasLoadError(true)
      })

    return () => {
      isMounted = false
    }
  }, [attachment.filename, attachment.mime, attachment.storageKey, attachment.url, followingId, index, remoteUri, token])

  return (
    <TouchableOpacity
      style={styles.attachmentThumbButton}
      activeOpacity={0.85}
      disabled={!localUri}
      onPress={() => localUri && onOpenImage({ uri: localUri, title })}
    >
      {localUri ? (
        <Image source={{ uri: localUri }} style={styles.attachmentThumb} resizeMode="cover" />
      ) : (
        <View style={styles.attachmentThumbPlaceholder}>
          <Text style={styles.attachmentThumbPlaceholderText}>{hasLoadError ? 'No disponible' : 'Cargando...'}</Text>
        </View>
      )}
      <View style={styles.attachmentMeta}>
        <ImageIcon size={12} color="#0c6740" />
        <Text style={styles.attachmentName} numberOfLines={1}>{title}</Text>
      </View>
    </TouchableOpacity>
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

const attachmentCacheDirectory = `${FileSystem.cacheDirectory || FileSystem.documentDirectory || ''}lead-following-attachments/`

async function cacheAttachmentImage(
  remoteUri: string,
  headers: Record<string, string>,
  attachment: BackendLeadV2FollowingRecord['attachments'][number],
  followingId: string,
  index: number,
) {
  if (!attachmentCacheDirectory) {
    throw new Error('No hay directorio local disponible para cachear imagenes.')
  }

  await FileSystem.makeDirectoryAsync(attachmentCacheDirectory, { intermediates: true }).catch(() => undefined)

  const fileUri = `${attachmentCacheDirectory}${getAttachmentCacheFilename(attachment, followingId, index)}`
  const cachedFile = await FileSystem.getInfoAsync(fileUri)
  if (cachedFile.exists) return fileUri

  const response = await fetch(remoteUri, { headers })
  if (!response.ok) {
    throw new Error(`No se pudo descargar la imagen (${response.status})`)
  }

  const arrayBuffer = await response.arrayBuffer()
  await FileSystem.writeAsStringAsync(fileUri, arrayBufferToBase64(arrayBuffer), {
    encoding: FileSystem.EncodingType.Base64,
  })

  return fileUri
}

function getAttachmentCacheFilename(
  attachment: BackendLeadV2FollowingRecord['attachments'][number],
  followingId: string,
  index: number,
) {
  const source = attachment.storageKey || attachment.url || attachment.filename || `${followingId}-${index}`
  const safeName = source.replace(/[^a-zA-Z0-9._-]/g, '_')
  const extension = getAttachmentExtension(attachment)
  return safeName.toLowerCase().endsWith(extension) ? safeName : `${safeName}${extension}`
}

function getAttachmentExtension(attachment: BackendLeadV2FollowingRecord['attachments'][number]) {
  const filenameExtension = attachment.filename?.match(/\.[a-zA-Z0-9]+$/)?.[0]
  if (filenameExtension) return filenameExtension

  const mime = attachment.mime?.toLowerCase() || ''
  if (mime.includes('png')) return '.png'
  if (mime.includes('webp')) return '.webp'
  if (mime.includes('gif')) return '.gif'
  if (mime.includes('heic')) return '.heic'
  if (mime.includes('heif')) return '.heif'
  return '.jpg'
}

function arrayBufferToBase64(buffer: ArrayBuffer) {
  const bytes = new Uint8Array(buffer)
  const chunkSize = 0x8000
  let binary = ''

  for (let index = 0; index < bytes.length; index += chunkSize) {
    const chunk = bytes.subarray(index, index + chunkSize)
    binary += String.fromCharCode(...chunk)
  }

  return btoa(binary)
}

function getParamValue(value?: string | string[]) {
  if (Array.isArray(value)) return value[0] ?? ''
  return value ?? ''
}

function isImageAttachment(attachment: BackendLeadV2FollowingRecord['attachments'][number]) {
  if (!attachment.url && !attachment.storageKey) return false
  const mime = attachment.mime?.toLowerCase() || ''
  const filename = attachment.filename?.toLowerCase() || ''
  return mime.startsWith('image/') || /\.(jpe?g|png|webp|gif|heic|heif)$/.test(filename)
}

function getAttachmentImageUrl(leadId: string, attachment: BackendLeadV2FollowingRecord['attachments'][number]) {
  if (!attachment.storageKey) return attachment.url || ''

  const encodedKey = encodeURIComponent(attachment.storageKey)
  return `${API_URLS.CORE}/leads-v2/${leadId}/followings/attachment?key=${encodedKey}`
}

function getAttachmentRequestHeaders(token?: string | null) {
  const headers: Record<string, string> = {
    Accept: 'image/*',
  }

  if (API_URLS.CORE.includes('ngrok-free')) {
    headers['ngrok-skip-browser-warning'] = 'true'
  }

  if (token) {
    headers.Authorization = `Bearer ${token}`
  }

  return headers
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
