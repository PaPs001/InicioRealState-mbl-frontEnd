import type { LeadFollowUp, PropertyLead, User } from '@/lib/types'
import { coreApi } from '../client'

const createdLeadsStore = new Map<string, PropertyLead>()
const followUpsStore = new Map<string, LeadFollowUp[]>()

type BackendLead = {
  _id?: string
  id?: string | null
  sourceId?: string | null
  clientName?: string | null
  fullName?: string | null
  client?: string | null
  name?: string | null
  status?: string | null
  phone?: string | null
  dateFirstContact?: string | Date | null
  campaign?: string | null
  adsCampain?: string | null
  typeOfOperation?: 'FOR RENT' | 'FOR SALE' | string | null
  operation?: string | null
  leadOrigin?: string | null
  origin?: string | null
  propertyOfInterestId?: string | null
  acquiredPropertyId?: string | null
  email?: string | null
  advisor?: string | { _id?: string | null; id?: string | null; name?: string | null; fullName?: string | null } | null
  advisorId?: string | null
  assignedAgentName?: string | null
  agentId?: string | null
  agentName?: string | null
  source?: string | null
  maximumBudget?: string | number | null
  maximunBudget?: string | number | null
  maxinumBudget?: string | number | null
  minimumBudget?: string | number | null
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
  nuevo: 'nuevo',
  contacted: 'contactado',
  contactado: 'contactado',
  qualified: 'contactado',
  visitScheduled: 'cita_agendada',
  citascheduled: 'cita_agendada',
  citaagendada: 'cita_agendada',
  'cita agendada': 'cita_agendada',
  negotiation: 'negociando',
  negociando: 'negociando',
  reserved: 'negociando',
  won: 'cerrado',
  cerrado: 'cerrado',
  lost: 'descartado',
  descartado: 'descartado',
  duplicate: 'descartado',
  disqualified: 'descartado',
  spam: 'descartado',
}

const EMPTY_LEAD_NAME = 'Lead sin nombre'

function normalizeDate(value?: string | Date | null) {
  if (!value) return new Date().toISOString()
  return value instanceof Date ? value.toISOString() : value
}

function normalizeTextValue(value?: string | number | null) {
  if (value === null || value === undefined) return ''
  return String(value).trim()
}

function isMeaningfulLeadName(value?: string | number | null) {
  const normalizedValue = normalizeTextValue(value)
  return Boolean(normalizedValue && normalizedValue.toLowerCase() !== EMPTY_LEAD_NAME.toLowerCase())
}

function getFirstMeaningfulValue(...values: Array<string | number | null | undefined>) {
  return values.map(normalizeTextValue).find(value => value.length > 0) || ''
}

function getBackendLeadName(lead: BackendLead) {
  const explicitName = [lead.fullName, lead.clientName, lead.name, lead.client]
    .find(isMeaningfulLeadName)

  if (explicitName) return normalizeTextValue(explicitName)

  const email = normalizeTextValue(lead.email)
  if (email) return email.split('@')[0] || email

  const phone = normalizeTextValue(lead.phone)
  if (phone) return `Lead ${phone}`

  return EMPTY_LEAD_NAME
}

function getBackendLeadStatus(value?: string | null): PropertyLead['status'] {
  const normalizedStatus = normalizeTextValue(value)
  const statusKey = normalizedStatus
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[_-]+/g, ' ')

  return backendStatusToLeadStatus[statusKey] ?? backendStatusToLeadStatus[normalizedStatus] ?? 'nuevo'
}

function getBackendLeadSearchIntent(lead: BackendLead): PropertyLead['searchIntent'] {
  const operation = getFirstMeaningfulValue(lead.typeOfOperation, lead.operation).toLowerCase()
  if (operation.includes('rent') || operation.includes('renta')) return 'rent'
  return 'sale'
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

  return lead.assignedAgentName || lead.agentName || (typeof lead.advisor === 'string' ? lead.advisor : undefined) || undefined
}

export function mapBackendLeadToPropertyLead(lead: BackendLead): PropertyLead {
  const propertyId = lead.propertyOfInterestId || lead.acquiredPropertyId || ''
  const firstContactDate = normalizeDate(lead.dateFirstContact || lead.createdAt)
  const advisorId = getBackendAdvisorId(lead)
  const campaign = getFirstMeaningfulValue(lead.campaign, lead.adsCampain)
  const budget = getFirstMeaningfulValue(lead.maximumBudget, lead.maximunBudget, lead.maxinumBudget, lead.minimumBudget)
  const notes = [
    campaign ? `Campana: ${campaign}` : null,
    budget ? `Presupuesto: ${budget}` : null,
  ].filter(Boolean).join('\n') || undefined

  return {
    id: lead.id || lead.sourceId || lead._id || `lead-${Date.now()}`,
    propertyId,
    agentId: advisorId,
    advisorId,
    assignedAgentName: getBackendAdvisorName(lead),
    name: getBackendLeadName(lead),
    phone: lead.phone || '',
    email: lead.email || undefined,
    status: getBackendLeadStatus(lead.status),
    source: getFirstMeaningfulValue(lead.origin, lead.leadOrigin, lead.source, campaign) || 'Backend',
    contactType: 'whatsapp',
    searchIntent: getBackendLeadSearchIntent(lead),
    notes,
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

export function getLeadRecords(baseLeads: PropertyLead[] = []): PropertyLead[] {
  const createdLeads = Array.from(createdLeadsStore.values())
  const createdIds = new Set(createdLeads.map((lead) => lead.id))

  return [
    ...createdLeads.map(applyLeadOverlays),
    ...baseLeads.filter((lead) => !createdIds.has(lead.id)).map(applyLeadOverlays),
  ]
}

export function getLeadAgents(): User[] {
  return []
}

export function getLeadAgentById(agentId?: string | null): User | null {
  if (!agentId) {
    return null
  }

  return null
}

export function createLeadRecord(lead: PropertyLead) {
  createdLeadsStore.set(lead.id, lead)
  return lead
}

export function getLeadRecordById(id: string, baseLeads: PropertyLead[] = []) {
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
