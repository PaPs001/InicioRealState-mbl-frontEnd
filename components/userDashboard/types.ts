export type AppointmentPreviewItem = {
  id?: string
  appointmentType?: string | null
  property: string
  client: string
  adviser: string
  day: string
  time: string
  status: string
  sortTime: number
}

export type DashboardTone = 'neutral' | 'warning' | 'danger' | 'success'

export type DashboardPriority = {
  id: string
  value: number
  label: string
}

export type DashboardMetric = {
  id: string
  value: number
  label: string
  tone: DashboardTone
}

export type DashboardLeadAlert = {
  id: string
  message: string
}
