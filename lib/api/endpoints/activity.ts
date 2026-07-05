import type { Appointment, Notification, PropertyLead } from '@/lib/types'

type ActivityParams = {
  currentUserId?: string | null
  isAdmin: boolean
  isAgent: boolean
  isClient: boolean
}

export function getLeadActivityRecords(): PropertyLead[] {
  return []
}

export function getAppointmentActivityRecords(): Appointment[] {
  return []
}

export function getNotificationActivityRecords(): Notification[] {
  return []
}

export function getFilteredLeadActivityRecords(params: ActivityParams): PropertyLead[] {
  const { currentUserId, isAdmin, isAgent } = params

  if (!isAgent && !isAdmin) {
    return []
  }

  return getLeadActivityRecords().filter((lead) => isAdmin || lead.agentId === currentUserId)
}

export function getFilteredAppointmentActivityRecords(params: ActivityParams): Appointment[] {
  const { currentUserId, isAdmin, isAgent, isClient } = params

  return getAppointmentActivityRecords().filter((appointment) => {
    if (isClient) return appointment.userId === currentUserId
    if (isAgent || isAdmin) return isAdmin || appointment.agentId === currentUserId
    return false
  })
}
