import {
  getFilteredAppointmentActivityRecords,
  getFilteredLeadActivityRecords,
} from '@/lib/api'
import type { Appointment, Notification, PropertyLead } from '@/lib/types'

type ActivityParams = {
  currentUserId?: string | null
  isAdmin: boolean
  isAgent: boolean
  isClient: boolean
}

export function getUserLeads(params: ActivityParams): PropertyLead[] {
  return getFilteredLeadActivityRecords(params)
}

export function getUserAppointments(params: ActivityParams): Appointment[] {
  return getFilteredAppointmentActivityRecords(params)
}

export function getUserNotifications(
  notifications: Notification[],
  currentUserId?: string | null
): Notification[] {
  return notifications.filter(notification => notification.userId === currentUserId)
}

export function getUnreadNotificationsCount(notifications: Notification[]): number {
  return notifications.filter(notification => !notification.read).length
}

export function markNotificationAsReadById(
  notifications: Notification[],
  id: string
): Notification[] {
  return notifications.map(notification =>
    notification.id === id ? { ...notification, read: true } : notification
  )
}

export function markAllNotificationsAsRead(
  notifications: Notification[],
  currentUserId?: string | null
): Notification[] {
  return notifications.map(notification =>
    notification.userId === currentUserId ? { ...notification, read: true } : notification
  )
}
