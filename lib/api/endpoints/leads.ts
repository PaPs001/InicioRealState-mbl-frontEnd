import type { LeadFollowUp, LeadV2StatusSource, LeadV2SystemStatus, PropertyLead, User } from '@/lib/types'
import { API_URLS, coreApi, fetchWithAuthRetry } from '../client'

const createdLeadsStore = new Map<string, PropertyLead>()
const followUpsStore = new Map<string, LeadFollowUp[]>()

type BackendLead = {
  _id?: string
  id?: string | null
  sourceId?: string | null
  leadNotionId?: string | null
  clientName?: string | null
  fullName?: string | null
  client?: string | null
  name?: string | null
  status?: string | null
  systemStatus?: string | null
  statusSource?: LeadV2StatusSource | null
  statusReason?: string | null
  statusUntil?: string | Date | null
  nextAction?: string | null
  nextActionAt?: string | Date | null
  nextFollowUpAt?: string | Date | null
  phone?: string | null
  dateFirstContact?: string | Date | null
  lastContactDate?: string | Date | null
  campaign?: string | null
  adsCampain?: string | null
  typeOfOperation?: 'FOR RENT' | 'FOR SALE' | string | null
  operation?: string | null
  leadOrigin?: string | null
  origin?: string | null
  propertyOfInterestId?: string | null
  estimatedBudget?: number | string | null
  acquiredPropertyId?: string | null
  email?: string | null
  advisor?: string | { _id?: string | null; id?: string | null; name?: string | null; fullName?: string | null } | null
  advisorId?: string | null
  assignedAgentName?: string | null
  agent?: string | null
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

type BackendLeadV2FollowingAttachment = {
  _id?: string
  filename?: string | null
  mime?: string | null
  size?: number | null
  storageKey?: string | null
  url?: string | null
}

type BackendLeadV2Following = {
  _id?: string
  id?: string | null
  leadId?: string | null
  authorType?: 'agent' | 'coordinator' | 'unknown' | string | null
  authorId?: string | null
  text?: string | null
  contactSummary?: string | null
  nextAction?: string | null
  attachments?: BackendLeadV2FollowingAttachment[] | null
  createdAt?: string | Date | null
  updatedAt?: string | Date | null
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

export type CreateBackendLeadV2Payload = {
  fullName?: string
  phone?: string
  email?: string
  propertyOfInterestId?: string
  lastContactDate?: string
  estimatedBudget?: number
  origin?: string
  operation?: string
  statusSource?: 'advisor' | 'coordinator' | 'system' | 'notion' | 'manychat'
}

export type UpdateBackendLeadV2Payload = Partial<{
  fullName: string
  phone: string
  email: string
  propertyOfInterestId: string
  origin: string
  operation: string
  status: string
  statusReason: string
  statusUntil: string
  nextAction: string
  nextActionAt: string
  nextFollowUpAt: string
}>

export type BackendLeadV2StatusesResponse = {
  statuses: string[]
}

export type SetBackendLeadV2StatusPayload = {
  status: string
}

export type SetBackendLeadV2StatusResponse = {
  lead: PropertyLead
  statuses: string[]
}

export type SetBackendLeadV2NextActionPayload = {
  nextAction: string
  nextActionAt: string
}
export type BackendLeadV2FollowingRecord = {
  id: string
  leadId: string
  authorType: string
  authorId?: string
  text: string
  contactSummary?: string
  nextAction?: string
  attachments: BackendLeadV2FollowingAttachment[]
  createdAt?: string
  updatedAt?: string
}

export type CreateBackendLeadV2FollowingPayload = {
  text?: string
  contactDate?: string
  contactType?: 'call' | 'whatsapp' | 'app' | 'page' | 'email' | 'visit' | 'meeting'
  contactSummary?: string
  nextAction?: string
  image?: {
    uri: string
    name: string
    type: string
  } | null
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

const validSystemStatuses = new Set<LeadV2SystemStatus>([
  'nuevo',
  'seguimiento',
  'frio',
  'congelado',
  'en_espera',
  'con_cita',
  'provisional',
  'lead_muerto',
  'lead_ganador',
  'lead_perdido',
  'spam',
  'duplicado',
])

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

function getBackendLeadSystemStatus(value?: string | null): LeadV2SystemStatus | undefined {
  const normalizedStatus = normalizeTextValue(value)
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[ -]+/g, '_')

  return validSystemStatuses.has(normalizedStatus as LeadV2SystemStatus)
    ? normalizedStatus as LeadV2SystemStatus
    : undefined
}

function normalizeOptionalDate(value?: string | Date | null) {
  if (!value) return undefined
  return value instanceof Date ? value.toISOString() : value
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

  return lead.assignedAgentName || lead.agentName || lead.agent || (typeof lead.advisor === 'string' ? lead.advisor : undefined) || undefined
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
    id: lead.id || lead.sourceId || lead.leadNotionId || lead._id || `lead-${Date.now()}`,
    leadNotionId: lead.leadNotionId || undefined,
    propertyId,
    agentId: advisorId,
    advisorId,
    assignedAgentName: getBackendAdvisorName(lead),
    name: getBackendLeadName(lead),
    phone: lead.phone || '',
    email: lead.email || undefined,
    status: getBackendLeadStatus(lead.status),
    advisorStatus: normalizeTextValue(lead.status) || undefined,
    systemStatus: getBackendLeadSystemStatus(lead.systemStatus),
    statusSource: lead.statusSource || undefined,
    statusReason: lead.statusReason || undefined,
    statusUntil: normalizeOptionalDate(lead.statusUntil),
    nextAction: normalizeTextValue(lead.nextAction) || undefined,
    nextActionAt: normalizeOptionalDate(lead.nextActionAt),
    nextFollowUpAt: normalizeOptionalDate(lead.nextFollowUpAt),
    source: getFirstMeaningfulValue(lead.origin, lead.leadOrigin, lead.source, campaign) || 'Backend',
    contactType: 'whatsapp',
    searchIntent: getBackendLeadSearchIntent(lead),
    notes,
    createdDate: normalizeDate(lead.createdAt || firstContactDate),
    firstContactDate,
    lastContactDate: lead.lastContactDate
      ? normalizeDate(lead.lastContactDate)
      : lead.updatedAt
        ? normalizeDate(lead.updatedAt)
        : undefined,
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

export async function getBackendLeadV2Records(
  token?: string | null,
): Promise<PropertyLead[]> {
  const leads = await coreApi<BackendLead[]>('/leads-v2', {
    token: token ?? undefined,
  })

  return leads.map(mapBackendLeadToPropertyLead)
}

export async function createBackendLeadV2Record(
  payload: CreateBackendLeadV2Payload,
  token?: string | null,
): Promise<PropertyLead> {
  const propertyOfInterestId = payload.propertyOfInterestId?.trim() || 'manual-lead'
  const lead = await coreApi<BackendLead>('/leads-v2', {
    method: 'POST',
    token: token ?? undefined,
    body: {
      ...payload,
      propertyOfInterestId,
      fullName: payload.fullName?.trim() || undefined,
      phone: payload.phone?.trim() || undefined,
      email: payload.email?.trim() || undefined,
      origin: payload.origin?.trim() || 'app',
      statusSource: payload.statusSource || 'advisor',
    },
  })

  return mapBackendLeadToPropertyLead(lead)
}

export async function updateBackendLeadV2Record(
  leadId: string,
  payload: UpdateBackendLeadV2Payload,
  token?: string | null,
): Promise<PropertyLead> {
  const lead = await coreApi<BackendLead>(`/leads-v2/${leadId}`, {
    method: 'PATCH',
    token: token ?? undefined,
    body: payload,
  })

  return mapBackendLeadToPropertyLead(lead)
}

export async function getBackendLeadV2Statuses(
  token?: string | null,
): Promise<string[]> {
  const response = await coreApi<BackendLeadV2StatusesResponse>('/leads-v2/statuses', {
    token: token ?? undefined,
  })

  return response.statuses
}

export async function createBackendLeadV2Status(
  status: string,
  token?: string | null,
): Promise<string[]> {
  const response = await coreApi<BackendLeadV2StatusesResponse>('/leads-v2/statuses', {
    method: 'POST',
    token: token ?? undefined,
    body: { status },
  })

  return response.statuses
}

export async function deleteBackendLeadV2Status(
  status: string,
  token?: string | null,
): Promise<string[]> {
  const response = await coreApi<BackendLeadV2StatusesResponse>('/leads-v2/statuses', {
    method: 'DELETE',
    token: token ?? undefined,
    body: { status },
  })

  return response.statuses
}

export async function setBackendLeadV2Status(
  leadId: string,
  payload: SetBackendLeadV2StatusPayload,
  token?: string | null,
): Promise<SetBackendLeadV2StatusResponse> {
  const response = await coreApi<{ lead: BackendLead; statuses: string[] }>(`/leads-v2/${leadId}/status`, {
    method: 'POST',
    token: token ?? undefined,
    body: payload,
  })

  return {
    lead: mapBackendLeadToPropertyLead(response.lead),
    statuses: response.statuses,
  }
}

export async function setBackendLeadV2NextAction(
  leadId: string,
  payload: SetBackendLeadV2NextActionPayload,
  token?: string | null,
): Promise<PropertyLead> {
  const lead = await coreApi<BackendLead>(`/leads-v2/${leadId}/next-action`, {
    method: 'POST',
    token: token ?? undefined,
    body: payload,
  })

  return mapBackendLeadToPropertyLead(lead)
}
export async function getBackendLeadV2Followings(
  leadId: string,
  token?: string | null,
): Promise<BackendLeadV2FollowingRecord[]> {
  const followings = await coreApi<BackendLeadV2Following[]>(`/leads-v2/${leadId}/followings`, {
    token: token ?? undefined,
  })

  return followings.map(mapBackendLeadV2Following)
}

export async function createBackendLeadV2Following(
  leadId: string,
  payload: CreateBackendLeadV2FollowingPayload,
  token?: string | null,
): Promise<BackendLeadV2FollowingRecord> {
  const formData = new FormData()

  formData.append('text', payload.text?.trim() || '')
  formData.append('contactDate', payload.contactDate || new Date().toISOString())
  formData.append('contactType', payload.contactType || 'app')
  formData.append('contactSummary', payload.contactSummary?.trim() || '')
  formData.append('nextAction', payload.nextAction?.trim() || '')

  if (payload.image) {
    formData.append('files', {
      uri: payload.image.uri,
      name: payload.image.name,
      type: payload.image.type,
    } as unknown as Blob)
  }

  const headers: Record<string, string> = {}
  if (API_URLS.CORE.includes('ngrok-free')) {
    headers['ngrok-skip-browser-warning'] = 'true'
  }
  if (token) {
    headers.Authorization = `Bearer ${token}`
  }

  const response = await fetchWithAuthRetry(API_URLS.CORE, `/leads-v2/${leadId}/followings`, {
    method: 'POST',
    headers,
    token,
    body: formData,
  })

  if (!response.ok) {
    let message = `Error ${response.status}`
    try {
      const data = await response.json() as { error?: string; message?: string; details?: string }
      message = data.message || data.error || data.details || message
    } catch {
      message = `${message}: ${response.statusText}`
    }
    throw new Error(message)
  }

  return mapBackendLeadV2Following(await response.json() as BackendLeadV2Following)
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

function mapBackendLeadV2Following(following: BackendLeadV2Following): BackendLeadV2FollowingRecord {
  return {
    id: following.id || following._id || `following-${Date.now()}`,
    leadId: following.leadId || '',
    authorType: following.authorType || 'unknown',
    authorId: following.authorId || undefined,
    text: following.text || '',
    contactSummary: following.contactSummary || undefined,
    nextAction: following.nextAction || undefined,
    attachments: following.attachments ?? [],
    createdAt: following.createdAt ? normalizeDate(following.createdAt) : undefined,
    updatedAt: following.updatedAt ? normalizeDate(following.updatedAt) : undefined,
  }
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
