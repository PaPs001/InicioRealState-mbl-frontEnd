import { mockLeads, mockUsers } from '@/lib/mock-data'
import type { LeadFollowUp, PropertyLead, User } from '@/lib/types'
import { coreApi } from '../client'

const createdLeadsStore = new Map<string, PropertyLead>()
const followUpsStore = new Map<string, LeadFollowUp[]>()

type BackendLead = {
  _id?: string
  id?: string | null
  sourceId?: string | null
  clientName?: string | null
  name?: string | null
  status?: string | null
  phone?: string | null
  dateFirstContact?: string | Date | null
  campaign?: string | null
  typeOfOperation?: 'FOR RENT' | 'FOR SALE' | string | null
  leadOrigin?: string | null
  propertyOfInterestId?: string | null
  acquiredPropertyId?: string | null
  email?: string | null
  advisor?: string | { _id?: string | null; id?: string | null; name?: string | null; fullName?: string | null } | null
  advisorId?: string | null
  assignedAgentName?: string | null
  agentId?: string | null
  agentName?: string | null
  source?: string | null
  followUps?: BackendFollowUp[] | null
  createdAt?: string | Date | null
  updatedAt?: string | Date | null
}

type BackendFollowUp = {
  _id?: string
  id?: string | null
  leadId?: string | null
  clientId?: string | null
  client?: string | null
  numberOfollow?: string | null
  followUp?: string | null
  contactDate?: string | Date | null
  contactType?: string | null
  contactResult?: string | null
  rawContactResult?: string | null
  contactSummary?: string | null
  summary?: string | null
  summaryContact?: string | null
  commintContact?: string | null
  nextContact?: string | Date | null
  nextAction?: string | null
}

type GetBackendLeadRecordsOptions = {
  includeFollowUps?: boolean
}

export type CreateBackendLeadFollowUpPayload = {
  id: string
  numberOfollow: string
  clientId: string
  contactDate: string
  contactType: 'call' | 'whatsapp' | 'app' | 'page' | 'email'
  contactResult:
    | 'noAnswer'
    | 'contactMade'
    | 'appointmentScheduled'
    | 'informationRequested'
    | 'followUpInTwoWeeks'
    | 'reserved'
    | 'signed'
    | 'notInterested'
    | 'documentSent'
  contactSummary: string
  nextContact: string
  nextAction: string
}

const backendStatusToLeadStatus: Record<string, PropertyLead['status']> = {
  new: 'nuevo',
  contacted: 'contactado',
  qualified: 'contactado',
  visitScheduled: 'cita_agendada',
  negotiation: 'negociando',
  reserved: 'negociando',
  won: 'cerrado',
  lost: 'descartado',
  duplicate: 'descartado',
  disqualified: 'descartado',
  spam: 'descartado',
}

function normalizeDate(value?: string | Date | null) {
  if (!value) return new Date().toISOString()
  return value instanceof Date ? value.toISOString() : value
}

function mapBackendContactType(value?: string | null): LeadFollowUp['type'] {
  if (value === 'call' || value === 'whatsapp' || value === 'email') return value
  if (value === 'app') return 'meeting'
  if (value === 'page') return 'visit'
  return 'whatsapp'
}

function getBackendAdvisorId(lead: BackendLead) {
  if (typeof lead.advisor === 'string') return lead.advisor
  return lead.advisor?.id || lead.advisor?._id || lead.advisorId || lead.agentId || ''
}

function getBackendAdvisorName(lead: BackendLead) {
  if (typeof lead.advisor === 'object' && lead.advisor) {
    return lead.advisor.name || lead.advisor.fullName || undefined
  }

  return lead.assignedAgentName || lead.agentName || undefined
}

