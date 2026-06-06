import {
  getConversationPropertyRecord,
  getConversationRecords,
  getConversationUserRecord,
} from '@/lib/api'
import type { Conversation, Property, User } from '@/lib/types'

export function getUserConversations(currentUserId?: string | null): Conversation[] {
  if (!currentUserId) {
    return []
  }

  return getConversationRecords().filter((conversation) => conversation.participants.includes(currentUserId))
}

export function filterConversationsByParticipantName(
  conversations: Conversation[],
  searchQuery: string,
  currentUserId?: string | null,
): Conversation[] {
  if (!searchQuery.trim()) {
    return conversations
  }

  const normalizedQuery = searchQuery.trim().toLowerCase()

  return conversations.filter((conversation) => {
    const otherUser = getConversationOtherParticipant(conversation, currentUserId)
    return otherUser?.name.toLowerCase().includes(normalizedQuery) || false
  })
}

export function getConversationOtherParticipant(
  conversation: Conversation,
  currentUserId?: string | null,
): User | undefined {
  const otherParticipantId = conversation.participants.find((participant) => participant !== currentUserId)
  return getConversationUserRecord(otherParticipantId)
}

export function getConversationProperty(conversation: Conversation): Property | undefined {
  return getConversationPropertyRecord(conversation.propertyId)
}

export function formatConversationTime(dateString?: string): string {
  if (!dateString) return ''

  const date = new Date(dateString)
  const now = new Date()
  const diffDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24))

  if (diffDays === 0) {
    return date.toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit' })
  }

  if (diffDays === 1) {
    return 'Ayer'
  }

  if (diffDays < 7) {
    return date.toLocaleDateString('es-MX', { weekday: 'short' })
  }

  return date.toLocaleDateString('es-MX', { day: 'numeric', month: 'short' })
}

export function formatNotificationTime(dateString: string): string {
  const date = new Date(dateString)
  const now = new Date()
  const diffMs = now.getTime() - date.getTime()
  const diffMins = Math.floor(diffMs / (1000 * 60))
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60))
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))

  if (diffMins < 60) {
    return `Hace ${diffMins} min`
  }

  if (diffHours < 24) {
    return `Hace ${diffHours}h`
  }

  if (diffDays < 7) {
    return `Hace ${diffDays}d`
  }

  return date.toLocaleDateString('es-MX', { day: 'numeric', month: 'short' })
}
