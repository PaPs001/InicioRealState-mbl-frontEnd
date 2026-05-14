import { useState, useMemo } from 'react'
import { 
  View, 
  Text, 
  StyleSheet, 
  FlatList, 
  TouchableOpacity,
  TextInput,
} from 'react-native'
import { useRouter } from 'expo-router'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useAuth } from '@/contexts/AuthContext'
import { colors, spacing, typography, borderRadius } from '@/lib/theme'
import { mockConversations, mockUsers, mockProperties } from '@/lib/mock-data'
import type { Conversation } from '@/lib/types'
import { 
  Search,
  MessageCircle,
  User,
} from 'lucide-react-native'

export default function MessagesTab() {
  const { currentUser } = useAuth()
  const router = useRouter()
  const [searchQuery, setSearchQuery] = useState('')

  const userConversations = useMemo(() => {
    if (!currentUser) return []
    return mockConversations.filter(conv => 
      conv.participants.includes(currentUser.id)
    )
  }, [currentUser])

  const filteredConversations = useMemo(() => {
    if (!searchQuery) return userConversations
    return userConversations.filter(conv => {
      const otherParticipantId = conv.participants.find(p => p !== currentUser?.id)
      const otherUser = mockUsers.find(u => u.id === otherParticipantId)
      return otherUser?.name.toLowerCase().includes(searchQuery.toLowerCase())
    })
  }, [userConversations, searchQuery, currentUser])

  const getOtherParticipant = (conversation: Conversation) => {
    const otherParticipantId = conversation.participants.find(p => p !== currentUser?.id)
    return mockUsers.find(u => u.id === otherParticipantId)
  }

  const getPropertyInfo = (conversation: Conversation) => {
    if (!conversation.propertyId) return null
    return mockProperties.find(p => p.id === conversation.propertyId)
  }

  const formatTime = (dateString?: string) => {
    if (!dateString) return ''
    const date = new Date(dateString)
    const now = new Date()
    const diffDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24))
    
    if (diffDays === 0) {
      return date.toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit' })
    } else if (diffDays === 1) {
      return 'Ayer'
    } else if (diffDays < 7) {
      return date.toLocaleDateString('es-MX', { weekday: 'short' })
    } else {
      return date.toLocaleDateString('es-MX', { day: 'numeric', month: 'short' })
    }
  }

  const renderConversationItem = ({ item: conversation }: { item: Conversation }) => {
    const otherUser = getOtherParticipant(conversation)
    const property = getPropertyInfo(conversation)

    return (
      <TouchableOpacity 
        style={styles.conversationCard}
        onPress={() => router.push(`/chat/${conversation.id}`)}
        activeOpacity={0.7}
      >
        <View style={styles.avatarContainer}>
          <View style={styles.avatar}>
            <User size={24} color={colors.textMuted} />
          </View>
          {conversation.unreadCount > 0 && (
            <View style={styles.unreadBadge}>
              <Text style={styles.unreadBadgeText}>{conversation.unreadCount}</Text>
            </View>
          )}
        </View>

        <View style={styles.conversationContent}>
          <View style={styles.conversationHeader}>
            <Text style={styles.conversationName} numberOfLines={1}>
              {otherUser?.name || 'Usuario'}
            </Text>
            <Text style={styles.conversationTime}>
              {formatTime(conversation.lastMessageDate)}
            </Text>
          </View>

          {property && (
            <Text style={styles.propertyInfo} numberOfLines={1}>
              {property.title}
            </Text>
          )}

          <Text 
            style={[
              styles.lastMessage,
              conversation.unreadCount > 0 && styles.lastMessageUnread
            ]} 
            numberOfLines={1}
          >
            {conversation.lastMessage || 'Sin mensajes'}
          </Text>
        </View>
      </TouchableOpacity>
    )
  }

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Mensajes</Text>
      </View>

      {/* Barra de busqueda */}
      <View style={styles.searchContainer}>
        <View style={styles.searchInputContainer}>
          <Search size={20} color={colors.textMuted} />
          <TextInput
            style={styles.searchInput}
            placeholder="Buscar conversaciones..."
            placeholderTextColor={colors.textMuted}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>
      </View>

      {/* Lista de conversaciones */}
      <FlatList
        data={filteredConversations}
        renderItem={renderConversationItem}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <MessageCircle size={48} color={colors.textMuted} />
            <Text style={styles.emptyStateTitle}>Sin conversaciones</Text>
            <Text style={styles.emptyStateText}>
              Tus mensajes con asesores e inquilinos apareceran aqui
            </Text>
          </View>
        }
      />
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  headerTitle: {
    fontSize: typography.h2.fontSize,
    fontWeight: '700',
    color: colors.text,
  },
  searchContainer: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  searchInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    paddingHorizontal: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
  },
  searchInput: {
    flex: 1,
    paddingVertical: spacing.sm,
    paddingLeft: spacing.sm,
    fontSize: typography.body.fontSize,
    color: colors.text,
  },
  listContent: {
    padding: spacing.md,
    gap: spacing.sm,
  },
  conversationCard: {
    flexDirection: 'row',
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
  },
  avatarContainer: {
    position: 'relative',
    marginRight: spacing.md,
  },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: borderRadius.full,
    backgroundColor: colors.background,
    justifyContent: 'center',
    alignItems: 'center',
  },
  unreadBadge: {
    position: 'absolute',
    top: -2,
    right: -2,
    backgroundColor: colors.error,
    borderRadius: borderRadius.full,
    minWidth: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  unreadBadgeText: {
    color: '#fff',
    fontSize: 11,
    fontWeight: '700',
  },
  conversationContent: {
    flex: 1,
  },
  conversationHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  conversationName: {
    fontSize: typography.body.fontSize,
    fontWeight: '600',
    color: colors.text,
    flex: 1,
  },
  conversationTime: {
    fontSize: typography.caption.fontSize,
    color: colors.textMuted,
    marginLeft: spacing.sm,
  },
  propertyInfo: {
    fontSize: typography.caption.fontSize,
    color: colors.accent,
    marginTop: 2,
  },
  lastMessage: {
    fontSize: typography.bodySmall.fontSize,
    color: colors.textSecondary,
    marginTop: spacing.xs,
  },
  lastMessageUnread: {
    color: colors.text,
    fontWeight: '500',
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: spacing.xxl * 2,
  },
  emptyStateTitle: {
    fontSize: typography.h4.fontSize,
    fontWeight: '600',
    color: colors.text,
    marginTop: spacing.md,
  },
  emptyStateText: {
    fontSize: typography.body.fontSize,
    color: colors.textMuted,
    marginTop: spacing.xs,
    textAlign: 'center',
    paddingHorizontal: spacing.xl,
  },
})
