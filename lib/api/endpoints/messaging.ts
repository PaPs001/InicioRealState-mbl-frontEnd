import { mockConversations, mockProperties, mockUsers } from '@/lib/mock-data'
import type { Conversation, Property, User } from '@/lib/types'

export function getConversationRecords(): Conversation[] {
  return mockConversations
}

export function getConversationUserRecord(userId?: string | null): User | undefined {
  if (!userId) {
    return undefined
  }

  return mockUsers.find((user) => user.id === userId)
}

export function getConversationPropertyRecord(propertyId?: string | null): Property | undefined {
  if (!propertyId) {
    return undefined
  }

  return mockProperties.find((property) => property.id === propertyId)
}
