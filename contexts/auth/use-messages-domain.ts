import { useMemo } from 'react'
import { useSessionDomain } from './use-session-domain'
import {
  filterConversationsByParticipantName,
  formatConversationTime,
  getConversationOtherParticipant,
  getConversationProperty,
  getUserConversations,
} from '@/lib/services/messaging-domain'
import type { Conversation } from '@/lib/types'

export function useMessagesDomain(searchQuery: string) {
  const { currentUser } = useSessionDomain()

  const userConversations = useMemo(
    () => getUserConversations(currentUser?.id),
    [currentUser?.id],
  )

  const filteredConversations = useMemo(
    () => filterConversationsByParticipantName(userConversations, searchQuery, currentUser?.id),
    [currentUser?.id, searchQuery, userConversations],
  )

  const getOtherParticipant = (conversation: Conversation) =>
    getConversationOtherParticipant(conversation, currentUser?.id)

  return {
    currentUser,
    filteredConversations,
    getOtherParticipant,
    getPropertyInfo: getConversationProperty,
    formatTime: formatConversationTime,
  }
}

export default useMessagesDomain
