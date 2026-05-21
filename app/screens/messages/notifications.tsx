import { useState, useMemo } from 'react'
import { 
  View, 
  Text, 
  StyleSheet, 
  FlatList, 
  TouchableOpacity,
} from 'react-native'
import { useRouter } from 'expo-router'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useAuth } from '@/contexts/AuthContext'
import { colors, spacing, typography, borderRadius } from '@/lib/theme'
import { mockNotifications } from '@/lib/mock-data'
import type { Notification } from '@/lib/types'
import { 
  ArrowLeft,
  Bell,
  CheckCircle,
  AlertCircle,
  Info,
  AlertTriangle,
  Check,
} from 'lucide-react-native'

export default function NotificationsScreen() {
  const { currentUser } = useAuth()
  const router = useRouter()
  const [notifications, setNotifications] = useState(mockNotifications)

  const userNotifications = useMemo(() => {
    if (!currentUser) return []
    return notifications.filter(n => n.userId === currentUser.id)
  }, [currentUser, notifications])

  const unreadCount = useMemo(() => {
    return userNotifications.filter(n => !n.read).length
  }, [userNotifications])

  const markAsRead = (notificationId: string) => {
    setNotifications(prev => 
      prev.map(n => 
        n.id === notificationId ? { ...n, read: true } : n
      )
    )
  }

  const markAllAsRead = () => {
    setNotifications(prev => 
      prev.map(n => 
        n.userId === currentUser?.id ? { ...n, read: true } : n
      )
    )
  }

  const getNotificationIcon = (type: Notification['type']) => {
    switch (type) {
      case 'success': return CheckCircle
      case 'warning': return AlertTriangle
      case 'error': return AlertCircle
      default: return Info
    }
  }

  const getNotificationColor = (type: Notification['type']) => {
    switch (type) {
      case 'success': return colors.success
      case 'warning': return colors.warning
      case 'error': return colors.error
      default: return colors.info
    }
  }

  const formatTime = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffMs = now.getTime() - date.getTime()
    const diffMins = Math.floor(diffMs / (1000 * 60))
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60))
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))

    if (diffMins < 60) {
      return `Hace ${diffMins} min`
    } else if (diffHours < 24) {
      return `Hace ${diffHours}h`
    } else if (diffDays < 7) {
      return `Hace ${diffDays}d`
    } else {
      return date.toLocaleDateString('es-MX', { day: 'numeric', month: 'short' })
    }
  }

  const renderNotificationItem = ({ item: notification }: { item: Notification }) => {
    const Icon = getNotificationIcon(notification.type)
    const iconColor = getNotificationColor(notification.type)

    return (
      <TouchableOpacity 
        style={[
          styles.notificationCard,
          !notification.read && styles.notificationCardUnread
        ]}
        onPress={() => markAsRead(notification.id)}
        activeOpacity={0.7}
      >
        <View style={[styles.iconContainer, { backgroundColor: `${iconColor}15` }]}>
          <Icon size={24} color={iconColor} />
        </View>

        <View style={styles.notificationContent}>
          <View style={styles.notificationHeader}>
            <Text style={styles.notificationTitle} numberOfLines={1}>
              {notification.title}
            </Text>
            {!notification.read && <View style={styles.unreadDot} />}
          </View>
          <Text style={styles.notificationMessage} numberOfLines={2}>
            {notification.message}
          </Text>
          <Text style={styles.notificationTime}>
            {formatTime(notification.createdAt)}
          </Text>
        </View>
      </TouchableOpacity>
    )
  }

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <ArrowLeft size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Notificaciones</Text>
        {unreadCount > 0 ? (
          <TouchableOpacity 
            style={styles.markReadButton}
            onPress={markAllAsRead}
          >
            <Check size={20} color={colors.accent} />
          </TouchableOpacity>
        ) : (
          <View style={styles.headerPlaceholder} />
        )}
      </View>

      {/* Contador de no leidos */}
      {unreadCount > 0 && (
        <View style={styles.unreadBanner}>
          <Text style={styles.unreadBannerText}>
            {unreadCount} {unreadCount === 1 ? 'notificacion sin leer' : 'notificaciones sin leer'}
          </Text>
        </View>
      )}

      {/* Lista de notificaciones */}
      <FlatList
        data={userNotifications}
        renderItem={renderNotificationItem}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Bell size={48} color={colors.textMuted} />
            <Text style={styles.emptyStateTitle}>Sin notificaciones</Text>
            <Text style={styles.emptyStateText}>
              Las notificaciones sobre tus propiedades y citas apareceran aqui
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
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xxl,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: borderRadius.full,
    backgroundColor: colors.surface,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: typography.h3.fontSize,
    fontWeight: '700',
    color: colors.text,
  },
  headerPlaceholder: {
    width: 40,
  },
  markReadButton: {
    width: 40,
    height: 40,
    borderRadius: borderRadius.full,
    backgroundColor: colors.surface,
    justifyContent: 'center',
    alignItems: 'center',
  },
  unreadBanner: {
    backgroundColor: colors.accent + '20',
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
  },
  unreadBannerText: {
    fontSize: typography.bodySmall.fontSize,
    color: colors.primary,
    fontWeight: '500',
    textAlign: 'center',
  },
  listContent: {
    padding: spacing.md,
    gap: spacing.sm,
  },
  notificationCard: {
    flexDirection: 'row',
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
  },
  notificationCardUnread: {
    backgroundColor: colors.accent + '08',
    borderColor: colors.accent + '30',
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: borderRadius.full,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.md,
  },
  notificationContent: {
    flex: 1,
  },
  notificationHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  notificationTitle: {
    fontSize: typography.body.fontSize,
    fontWeight: '600',
    color: colors.text,
    flex: 1,
  },
  unreadDot: {
    width: 8,
    height: 8,
    borderRadius: borderRadius.full,
    backgroundColor: colors.accent,
  },
  notificationMessage: {
    fontSize: typography.bodySmall.fontSize,
    color: colors.textSecondary,
    marginTop: spacing.xs,
  },
  notificationTime: {
    fontSize: typography.caption.fontSize,
    color: colors.textMuted,
    marginTop: spacing.sm,
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
