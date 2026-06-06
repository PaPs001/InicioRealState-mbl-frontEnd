import { mockProperties } from '@/lib/mock-data'
import type { Property } from '@/lib/types'

export function findListablePropertyById(id?: string | string[] | null): Property | undefined {
  const resolvedId = Array.isArray(id) ? id[0] : id
  if (!resolvedId) return undefined
  return mockProperties.find(property => property.id === resolvedId)
}
