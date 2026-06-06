import { useState } from 'react'
import { 
  View, 
  Text, 
  StyleSheet, 
  FlatList, 
  TouchableOpacity,
  TextInput,
} from 'react-native'
import { useRouter } from 'expo-router'
import { useMessagesDomain } from '@/contexts/auth/use-messages-domain'
import { spacing, typography, borderRadius } from '@/lib/theme'
import type { Conversation } from '@/lib/types'
import { 
  Search,
  MessageCircle,
  User,
} from 'lucide-react-native'
import { AppScreen } from '@/components/ui'
import { useAppTheme } from '@/lib/hooks/useAppTheme'

export default function MessagesTab() {
  const router = useRouter()
  const { theme } = useAppTheme()
  const styles = createStyles(theme)
  const [searchQuery, setSearchQuery] = useState('')
  const { filteredConversations, getOtherParticipant, getPropertyInfo, formatTime } =
    useMessagesDomain(searchQuery)

  const renderConversationItem = ({ item: conversation }: { item: Conversation }) => {
    const otherUser = getOtherParticipant(conversation)
    const property = getPropertyInfo(conversation)

    return (
      <TouchableOpacity 
        style={[styles.conversationCard, { backgroundColor: theme.surface, borderColor: theme.border }]}
        onPress={() => router.push({ pathname: '/chat/[id]', params: { id: conversation.id } })}
        activeOpacity={0.7}
      >
        <View style={styles.avatarContainer}>
          <View style={[styles.avatar, { backgroundColor: theme.background }]}>
            <User size={24} color={theme.textMuted} />
          </View>
          {conversation.unreadCount > 0 && (
            <View style={styles.unreadBadge}>
              <Text style={styles.unreadBadgeText}>{conversation.unreadCount}</Text>
            </View>
          )}
        </View>

        <View style={styles.conversationContent}>
          <View style={styles.conversationHeader}>
            <Text style={[styles.conversationName, { color: theme.text }]} numberOfLines={1}>
              {otherUser?.name || 'Usuario'}
            </Text>
            <Text style={[styles.conversationTime, { color: theme.textMuted }]}>
              {formatTime(conversation.lastMessageDate)}
            </Text>
          </View>

          {property && (
            <Text style={[styles.propertyInfo, { color: theme.accent }]} numberOfLines={1}>
              {property.title}
            </Text>
          )}

          <Text 
            style={[
              styles.lastMessage,
              { color: theme.textSecondary },
              conversation.unreadCount > 0 && { color: theme.text, fontWeight: '500' }
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
    <AppScreen edges={['bottom']}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Mensajes</Text>
      </View>

      {/* Barra de busqueda */}
      <View style={styles.searchContainer}>
        <View style={styles.searchInputContainer}>
          <Search size={20} color={theme.textMuted} />
          <TextInput
            style={styles.searchInput}
            placeholder="Buscar conversaciones..."
            placeholderTextColor={theme.textMuted}
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
            <MessageCircle size={48} color={theme.textMuted} />
            <Text style={styles.emptyStateTitle}>Sin conversaciones</Text>
            <Text style={styles.emptyStateText}>
              Tus mensajes con asesores e inquilinos aparecerán aquí
            </Text>
          </View>
        }
      />
    </AppScreen>
  )
}

const createStyles = (theme: ReturnType<typeof useAppTheme>['theme']) => StyleSheet.create({
  header: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.xxl,
    borderBottomWidth: 1,
    borderBottomColor: theme.border,
  },
  headerTitle: {
    fontSize: typography.h2.fontSize,
    fontWeight: '700',
    color: theme.text,
  },
  searchContainer: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  searchInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: borderRadius.lg,
    paddingHorizontal: spacing.md,
    borderWidth: 1,
    backgroundColor: theme.surface,
    borderColor: theme.border,
  },
  searchInput: {
    flex: 1,
    paddingVertical: spacing.sm,
    paddingLeft: spacing.sm,
    fontSize: typography.body.fontSize,
    color: theme.text,
  },
  listContent: {
    padding: spacing.md,
    gap: spacing.sm,
  },
  conversationCard: {
    flexDirection: 'row',
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    borderWidth: 1,
  },
  avatarContainer: {
    position: 'relative',
    marginRight: spacing.md,
  },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: borderRadius.full,
    justifyContent: 'center',
    alignItems: 'center',
  },
  unreadBadge: {
    position: 'absolute',
    top: -2,
    right: -2,
    backgroundColor: theme.error,
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
    flex: 1,
  },
  conversationTime: {
    fontSize: typography.caption.fontSize,
    marginLeft: spacing.sm,
  },
  propertyInfo: {
    fontSize: typography.caption.fontSize,
    marginTop: 2,
  },
  lastMessage: {
    fontSize: typography.bodySmall.fontSize,
    marginTop: spacing.xs,
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
    marginTop: spacing.md,
    color: theme.text,
  },
  emptyStateText: {
    fontSize: typography.body.fontSize,
    marginTop: spacing.xs,
    textAlign: 'center',
    paddingHorizontal: spacing.xl,
    color: theme.textMuted,
  },
})
