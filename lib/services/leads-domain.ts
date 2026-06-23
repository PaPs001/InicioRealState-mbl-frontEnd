import {
  createLeadRecord,
  getLeadAgentById,
  getLeadAgents,
  getLeadRecordById,
  getLeadRecords,
  saveLeadFollowUps,
} from '@/lib/api'
import { formatDate } from '@/lib/utils'
import type {
  LeadContactType,
  LeadFollowUp,
  LeadSearchIntent,
  Property,
  PropertyLead,
  User,
} from '@/lib/types'

export const leadStatusLabels: Record<string, { label: string; color: string }> = {
  nuevo: { label: 'Nuevo', color: '#22c55e' },
  contactado: { label: 'Contactado', color: '#3b82f6' },
  cita_agendada: { label: 'Cita agendada', color: '#a855f7' },
  visitado: { label: 'Visitado', color: '#f59e0b' },
  negociando: { label: 'Negociando', color: '#ec4899' },
  cerrado: { label: 'Cerrado', color: '#10b981' },
  descartado: { label: 'Descartado', color: '#6b7280' },
}

export const leadContactTypeLabels: Record<LeadContactType, string> = {
  call: 'Llamada',
  whatsapp: 'WhatsApp',
  email: 'Correo',
  visit: 'Visita',
  meeting: 'Reunión',
}

export const leadSearchIntentLabels: Record<LeadSearchIntent, string> = {
  sale: 'Compra',
  rent: 'Renta',
}

export type LeadScope = 'mine' | 'team'

export type NewLeadForm = {
  source: string
  propertyId: string
  phone: string
  name: string
  email: string
  firstContactDate: string
  contactType: LeadContactType
  searchIntent: LeadSearchIntent
  agentId: string
}

export const initialLeadForm: NewLeadForm = {
  source: '',
  propertyId: '',
  phone: '',
  name: '',
  email: '',
  firstContactDate: new Date().toISOString().slice(0, 10),
  contactType: 'whatsapp',
  searchIntent: 'sale',
  agentId: '',
}

export function getLeadStatusMeta(status: string) {
  return leadStatusLabels[status] ?? leadStatusLabels.nuevo
}

export function getLeadAgentOptions() {
  return getLeadAgents()
}

export function getLeadPropertyOptions(properties: Property[], limit = 8) {
  const seen = new Set<string>()
  return properties.filter((property) => {
    if (seen.has(property.id)) return false
    seen.add(property.id)
    return true
  }).slice(0, limit)
}

export function getLeadCollection(params: {
  isAdmin: boolean
  userLeads: PropertyLead[]
}) {
  const { isAdmin, userLeads } = params
  const baseLeads = userLeads.length > 0 ? userLeads : isAdmin ? undefined : userLeads
  return getLeadRecords(baseLeads)
}

export function getScopedLeads(params: {
  allLeads: PropertyLead[]
  currentUserId?: string | null
  isAdmin: boolean
  leadScope: LeadScope
}) {
  const { allLeads, currentUserId, isAdmin, leadScope } = params

  if (!isAdmin || leadScope === 'team') {
    return allLeads
  }

  return allLeads.filter(lead => lead.agentId === currentUserId)
}

export function filterLeads(params: {
  leads: PropertyLead[]
  searchQuery: string
  statusFilter: string
  getPropertyById: (id: string) => Property | undefined
}) {
  const { leads, searchQuery, statusFilter, getPropertyById } = params
  const normalizedSearch = searchQuery.toLowerCase()

  return leads.filter(lead => {
    const property = getPropertyById(lead.propertyId)
    const haystack = [
      lead.name,
      lead.phone,
      lead.email,
      lead.source,
      property?.title,
      lead.assignedAgentName,
    ]
      .filter(Boolean)
      .join(' ')
      .toLowerCase()

    const matchesSearch = haystack.includes(normalizedSearch)
    const matchesStatus = statusFilter === 'todos' || lead.status === statusFilter

    return matchesSearch && matchesStatus
  })
}

export function summarizeLeads(leads: PropertyLead[]) {
  const pending = leads.filter(lead =>
    ['nuevo', 'contactado', 'cita_agendada', 'visitado', 'negociando'].includes(lead.status),
  ).length
  const sale = leads.filter(lead => lead.searchIntent === 'sale').length
  const rent = leads.filter(lead => lead.searchIntent === 'rent').length

  return { total: leads.length, pending, sale, rent }
}

export function getLeadPropertyTypeLabel(type?: string) {
  switch (type) {
    case 'house':
      return 'Casa'
    case 'apartment':
      return 'Departamento'
    case 'land':
      return 'Terreno'
    default:
      return 'Sin categoría'
  }
}

export function buildLead(params: {
  form: NewLeadForm
  currentUser?: User | null
  isAdmin: boolean
}) {
  const { currentUser, form, isAdmin } = params
  const agentOptions = getLeadAgentOptions()
  const assignedAgent = agentOptions.find(agent => agent.id === (isAdmin ? form.agentId : currentUser?.id))

  const lead: PropertyLead = {
    id: `lead-local-${Date.now()}`,
    propertyId: form.propertyId,
    agentId: assignedAgent?.id ?? currentUser?.id ?? 'user-4',
    assignedAgentName: assignedAgent?.name ?? currentUser?.name ?? 'Sin asignar',
    name: form.name.trim(),
    phone: form.phone.trim(),
    email: form.email.trim() || undefined,
    status: 'nuevo',
    source: form.source.trim(),
    contactType: form.contactType,
    searchIntent: form.searchIntent,
    notes: 'Lead agregado manualmente desde la app.',
    createdDate: form.firstContactDate,
    firstContactDate: form.firstContactDate,
    followUps: [],
  }

  return createLeadRecord(lead)
}

export function findLeadById(params: {
  id: string
  isAdmin: boolean
  userLeads: PropertyLead[]
}) {
  const { id, isAdmin, userLeads } = params
  return getLeadRecordById(id, isAdmin ? undefined : userLeads)
}

export function getAssignedAgentById(agentId?: string | null) {
  return getLeadAgentById(agentId)
}

export function createLeadFollowUp(params: {
  leadId: string
  type: LeadFollowUp['type']
  notes: string
}) {
  const { leadId, notes, type } = params
  const now = new Date()

  return {
    id: `${leadId}-fu-${Date.now()}`,
    date: formatDate(now.toISOString()),
    type,
    notes: notes.trim(),
  } satisfies LeadFollowUp
}

export function appendLeadFollowUp(params: {
  leadId: string
  followUp: LeadFollowUp
  isAdmin: boolean
  userLeads: PropertyLead[]
}) {
  const { followUp, leadId, isAdmin, userLeads } = params
  const lead = findLeadById({ id: leadId, isAdmin, userLeads })
  const currentFollowUps = lead?.followUps ?? []
  const nextFollowUps = [followUp, ...currentFollowUps]

  return saveLeadFollowUps(leadId, nextFollowUps)
}
