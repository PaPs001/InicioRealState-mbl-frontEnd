import { coreApi } from '../client'

export type AppointmentType = 'renta' | 'venta' | 'general'

export interface GoogleCalendarDateTime {
  date?: string
  dateTime?: string
  timeZone?: string
}

export interface GoogleCalendarDate {
  _id?: string
  title?: string | null
  description?: string | null
  location?: string | null
  helpedBy?: string | null
  appointmentType?: string | null
  leadId?: string | null
  propertyId?: string | null
  advisorId?: string | null
  startDateTime?: string | null
  endDateTime?: string | null
  timeZone?: string | null
  status?: string | null
  source?: string | null
  syncStatus?: string | null
  googleCalendarId?: string | null
  googleEventId?: string | null
  googleHtmlLink?: string | null
}

export interface GoogleCalendarDateFilters {
  startDateTime?: string
  endDateTime?: string
  appointmentType?: string
  advisorId?: string
  leadId?: string
  propertyId?: string
  status?: string
  sync?: boolean
}

export interface CreateGoogleCalendarDatePayload {
  title: string
  startDateTime: string
  endDateTime: string
  description?: string | null
  location?: string | null
  timeZone?: string | null
  calendarId?: string | null
  helpedBy?: string | null
  leadId?: string | null
  propertyId?: string | null
  advisorId?: string | null
  appointmentType?: string | null
  colorId?: string | null
  lead?: {
    fullName: string
    phone?: string | null
    email?: string | null
  } | null
}

export interface GoogleCalendarDateLeadSummary {
  _id?: string
  id?: string | null
  fullName?: string | null
  client?: string | null
  name?: string | null
  phone?: string | null
  email?: string | null
  agentId?: string | null
  propertyOfInterestId?: string | null
  systemStatus?: string | null
  status?: string | null
  createdAt?: string | Date | null
  updatedAt?: string | Date | null
}

export interface CreateGoogleCalendarDateResponse {
  date: GoogleCalendarDate
  lead: GoogleCalendarDateLeadSummary | null
  leadResolution: {
    mode: 'existing' | 'created' | 'none'
    provisional: boolean
    duplicateWarning: boolean
    possibleDuplicates: GoogleCalendarDateLeadSummary[]
  }
}

export interface GoogleCalendarOption {
  calendarId?: string
  summary?: string
  accessRole?: string
  backgroundColor?: string
  primary?: boolean
}

export interface SelectedGoogleCalendar {
  calendarId: string
  summary?: string
  enabled?: boolean
  appointmentType?: AppointmentType
  colorId?: string | null
  primaryForCreate?: boolean
}

export interface GoogleTask {
  id?: string
  title?: string
  notes?: string
  status?: string
  due?: string
  completed?: string
  updated?: string
}

export interface GoogleTaskList {
  id?: string
  title?: string
  tasks?: GoogleTask[]
}

export interface GoogleCalendarAuthUrlResponse {
  url: string
}

export interface GoogleCalendarDisconnectResponse {
  disconnected: boolean
}

export interface GoogleCalendarSyncResponse {
  calendarsProcessed: number
  created: number
  updated: number
  conflicts: number
  skipped: number
}

export interface GoogleCalendarConnectionStatus {
  status: 'connected' | 'disconnected' | 'requires_reconnect'
  connected: boolean
  selectedCalendarsCount: number
  enabledCalendarsCount: number
}

function buildQuery(params: object) {
  const query = Object.entries(params as Record<string, string | boolean | undefined>)
    .filter(([, value]) => value !== undefined)
    .map(([key, value]) => `${encodeURIComponent(key)}=${encodeURIComponent(String(value))}`)
    .join('&')

  return query ? `?${query}` : ''
}

export function getGoogleCalendarDates(token?: string | null, filters: GoogleCalendarDateFilters = {}) {
  const query = buildQuery(filters)

  return coreApi<GoogleCalendarDate[]>(`/dates/dates${query}`, {
    token: token ?? undefined,
  })
}

export function createGoogleCalendarDate(token: string | null | undefined, payload: CreateGoogleCalendarDatePayload) {
  return coreApi<CreateGoogleCalendarDateResponse>('/dates/dates', {
    method: 'POST',
    token: token ?? undefined,
    body: payload,
  })
}

export function deleteGoogleCalendarDate(token: string | null | undefined, dateId: string) {
  return coreApi<GoogleCalendarDate>(`/dates/dates/${encodeURIComponent(dateId)}`, {
    method: 'DELETE',
    token: token ?? undefined,
  })
}

export function getGoogleCalendars(token?: string | null) {
  return coreApi<GoogleCalendarOption[]>('/dates/google/calendars', {
    token: token ?? undefined,
  })
}

export function getSelectedGoogleCalendars(token?: string | null) {
  return coreApi<SelectedGoogleCalendar[]>('/dates/google/selected-calendars', {
    token: token ?? undefined,
  })
}

export function saveSelectedGoogleCalendars(token: string | null | undefined, calendars: SelectedGoogleCalendar[]) {
  return coreApi<SelectedGoogleCalendar[]>('/dates/google/selected-calendars', {
    method: 'PUT',
    token: token ?? undefined,
    body: { calendars },
  })
}

export function syncGoogleCalendars(token?: string | null) {
  return coreApi<GoogleCalendarSyncResponse>('/dates/google/sync', {
    method: 'POST',
    token: token ?? undefined,
  })
}

export function getGoogleCalendarConnectionStatus(token?: string | null) {
  return coreApi<GoogleCalendarConnectionStatus>('/dates/auth/google/status', {
    token: token ?? undefined,
  })
}

export function getGoogleCalendarTasks(token?: string | null) {
  return coreApi<GoogleTaskList[]>('/dates/tasks', {
    token: token ?? undefined,
  })
}

export function disconnectGoogleCalendar(token?: string | null) {
  return coreApi<GoogleCalendarDisconnectResponse>('/dates/auth/google', {
    method: 'DELETE',
    token: token ?? undefined,
  })
}

export function getGoogleCalendarAuthUrl(token?: string | null, returnTo?: string) {
  const query = returnTo ? `?returnTo=${encodeURIComponent(returnTo)}` : ''

  return coreApi<GoogleCalendarAuthUrlResponse>(`/dates/auth/google${query}`, {
    token: token ?? undefined,
  })
}
