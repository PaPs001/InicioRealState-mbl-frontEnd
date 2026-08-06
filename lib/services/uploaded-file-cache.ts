import * as FileSystem from 'expo-file-system/legacy'

import { API_URLS } from '@/lib/api/client'

export type UploadedFileCacheNamespace = 'profile-photos' | 'agent-presentations'

type CacheUploadedFileOptions = {
  storageKey: string
  token?: string | null
  namespace: UploadedFileCacheNamespace
  contentType?: string
}

function getUploadedFileUrl(storageKey: string) {
  return `${API_URLS.CORE}/uploads/file?key=${encodeURIComponent(storageKey)}`
}

function getUploadedFileHeaders(token?: string | null) {
  const headers: Record<string, string> = { Accept: 'image/*' }

  if (API_URLS.CORE.includes('ngrok-free')) {
    headers['ngrok-skip-browser-warning'] = 'true'
  }

  if (token) {
    headers.Authorization = `Bearer ${token}`
  }

  return headers
}

function getExtension(storageKey: string, contentType?: string) {
  const keyExtension = storageKey.match(/\.[a-zA-Z0-9]+$/)?.[0]
  if (keyExtension) return keyExtension

  const normalizedContentType = contentType?.toLowerCase() || ''
  if (normalizedContentType.includes('png')) return '.png'
  if (normalizedContentType.includes('webp')) return '.webp'
  if (normalizedContentType.includes('gif')) return '.gif'
  return '.jpg'
}

function getCacheFilename(storageKey: string, contentType?: string) {
  const safeName = storageKey.replace(/[^a-zA-Z0-9._-]/g, '_')
  const extension = getExtension(safeName, contentType)
  return safeName.toLowerCase().endsWith(extension.toLowerCase())
    ? safeName
    : `${safeName}${extension}`
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

export async function cacheUploadedFile({
  storageKey,
  token,
  namespace,
  contentType,
}: CacheUploadedFileOptions) {
  const baseDirectory = FileSystem.cacheDirectory || FileSystem.documentDirectory
  if (!baseDirectory) {
    throw new Error('No hay un directorio local disponible para cachear el archivo.')
  }

  const cacheDirectory = `${baseDirectory}${namespace}/`
  await FileSystem.makeDirectoryAsync(cacheDirectory, { intermediates: true }).catch(() => undefined)

  const fileUri = `${cacheDirectory}${getCacheFilename(storageKey, contentType)}`
  const cachedFile = await FileSystem.getInfoAsync(fileUri)
  if (cachedFile.exists) return fileUri

  const response = await fetch(getUploadedFileUrl(storageKey), {
    headers: getUploadedFileHeaders(token),
  })
  if (!response.ok) {
    throw new Error(`No se pudo descargar el archivo (${response.status}).`)
  }

  const arrayBuffer = await response.arrayBuffer()
  await FileSystem.writeAsStringAsync(fileUri, arrayBufferToBase64(arrayBuffer), {
    encoding: FileSystem.EncodingType.Base64,
  })

  return fileUri
}
