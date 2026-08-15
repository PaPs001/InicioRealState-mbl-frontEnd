import { useMemo, useState, useCallback, useEffect, useRef } from 'react'

import { getBackendLeadRecords, getNotificationActivityRecords } from '@/lib/api'
import type { Notification, PropertyLead } from '@/lib/types'
import {
  getUnreadNotificationsCount,
  getUserAppointments,
  getUserLeads,
  getUserNotifications,
  markAllNotificationsAsRead,
  markNotificationAsReadById,
} from '@/lib/services/activity-domain'

type ActivityStateParams = {
  authToken?: string | null
  currentUserId?: string | null
  isAdmin: boolean
  isAgent: boolean
  isClient: boolean
}

export function useActivityState(params: ActivityStateParams) {
  const { authToken, currentUserId, isAdmin, isAgent, isClient } = params
  const [notifications, setNotifications] = useState<Notification[]>(() => getNotificationActivityRecords())
  const [backendLeads, setBackendLeads] = useState<PropertyLead[] | null>(null)
  const isLoadingBackendLeadsRef = useRef(false)
  const hasLoadedBackendLeadsRef = useRef(false)

  useEffect(() => {
    let isMounted = true

    if (!authToken || (!isAgent && !isAdmin)) {
      setBackendLeads(null)
      hasLoadedBackendLeadsRef.current = false
      return
    }
    if (hasLoadedBackendLeadsRef.current) {
      return () => {
        isMounted = false
      }
    }

    if (isLoadingBackendLeadsRef.current) {
      return () => {
        isMounted = false
      }
    }

    hasLoadedBackendLeadsRef.current = true
    console.info('[ActivityState][initial-load]', { service: 'backend-leads' })
    isLoadingBackendLeadsRef.current = true
    getBackendLeadRecords(authToken)
      .then((leads) => {
        if (isMounted) {
          setBackendLeads(leads)
        }
      })
      .catch((error) => {
        console.error('Error cargando leads reales:', error)
        if (isMounted) {
          setBackendLeads(null)
        }
      })
      .finally(() => {
        isLoadingBackendLeadsRef.current = false
      })

    return () => {
      isMounted = false
    }
  }, [authToken, isAdmin, isAgent])

  const userLeads = useMemo(
    () => {
      if (backendLeads) {
        return backendLeads
      }

      return getUserLeads({
        currentUserId,
        isAdmin,
        isAgent,
        isClient,
      })
    },
    [backendLeads, currentUserId, isAdmin, isAgent, isClient],
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
