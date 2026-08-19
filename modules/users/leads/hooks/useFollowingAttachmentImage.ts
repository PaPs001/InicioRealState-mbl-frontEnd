import {useEffect, useMemo, useState} from 'react'
import * as FileSystem from 'expo-file-system/legacy'

import {API_URLS, type BackendLeadV2FollowingRecord} from '@/lib/api'

export type FollowingAttachment = BackendLeadV2FollowingRecord['attachments'][number]

type UseFollowingAttachmentImageParams = {
  attachment: FollowingAttachment
  followingId: string
  index: number
  leadId: string
  token?: string | null
}

const attachmentCacheDirectory = `${FileSystem.cacheDirectory || FileSystem.documentDirectory || ''}lead-following-attachments/`

export function useFollowingAttachmentImage({
  attachment,
  followingId,
  index,
  leadId,
  token,
}: UseFollowingAttachmentImageParams) {
  const [localUri, setLocalUri] = useState<string | null>(null)
  const [hasLoadError, setHasLoadError] = useState(false)
  const remoteUri = useMemo(
    () => getFollowingAttachmentImageUrl(leadId, attachment),
    [attachment.storageKey, attachment.url, leadId],
  )

  useEffect(() => {
    let isMounted = true
    setLocalUri(null)
    setHasLoadError(false)

    if (!remoteUri) {
      setHasLoadError(true)
      return () => { isMounted = false }
    }

    cacheFollowingAttachmentImage(remoteUri, token, attachment, followingId, index)
      .then((uri) => { if (isMounted) setLocalUri(uri) })
      .catch((error) => {
        console.warn('No se pudo cargar la imagen del seguimiento:', error)
        if (isMounted) setHasLoadError(true)
      })

    return () => { isMounted = false }
  }, [attachment.filename, attachment.mime, attachment.storageKey, attachment.url, followingId, index, remoteUri, token])

  return {
    hasLoadError,
    isLoading: !localUri && !hasLoadError,
    localUri,
  }
}

export function isFollowingImageAttachment(attachment: FollowingAttachment) {
  if (!attachment.url && !attachment.storageKey) return false
  const mime = attachment.mime?.toLowerCase() || ''
  const filename = attachment.filename?.toLowerCase() || ''
  return mime.startsWith('image/') || /\.(jpe?g|png|webp|gif|heic|heif)$/.test(filename)
}

function getFollowingAttachmentImageUrl(leadId: string, attachment: FollowingAttachment) {
  if (!attachment.storageKey) return attachment.url || ''
  return `${API_URLS.CORE}/leads-v2/${leadId}/followings/attachment?key=${encodeURIComponent(attachment.storageKey)}`
}

async function cacheFollowingAttachmentImage(
  remoteUri: string,
  token: string | null | undefined,
  attachment: FollowingAttachment,
  followingId: string,
  index: number,
) {
  if (!attachmentCacheDirectory) throw new Error('No hay un directorio de caché disponible.')

  await FileSystem.makeDirectoryAsync(attachmentCacheDirectory, {intermediates: true}).catch(() => undefined)
  const fileUri = `${attachmentCacheDirectory}${getAttachmentCacheFilename(attachment, followingId, index)}`
  const cachedFile = await FileSystem.getInfoAsync(fileUri)
  if (cachedFile.exists) return fileUri

  const response = await fetch(remoteUri, {headers: getAttachmentRequestHeaders(token)})
  if (!response.ok) throw new Error(`No se pudo descargar la imagen (${response.status})`)

  await FileSystem.writeAsStringAsync(fileUri, arrayBufferToBase64(await response.arrayBuffer()), {
    encoding: FileSystem.EncodingType.Base64,
  })
  return fileUri
}

function getAttachmentCacheFilename(attachment: FollowingAttachment, followingId: string, index: number) {
  const source = attachment.storageKey || attachment.url || attachment.filename || `${followingId}-${index}`
  const safeName = source.replace(/[^a-zA-Z0-9._-]/g, '_')
  const extension = getAttachmentExtension(attachment)
  return safeName.toLowerCase().endsWith(extension) ? safeName : `${safeName}${extension}`
}

function getAttachmentExtension(attachment: FollowingAttachment) {
  const filenameExtension = attachment.filename?.match(/\.[a-zA-Z0-9]+$/)?.[0]
  if (filenameExtension) return filenameExtension.toLowerCase()
  const mime = attachment.mime?.toLowerCase() || ''
  if (mime.includes('png')) return '.png'
  if (mime.includes('webp')) return '.webp'
  if (mime.includes('gif')) return '.gif'
  if (mime.includes('heic')) return '.heic'
  if (mime.includes('heif')) return '.heif'
  return '.jpg'
}

function getAttachmentRequestHeaders(token?: string | null) {
  const headers: Record<string, string> = {Accept: 'image/*'}
  if (API_URLS.CORE.includes('ngrok-free')) headers['ngrok-skip-browser-warning'] = 'true'
  if (token) headers.Authorization = `Bearer ${token}`
  return headers
}

function arrayBufferToBase64(buffer: ArrayBuffer) {
  const bytes = new Uint8Array(buffer)
  const chunkSize = 0x8000
  let binary = ''
  for (let index = 0; index < bytes.length; index += chunkSize) {
    binary += String.fromCharCode(...bytes.subarray(index, index + chunkSize))
  }
  return btoa(binary)
}
