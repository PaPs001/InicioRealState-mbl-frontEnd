import type { LeadStatus, PropertyLead } from '@/lib/types'
import type {
  AgentLeadGroup,
  LeadV2Alert,
  LeadV2Metric,
  LeadV2ViewModel,
} from '@/modules/users/leads/types'

import { isClosedLeadStatus, isLeadStatus } from '../constants/lead-tracking-statuses'
import { getLeadOrigin, type LeadOrigin } from '../constants/lead-origins'

export type LeadV2ScreenMode = 'coordinator' | 'advisor'

export function normalizeSearch(value: string) {
  return value.trim().toLowerCase()
}

export function getParamValue(value?: string | string[]) {
  if (Array.isArray(value)) return value[0] ?? ''
  return value ?? ''
}

export function getLeadPropertyLabel(lead: Pick<PropertyLead, 'propertyId'>): string {
  const id = lead.propertyId?.trim()
  return id && id !== 'manual-lead' ? `ID de propiedad: ${id}` : 'Sin propiedad asignada'
}

export function mapPropertyLeadToLeadV2ViewModel(
  lead: PropertyLead,
  _mode: LeadV2ScreenMode,
): LeadV2ViewModel {
  return {
    id: lead.id,
    rawLead: lead,
    name: lead.name,
    propertyName: getLeadPropertyLabel(lead),
    agentName: lead.assignedAgentName || 'Sin asesor',
    phone: lead.phone,
    email: lead.email,
    source: lead.source || 'Backend',
    channel: getLeadChannel(lead),
    status: lead.status,
    statusLabel: formatLeadStatus(lead.status),
    lastContactLabel: getLastContactLabel(lead),
    nextActionLabel: lead.nextAction || lead.notes || 'Sin accion definida',
  }
}

export function getLeadChannel(lead: PropertyLead): LeadOrigin | null {
  return getLeadOrigin(lead.source)
}

export function getLastContactLabel(lead: PropertyLead) {
  const date = lead.lastContactDate || lead.firstContactDate || lead.createdDate
  if (!date) return 'Sin contacto registrado'

  const days = getDaysSince(date)
  if (days === null) return 'Ultimo contacto sin fecha'
  if (days === 0) return 'Ultimo contacto hoy'
  if (days === 1) return 'Ultimo contacto ayer'
  return `Ultimo contacto hace ${days} dias`
}

export function getDaysSince(value?: string) {
  if (!value) return null
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return null
  return Math.max(0, Math.floor((Date.now() - date.getTime()) / 86400000))
}

export function buildAgentLeadGroups(leads: LeadV2ViewModel[]): AgentLeadGroup[] {
  const groups = leads.reduce<Map<string, LeadV2ViewModel[]>>((currentGroups, lead) => {
    currentGroups.set(lead.agentName, [...(currentGroups.get(lead.agentName) ?? []), lead])
    return currentGroups
  }, new Map<string, LeadV2ViewModel[]>())

  return Array.from(groups.entries())
    .map(([name, agentLeads]) => {
      const active = agentLeads.filter((lead) => !isClosedLeadStatus(lead.status))
      const pending = active.filter((lead) => lead.nextActionLabel !== 'Sin accion definida')

      return {
        id: normalizeSearch(name).replace(/\s+/g, '-'),
        name,
        leads: agentLeads,
        active: active.length,
        followings: active.filter((lead) => isLeadStatus(lead.status, 'EN SEGUIMIENTO', 'seguimiento', 'negociando', 'negotiation')).length,
        pending: pending.length,
      }
    })
    .sort((current, next) =>
      next.leads.length - current.leads.length ||
      current.name.localeCompare(next.name),
    )
}

export function buildLeadV2Metrics(leads: LeadV2ViewModel[]): LeadV2Metric[] {
  const activeLeads = leads.filter((lead) => !isClosedLeadStatus(lead.status))
  const inProgressLeads = activeLeads.filter((lead) => isLeadStatus(lead.status, 'EN SEGUIMIENTO', 'seguimiento', 'negociando', 'negotiation'))
  const appointmentLeads = activeLeads.filter((lead) => isLeadStatus(lead.status, 'con_cita', 'cita_agendada', 'visitado', 'visitScheduled'))
  const coldLeads = activeLeads.filter((lead) => isLeadStatus(lead.status, 'SIN RESPUESTA', 'frio', 'congelado', 'lead_muerto'))

  return [
    { id: 'active-leads', label: 'Leads Activos', value: activeLeads.length, color: '#0d4f3f' },
    { id: 'followed-leads', label: 'En seguimiento', value: inProgressLeads.length, color: '#d09c3d' },
    { id: 'cold-leads', label: 'Requieren atencion', value: coldLeads.length, color: '#c8655f' },
    { id: 'appointments', label: 'Citas proximas', value: appointmentLeads.length, color: '#0a3f34' },
  ]
}

export function buildLeadV2Alerts(leads: LeadV2ViewModel[]): LeadV2Alert[] {
  const activeLeads = leads.filter((lead) => !isClosedLeadStatus(lead.status))
  const coldLeads = activeLeads.filter((lead) => isLeadStatus(lead.status, 'frio'))
  const frozenLeads = activeLeads.filter((lead) => isLeadStatus(lead.status, 'congelado'))
  const deadLeads = activeLeads.filter((lead) => isLeadStatus(lead.status, 'lead_muerto'))
  const withoutAdvisor = activeLeads.filter((lead) => lead.agentName === 'Sin asesor')

  return [
    deadLeads.length ? { id: 'dead-leads', icon: 'warning', message: `${deadLeads.length} leads muertos requieren accion` } : null,
    frozenLeads.length ? { id: 'frozen-leads', icon: 'warning', message: `${frozenLeads.length} leads congelados requieren revision` } : null,
    coldLeads.length ? { id: 'cold-leads', icon: 'warning', message: `${coldLeads.length} leads frios requieren revision` } : null,
    withoutAdvisor.length ? { id: 'pending-agent', icon: 'user', message: `${withoutAdvisor.length} leads sin asesor confirmado` } : null,
  ].filter(Boolean) as LeadV2Alert[]
}

export function getAvatarUrl(name: string) {
  return `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=EDE7DC&color=0F362B&size=128&bold=true`
}

export function formatLeadStatus(status: LeadStatus) {
  return status || 'Sin estado'
}
