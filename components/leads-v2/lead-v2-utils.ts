import type { LeadStatus, LeadV2SystemStatus, Property, PropertyLead } from '@/lib/types'
import type {
  AgentLeadGroup,
  CoordinatorLeadV2Channel,
  LeadPropertyOption,
  LeadV2Alert,
  LeadV2Metric,
  LeadV2Status,
  LeadV2ViewModel,
} from './types'

export type LeadV2ScreenMode = 'coordinator' | 'advisor'

export function normalizeSearch(value: string) {
  return value.trim().toLowerCase()
}

export function getParamValue(value?: string | string[]) {
  if (Array.isArray(value)) return value[0] ?? ''
  return value ?? ''
}

export function buildPropertyOptions(catalogProperties: Property[], availableProperties: Property[]): LeadPropertyOption[] {
  const source = catalogProperties.length > 0 ? catalogProperties : availableProperties
  const byId = new Map<string, LeadPropertyOption>()

  source.forEach((property) => {
    const id = property.id || property._id
    if (!id || byId.has(id)) return

    byId.set(id, {
      id,
      title: property.title || 'Propiedad disponible',
      address: property.address || '',
      city: property.city || '',
      price: property.monthlyRent ?? property.price ?? 0,
      image: property.images?.[0],
      status: property.status,
    })
  })

  return Array.from(byId.values()).sort((current, next) =>
    current.title.localeCompare(next.title, 'es'),
  )
}

export function formatPropertyPrice(property: LeadPropertyOption) {
  if (!property.price) return 'Precio pendiente'
  return `$${Math.round(property.price).toLocaleString('es-MX')} MXN`
}

export function mapPropertyLeadToLeadV2ViewModel(
  lead: PropertyLead,
  mode: LeadV2ScreenMode,
  propertyName?: string,
): LeadV2ViewModel {
  const advisorStatus = lead.advisorStatus || lead.status
  const systemStatus = lead.systemStatus
  const visibleStatus = mode === 'coordinator'
    ? mapSystemStatusToLeadV2Status(systemStatus)
    : mapLeadStatusToLeadV2Status(lead.status)

  return {
    id: lead.id,
    rawLead: lead,
    name: lead.name,
    propertyName: propertyName || 'Sin propiedad asignada',
    agentName: lead.assignedAgentName || 'Sin asesor',
    phone: lead.phone,
    email: lead.email,
    source: lead.source || 'Backend',
    channel: getLeadChannel(lead),
    status: visibleStatus,
    advisorStatus,
    statusLabel: mode === 'coordinator' ? formatLeadStatus(visibleStatus) : formatAdvisorStatus(advisorStatus),
    systemStatus,
    lastContactLabel: getLastContactLabel(lead),
    nextActionLabel: lead.nextAction || lead.notes || 'Sin accion definida',
  }
}

export function getLeadChannel(lead: PropertyLead): CoordinatorLeadV2Channel {
  const source = `${lead.source ?? ''} ${lead.contactType ?? ''}`.toLowerCase()
  if (source.includes('manychat')) return 'Manychat'
  if (source.includes('google')) return 'Google Ads'
  if (source.includes('meta') || source.includes('facebook') || source.includes('instagram')) return 'Meta'
  if (source.includes('whatsapp') || source.includes('wa')) return 'Whatsapp'
  return 'Whatsapp'
}

export function mapLeadStatusToLeadV2Status(status: LeadStatus): LeadV2Status {
  if (status === 'cerrado') return 'lead_ganador'
  if (status === 'descartado') return 'lead_perdido'
  if (status === 'cita_agendada' || status === 'visitado') return 'con_cita'
  if (status === 'contactado' || status === 'negociando') return 'seguimiento'
  return 'nuevo'
}

export function formatAdvisorStatus(status?: string) {
  if (!status) return 'Sin estado'

  const mappedStatus = backendAdvisorStatusLabels[status]
  if (mappedStatus) return mappedStatus

  return status
    .split(/[_-]+/)
    .filter(Boolean)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ')
}

export function mapSystemStatusToLeadV2Status(status?: LeadV2SystemStatus): LeadV2Status {
  if (!status) return 'nuevo'
  return status
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
      const active = agentLeads.filter((lead) => !isTerminalLeadStatus(lead.status))
      const pending = active.filter((lead) => lead.nextActionLabel !== 'Sin accion definida')

      return {
        id: normalizeSearch(name).replace(/\s+/g, '-'),
        name,
        leads: agentLeads,
        active: active.length,
        followings: active.filter((lead) => lead.status === 'seguimiento').length,
        pending: pending.length,
      }
    })
    .sort((current, next) =>
      next.leads.length - current.leads.length ||
      current.name.localeCompare(next.name),
    )
}

export function buildLeadV2Metrics(leads: LeadV2ViewModel[]): LeadV2Metric[] {
  const activeLeads = leads.filter((lead) => !isTerminalLeadStatus(lead.status))
  const inProgressLeads = activeLeads.filter((lead) => lead.status === 'seguimiento')
  const appointmentLeads = activeLeads.filter((lead) => lead.status === 'con_cita')
  const coldLeads = activeLeads.filter((lead) => lead.status === 'frio' || lead.status === 'congelado' || lead.status === 'lead_muerto')

  return [
    { id: 'active-leads', label: 'Leads Activos', value: activeLeads.length, color: '#0d4f3f' },
    { id: 'followed-leads', label: 'En seguimiento', value: inProgressLeads.length, color: '#d09c3d' },
    { id: 'cold-leads', label: 'Requieren atencion', value: coldLeads.length, color: '#c8655f' },
    { id: 'appointments', label: 'Citas proximas', value: appointmentLeads.length, color: '#0a3f34' },
  ]
}

export function buildLeadV2Alerts(leads: LeadV2ViewModel[]): LeadV2Alert[] {
  const activeLeads = leads.filter((lead) => !isTerminalLeadStatus(lead.status))
  const coldLeads = activeLeads.filter((lead) => lead.status === 'frio')
  const frozenLeads = activeLeads.filter((lead) => lead.status === 'congelado')
  const deadLeads = activeLeads.filter((lead) => lead.status === 'lead_muerto')
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

const backendAdvisorStatusLabels: Record<string, string> = {
  nuevo: 'Nuevo',
  contactado: 'Contactado',
  cita_agendada: 'Cita agendada',
  visitado: 'Visitado',
  negociando: 'Negociando',
  cerrado: 'Cerrado',
  descartado: 'Descartado',
}

export function formatLeadStatus(status: LeadV2Status) {
  const labels: Record<LeadV2Status, string> = {
    nuevo: 'Nuevo',
    seguimiento: 'Seguimiento',
    frio: 'Frio',
    congelado: 'Congelado',
    en_espera: 'En espera',
    con_cita: 'Con cita',
    lead_muerto: 'Muerto',
    lead_ganador: 'Ganado',
    lead_perdido: 'Perdido',
    spam: 'Spam',
    duplicado: 'Duplicado',
  }

  return labels[status] ?? status
}

function isTerminalLeadStatus(status: LeadV2Status) {
  return status === 'lead_ganador' || status === 'lead_perdido' || status === 'spam' || status === 'duplicado'
}
