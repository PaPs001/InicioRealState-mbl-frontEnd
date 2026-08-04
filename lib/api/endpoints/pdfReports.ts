import { Linking, Platform } from 'react-native'
import * as FileSystem from 'expo-file-system/legacy'
import * as IntentLauncher from 'expo-intent-launcher'

import { API_URLS, fetchWithAuthRetry } from '../client'

const ANDROID_ACTION_VIEW = 'android.intent.action.VIEW'
const ANDROID_FLAG_GRANT_READ_URI_PERMISSION = 1
const DIRECT_REPORT_ENDPOINT = '/reports/property-list'

export type PdfReportAgentName =
  | 'AlexaDiaz'
  | 'JoseAntonio'
  | 'CitlalliTapia'
  | 'JorgeSanchez'
  | 'VictorPerea'
  | 'HectorEspinoza'
  | 'CarlosTrujeque'
  | 'MatteoAguilar'
  | 'EdgarZavala'
  | 'DiegoLedezma'
  | 'DanielaVillanueva'

export type PdfReportDesign =
  | 'SALE'
  | 'RENT'
  | 'BAHIA_PRJECTS'
  | 'ORIGINAL'
  | 'WHITE_BOARD'
  | 'MODERN'
  | 'CONTRACT'
  | 'sale'
  | 'rent'
  | 'BahiaProjects'
  | 'original'
  | 'whiteBoard'
  | 'modern'
  | 'contract'

export type PdfReportAction = 'sale' | 'rent' | 'SelectProperties' | 'delete'
export type PdfReportList = 'sale' | 'rent' | 'BahiaProjects'

export type GeneratePropertyListPdfPayload = {
  agentName?: PdfReportAgentName
  agentPresentation?: string
  sales: boolean
  items: string[]
  action: PdfReportAction
  location: string
  list: PdfReportList
  design: PdfReportDesign
}

export type TemporaryPdfReport = {
  url?: string
  filename: string
  expiresAt?: string
  byteLength: number
  contentType: string
  localUri?: string
  savedUri?: string
  openUri?: string
}

function getSafFilename(filename: string) {
  return filename.replace(/\.pdf$/i, '')
}

function getCoreApiHeaders(token: string | null | undefined) {
  const headers: Record<string, string> = {
    Accept: 'application/pdf',
    'Content-Type': 'application/json',
  }

  if (API_URLS.CORE.includes('ngrok-free')) {
    headers['ngrok-skip-browser-warning'] = 'true'
  }

  if (token) {
    headers.Authorization = `Bearer ${token}`
  }

  return headers
}

function sanitizeFilename(filename: string) {
  return filename
    .replace(/[\\/?%*:|"<>]/g, '-')
    .replace(/\s+/g, '_')
    .replace(/_+/g, '_')
}

function getFilenameFromContentDisposition(disposition: string | null, fallback: string) {
  if (!disposition) return fallback

  const encodedMatch = disposition.match(/filename\*=UTF-8''([^;]+)/i)
  if (encodedMatch?.[1]) {
    try {
      return sanitizeFilename(decodeURIComponent(encodedMatch[1].replace(/^"|"$/g, '')))
    } catch {
      return sanitizeFilename(encodedMatch[1].replace(/^"|"$/g, ''))
    }
  }

  const plainMatch = disposition.match(/filename="?([^";]+)"?/i)
  return sanitizeFilename(plainMatch?.[1] || fallback)
}

async function getErrorMessage(response: Response) {
  try {
    const data = await response.clone().json() as { message?: string; error?: string; details?: string }
    return data.details || data.message || data.error || `Error ${response.status}`
  } catch {
    try {
      const text = await response.text()
      return text || `Error ${response.status}: ${response.statusText}`
    } catch {
      return `Error ${response.status}: ${response.statusText}`
    }
  }
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

export async function createTemporaryPropertyListPdfUrl(
  token: string | null | undefined,
  payload: GeneratePropertyListPdfPayload,
): Promise<TemporaryPdfReport> {
  const endpoint = DIRECT_REPORT_ENDPOINT
  const finalUrl = `${API_URLS.CORE}${endpoint}`

  console.log('Solicitando PDF directo:', {
    endpoint,
    finalUrl,
    hasToken: !!token,
    payload,
  })

  const response = await fetchWithAuthRetry(API_URLS.CORE, endpoint, {
    method: 'POST',
    headers: getCoreApiHeaders(token),
    token,
    body: JSON.stringify(payload),
  })

  if (!response.ok) {
    throw new Error(await getErrorMessage(response))
  }

  const contentType = response.headers.get('content-type') || 'application/pdf'
  const arrayBuffer = await response.arrayBuffer()
  const byteLength = arrayBuffer.byteLength
  const filename = getFilenameFromContentDisposition(
    response.headers.get('content-disposition'),
    payload.list === 'rent' ? 'Catalogo_rentas.pdf' : 'Catalogo_ventas.pdf',
  )
  const localUri = `${FileSystem.documentDirectory}${filename}`

  await FileSystem.writeAsStringAsync(localUri, arrayBufferToBase64(arrayBuffer), {
    encoding: FileSystem.EncodingType.Base64,
  })

  return {
    filename,
    byteLength,
    contentType,
    localUri,
  }
}

export async function createAndOpenTemporaryPropertyListPdf(
  token: string | null | undefined,
  payload: GeneratePropertyListPdfPayload,
) {
  const androidDirectoryPermissions = Platform.OS === 'android'
    ? await FileSystem.StorageAccessFramework.requestDirectoryPermissionsAsync()
    : null

  if (Platform.OS === 'android' && !androidDirectoryPermissions?.granted) {
    throw new Error('No se selecciono una carpeta para guardar el PDF.')
  }

  const report = await createTemporaryPropertyListPdfUrl(token, payload)

  if (Platform.OS === 'android' && androidDirectoryPermissions?.granted) {
    const savedUri = await FileSystem.StorageAccessFramework.createFileAsync(
      androidDirectoryPermissions.directoryUri,
      getSafFilename(report.filename),
      'application/pdf',
    )

    try {
      await FileSystem.StorageAccessFramework.copyAsync({
        from: report.localUri!,
        to: savedUri,
      })
    } catch {
      const base64 = await FileSystem.readAsStringAsync(report.localUri!, {
        encoding: FileSystem.EncodingType.Base64,
      })
      await FileSystem.StorageAccessFramework.writeAsStringAsync(savedUri, base64, {
        encoding: FileSystem.EncodingType.Base64,
      })
    }

    report.savedUri = savedUri
    report.openUri = savedUri
    await openPdfWithIntent(savedUri)
    return report
  }

  report.openUri = report.localUri
  await Linking.openURL(report.localUri!)

  return report
}

async function openPdfWithIntent(uri: string) {
  try {
    await IntentLauncher.startActivityAsync(ANDROID_ACTION_VIEW, {
      data: uri,
      type: 'application/pdf',
      flags: ANDROID_FLAG_GRANT_READ_URI_PERMISSION,
    })
  } catch (error) {
    await Linking.openURL(uri).catch(() => {
      throw error
    })
  }
}
