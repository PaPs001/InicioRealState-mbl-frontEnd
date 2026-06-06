import { mockProperties } from '@/lib/mock-data'
import type { Property } from '@/lib/types'

export function getUserProperties(currentUserId?: string | null): Property[] {
  if (!currentUserId) return []
  return mockProperties.filter(property => property.ownerId === currentUserId)
}

export function getUserPropertyById(propertyId?: string | null): Property | null {
  if (!propertyId) return null
  return mockProperties.find((property) => property.id === propertyId) ?? null
}
