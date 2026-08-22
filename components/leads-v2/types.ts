import type { LeadV2SystemStatus, Property, PropertyLead } from '@/lib/types'

export const LEADS_PAGE_SIZE = 20

export type LeadV2Status = 'nuevo' | 'seguimiento' | 'frio' | 'congelado' | 'en_espera' | 'con_cita' | 'provisional' | 'lead_muerto' | 'lead_ganador' | 'lead_perdido' | 'spam' | 'duplicado'

export type LeadV2ViewModel = {
  id: string
  rawLead: PropertyLead
  name: string
  propertyName: string
  agentName: string
  phone?: string
  email?: string
  source: string
  channel: CoordinatorLeadV2Channel
  status: LeadV2Status
  advisorStatus: string
  statusLabel: string
  advisorStatusLabel?: string
  systemStatus?: LeadV2SystemStatus
  lastContactLabel: string
  nextActionLabel: string
}

export type LeadV2Metric = {
  id: string
  label: string
  value: number
  color: string
}

export type LeadV2Alert = {
  id: string
  icon: 'warning' | 'user' | 'clock'
  message: string
}

export type AgentLeadGroup = {
  id: string
  name: string
  leads: LeadV2ViewModel[]
  active: number
  followings: number
  pending: number
}

export type LeadV2CreateForm = {
  fullName: string
  phone: string
  email: string
  propertyOfInterestId: string
  lastContactDate: string
  estimatedBudget: string
  origin: string
  operation: string
}

export function isLeadV2CreateFormValid(form: LeadV2CreateForm) {
  return [
    form.fullName,
    form.phone,
    form.propertyOfInterestId,
    form.lastContactDate,
    form.estimatedBudget,
    form.origin,
    form.operation,
  ].every((value) => value.trim().length > 0)
}

export type LeadPropertyOption = {
  id: string
  title: string
  address: string
  city: string
  price: number
  image?: string
  status?: string
}

export type LeadsV2RouteParams = {
  selectedLeadId?: string | string[]
}

export const coordinatorLeadV2Channels = [
  'Todos',
  'Manychat',
  'Meta',
  'Google Ads',
  'Whatsapp',
] as const

export type CoordinatorLeadV2Channel = typeof coordinatorLeadV2Channels[number]

export const coordinatorLeadV2AssistantActions = [
  /*{ id: 'dictate-following', label: 'Dictar seguimiento', icon: 'mic' },
  { id: 'voice-appointment', label: 'Agendar cita por voz', icon: 'wave' },*/
  { id: 'add-lead', label: 'Agregar lead', icon: 'plus' },
] as const

export const emptyLeadV2CreateForm: LeadV2CreateForm = {
  fullName: '',
  phone: '',
  email: '',
  propertyOfInterestId: '',
  lastContactDate: '',
  estimatedBudget: '',
  origin: '',
  operation: '',
}

export type LeadV2PropertySources = {
  availableProperties: Property[]
  catalogProperties: Property[]
}
