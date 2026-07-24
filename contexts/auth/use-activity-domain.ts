import { useAuth } from '../AuthContext'
import type { ActivityDomain } from './types'

export function useActivityDomain(): ActivityDomain {
  const {
    userLeads,
    userAppointments,
    notifications,
    markNotificationAsRead,
    markAllUserNotificationsAsRead,
    unreadNotificationsCount,
  } = useAuth()

  return {
    userLeads,
    userAppointments,
    notifications,
    markNotificationAsRead,
    markAllUserNotificationsAsRead,
    unreadNotificationsCount,
  }
}

export default useActivityDomain
