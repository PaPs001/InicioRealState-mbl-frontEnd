import { Linking, Platform } from 'react-native'
import * as FileSystem from 'expo-file-system/legacy'
import * as IntentLauncher from 'expo-intent-launcher'

import { coreApi } from '../client'

const ANDROID_ACTION_VIEW = 'android.intent.action.VIEW'
const ANDROID_FLAG_GRANT_READ_URI_PERMISSION = 1

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
  agentName: PdfReportAgentName
  sales: boolean
  items: string[]
  action: PdfReportAction
  location: string
  list: PdfReportList
  design: PdfReportDesign
}

export type TemporaryPdfReport = {
  url: string
  filename: string
  expiresAt: string
  byteLength: number
  contentType: string
  localUri?: string
  savedUri?: string
  openUri?: string
}

function getSafFilename(filename: string) {
  return filename.replace(/\.pdf$/i, '')
}

export function createTemporaryPropertyListPdfUrl(
  token: string | null | undefined,
  payload: GeneratePropertyListPdfPayload,
) {
  console.log('Solicitando creacion de PDF temporal:', {
    endpoint: '/reports/property-list',
    hasToken: !!token,
    payload,
  })

  return coreApi<TemporaryPdfReport>('/reports/property-list', {
    method: 'POST',
    token: token ?? undefined,
    body: payload,
  })
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
  const localUri = `${FileSystem.documentDirectory}${report.filename}`
  const downloadResult = await FileSystem.downloadAsync(report.url, localUri, {
    headers: {
      Accept: 'application/pdf',
    },
  })

  report.localUri = downloadResult.uri

  if (Platform.OS === 'android' && androidDirectoryPermissions?.granted) {
    const savedUri = await FileSystem.StorageAccessFramework.createFileAsync(
      androidDirectoryPermissions.directoryUri,
      getSafFilename(report.filename),
      'application/pdf',
    )

    try {
      await FileSystem.StorageAccessFramework.copyAsync({
        from: downloadResult.uri,
        to: savedUri,
      })
    } catch {
      const base64 = await FileSystem.readAsStringAsync(downloadResult.uri, {
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

  report.openUri = downloadResult.uri
  await Linking.openURL(downloadResult.uri)

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
