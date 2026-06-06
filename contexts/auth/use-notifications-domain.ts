import { useActivityDomain } from './use-activity-domain'
import { useSessionDomain } from './use-session-domain'
import { formatNotificationTime } from '@/lib/services/messaging-domain'

export function useNotificationsDomain() {
  const { currentUser } = useSessionDomain()
  const {
    notifications,
    unreadNotificationsCount,
    markNotificationAsRead,
    markAllUserNotificationsAsRead,
  } = useActivityDomain()

  return {
    currentUser,
    notifications,
    unreadCount: unreadNotificationsCount,
    markAsRead: markNotificationAsRead,
    markAllAsRead: markAllUserNotificationsAsRead,
    formatTime: formatNotificationTime,
  }
}

export default useNotificationsDomain