export function mapBackendLeadToPropertyLead(lead: BackendLead): PropertyLead {
  const propertyId = lead.propertyOfInterestId || lead.acquiredPropertyId || ''
  const firstContactDate = normalizeDate(lead.dateFirstContact || lead.createdAt)
  const typeOfOperation = lead.typeOfOperation?.toUpperCase()
  const advisorId = getBackendAdvisorId(lead)

  return {
    id: lead.id || lead.sourceId || lead._id || `lead-${Date.now()}`,
    propertyId,
    agentId: advisorId,
    advisorId,
    assignedAgentName: getBackendAdvisorName(lead),
    name: lead.clientName || lead.name || 'Lead sin nombre',
    phone: lead.phone || '',
    email: lead.email || undefined,
    status: backendStatusToLeadStatus[lead.status || ''] ?? 'nuevo',
    source: lead.leadOrigin || lead.source || lead.campaign || 'Backend',
    contactType: 'whatsapp',
    searchIntent: typeOfOperation === 'FOR RENT' ? 'rent' : 'sale',
    notes: lead.campaign ? `Campana: ${lead.campaign}` : undefined,
    createdDate: normalizeDate(lead.createdAt || firstContactDate),
    firstContactDate,
    lastContactDate: lead.updatedAt ? normalizeDate(lead.updatedAt) : undefined,
    followUps: (lead.followUps ?? []).map(mapBackendFollowUpToLeadFollowUp),
  }
}

export function mapBackendFollowUpToLeadFollowUp(followUp: BackendFollowUp): LeadFollowUp {
  const leadId = followUp.leadId || followUp.clientId || followUp.client || undefined
  const notes = followUp.contactSummary || followUp.summary || followUp.followUp || 'Seguimiento sin notas'

  return {
    id: followUp.id || followUp._id || `follow-${Date.now()}`,
    leadId,
    clientId: followUp.clientId || followUp.client || leadId,
    followNumber: followUp.numberOfollow || followUp.followUp || undefined,
    date: normalizeDate(followUp.contactDate),
    type: mapBackendContactType(followUp.contactType),
    result: followUp.contactResult || followUp.rawContactResult || undefined,
    notes,
    nextAction: followUp.nextAction || undefined,
    nextActionDate: followUp.nextContact ? normalizeDate(followUp.nextContact) : undefined,
  }
}
export async function getBackendLeadRecords(
  token?: string | null,
  options: GetBackendLeadRecordsOptions = {},
): Promise<PropertyLead[]> {
  const query = options.includeFollowUps ? '?includeFollowUps=true' : ''
  const leads = await coreApi<BackendLead[]>(`/leads/lead${query}`, {
    token: token ?? undefined,
  })

  return leads.map(mapBackendLeadToPropertyLead)
}

export async function getBackendLeadFollowUps(
  leadId: string,
  token?: string | null,
): Promise<LeadFollowUp[]> {
  const followUps = await coreApi<BackendFollowUp[]>(`/leads/lead/${leadId}/getFollows`, {
    token: token ?? undefined,
  })

  return followUps.map(mapBackendFollowUpToLeadFollowUp)
}

export async function createBackendLeadFollowUp(
  leadId: string,
  payload: CreateBackendLeadFollowUpPayload,
  token?: string | null,
): Promise<LeadFollowUp> {
  const followUp = await coreApi<BackendFollowUp>(`/leads/lead/${leadId}/followup`, {
    method: 'POST',
    token: token ?? undefined,
    body: payload,
  })

  return mapBackendFollowUpToLeadFollowUp(followUp)
}

function applyLeadOverlays(lead: PropertyLead): PropertyLead {
  return {
    ...lead,
    followUps: followUpsStore.get(lead.id) ?? lead.followUps ?? [],
  }
}

export function getLeadRecords(baseLeads: PropertyLead[] = mockLeads): PropertyLead[] {
  const createdLeads = Array.from(createdLeadsStore.values())
  const createdIds = new Set(createdLeads.map((lead) => lead.id))

  return [
    ...createdLeads.map(applyLeadOverlays),
    ...baseLeads.filter((lead) => !createdIds.has(lead.id)).map(applyLeadOverlays),
  ]
}

export function getLeadAgents(): User[] {
  return mockUsers.filter((user) => user.systemRole === 'AGENT')
}

export function getLeadAgentById(agentId?: string | null): User | null {
  if (!agentId) {
    return null
  }

  return mockUsers.find((user) => user.id === agentId) ?? null
}

export function createLeadRecord(lead: PropertyLead) {
  createdLeadsStore.set(lead.id, lead)
  return lead
}

export function getLeadRecordById(id: string, baseLeads: PropertyLead[] = mockLeads) {
  return getLeadRecords(baseLeads).find((lead) => lead.id === id)
}

export function saveLeadFollowUps(leadId: string, followUps: LeadFollowUp[]) {
  followUpsStore.set(leadId, followUps)

  const createdLead = createdLeadsStore.get(leadId)
  if (createdLead) {
    createdLeadsStore.set(leadId, { ...createdLead, followUps })
  }

  return followUps
}
