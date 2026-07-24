import type { Property } from '@/lib/types'

export function getUserProperties(currentUserId?: string | null): Property[] {
  if (!currentUserId) return []
  return []
}

export function getUserPropertyById(propertyId?: string | null): Property | null {
  if (!propertyId) return null
  return null
}
