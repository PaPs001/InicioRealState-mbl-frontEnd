import { useMemo, useState, useCallback } from 'react'

import { getNotificationActivityRecords } from '@/lib/api'
import type { Notification } from '@/lib/types'
import {
  getUnreadNotificationsCount,
  getUserAppointments,
  getUserLeads,
  getUserNotifications,
  markAllNotificationsAsRead,
  markNotificationAsReadById,
} from '@/lib/services/activity-domain'

type ActivityStateParams = {
  currentUserId?: string | null
  isAdmin: boolean
  isAgent: boolean
  isClient: boolean
}

export function useActivityState(params: ActivityStateParams) {
  const { currentUserId, isAdmin, isAgent, isClient } = params
  const [notifications, setNotifications] = useState<Notification[]>(() => getNotificationActivityRecords())

  const userLeads = useMemo(
    () =>
      getUserLeads({
        currentUserId,
        isAdmin,
        isAgent,
        isClient,
      }),
    [currentUserId, isAdmin, isAgent, isClient],
  )

  const userAppointments = useMemo(
    () =>
      getUserAppointments({
        currentUserId,
        isAdmin,
        isAgent,
        isClient,
      }),
    [currentUserId, isAdmin, isAgent, isClient],
  )

  const userNotifications = useMemo(
    () => getUserNotifications(notifications, currentUserId),
    [currentUserId, notifications],
  )

  const unreadNotificationsCount = useMemo(
    () => getUnreadNotificationsCount(userNotifications),
    [userNotifications],
  )

  const markNotificationAsRead = useCallback((id: string) => {
    setNotifications(previous => markNotificationAsReadById(previous, id))
  }, [])

  const markAllUserNotificationsAsRead = useCallback(() => {
    setNotifications(previous => markAllNotificationsAsRead(previous, currentUserId))
  }, [currentUserId])

  return {
    userLeads,
    userAppointments,
    userNotifications,
    unreadNotificationsCount,
    markNotificationAsRead,
    markAllUserNotificationsAsRead,
  }
}

export default useActivityState
