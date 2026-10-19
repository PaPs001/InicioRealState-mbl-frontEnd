import * as FileSystem from 'expo-file-system/legacy'
import { Platform } from 'react-native'

const pending = new Map<string, Promise<string>>()
const MAX_BYTES = 100 * 1024 * 1024
const MAX_AGE_SECONDS = 7 * 24 * 60 * 60
let maintenance = Promise.resolve()

async function downloadImage(url: string) {
  if (Platform.OS === 'web' || !FileSystem.cacheDirectory) return url
  // Only public property assets belong in this shared disk cache.
  if (!url.startsWith('https://images.contentforge.fyi/')) return url
  const directory = `${FileSystem.cacheDirectory}property-images/`
  await FileSystem.makeDirectoryAsync(directory, { intermediates: true })
  const filename = encodeURIComponent(url.slice('https://images.contentforge.fyi/'.length))
  const destination = `${directory}${filename}`
  const existing = await FileSystem.getInfoAsync(destination)
  if (existing.exists && Date.now() / 1000 - existing.modificationTime < MAX_AGE_SECONDS) return destination
  await FileSystem.deleteAsync(destination, { idempotent: true })
  const temporary = `${destination}.download`
  try {
    const result = await FileSystem.downloadAsync(url, temporary)
    if (result.status !== 200) throw new Error(`Image download: ${result.status}`)
    await FileSystem.moveAsync({ from: temporary, to: destination })
  } finally {
    await FileSystem.deleteAsync(temporary, { idempotent: true }).catch(() => undefined)
  }
  maintenance = maintenance.then(async () => {
    const names = await FileSystem.readDirectoryAsync(directory)
    const files = await Promise.all(names.filter(name => !name.endsWith('.download')).map(async name => {
      const uri = `${directory}${name}`
      const info = await FileSystem.getInfoAsync(uri)
      return info.exists ? { uri, size: info.size, time: info.modificationTime } : null
    }))
    const sorted = files.filter(file => file !== null).sort((a, b) => b.time - a.time)
    let total = 0
    for (const file of sorted) {
      total += file.size
      if (total > MAX_BYTES || Date.now() / 1000 - file.time > MAX_AGE_SECONDS) {
        await FileSystem.deleteAsync(file.uri, { idempotent: true })
      }
    }
  }).catch(() => undefined)
  return destination
}

export function getCachedPropertyImage(url: string) {
  const request = pending.get(url)
  if (request) return request
  const next = downloadImage(url).finally(() => pending.delete(url))
  pending.set(url, next)
  return next
}
