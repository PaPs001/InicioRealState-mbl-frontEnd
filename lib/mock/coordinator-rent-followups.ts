export type CoordinatorRentFollowupMetric = {
  id: string
  label: string
  value: number
  color: string
}

export type CoordinatorRentFollowupAlert = {
  id: string
  icon: 'warning' | 'user' | 'clock'
  message: string
}

export type CoordinatorRentLead = {
  id: string
  name: string
  property: string
  channel: 'Manychat' | 'Meta' | 'Google Ads' | 'Whatsapp'
  source: string
  status: string
  lastContact: string
  nextAction: string
  avatarUrl: string
}

export type CoordinatorRentAssistantAction = {
  id: string
  label: string
  icon: 'mic' | 'wave' | 'plus'
}

export const coordinatorRentFollowupMetrics: CoordinatorRentFollowupMetric[] = [
  { id: 'active-leads', label: 'Leads Activos', value: 32, color: '#0d4f3f' },
  { id: 'followed-leads', label: 'En seguimiento', value: 24, color: '#d09c3d' },
  { id: 'late-leads', label: 'Atrasados', value: 5, color: '#c8655f' },
  { id: 'appointments', label: 'Citas proximas', value: 12, color: '#0a3f34' },
]

export const coordinatorRentFollowupChannels = [
  'Todos',
  'Manychat',
  'Meta',
  'Google Ads',
  'Whatsapp',
] as const

export type CoordinatorRentFollowupChannel = typeof coordinatorRentFollowupChannels[number]

export const coordinatorRentFollowupAlerts: CoordinatorRentFollowupAlert[] = [
  { id: 'no-movement', icon: 'warning', message: '5 leads sin movimiento en 3 dias' },
  { id: 'pending-agent', icon: 'user', message: '3 leads sin asesor confirmado' },
  { id: 'overdue-next', icon: 'clock', message: '4 proximas acciones vencidas' },
]

export const coordinatorRentPriorityLeads: CoordinatorRentLead[] = [
  {
    id: 'rent-lead-1',
    name: 'Andrea Ortiz',
    property: 'Aldea Hortus D-506',
    channel: 'Manychat',
    source: 'Instagram',
    status: 'En seguimiento',
    lastContact: 'Ultimo contacto hace dos dias',
    nextAction: 'Confirmar cita lunes 10:30 am',
    avatarUrl: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=160&q=80',
  },
  {
    id: 'rent-lead-2',
    name: 'Mariana Reyes',
    property: 'Central Park T-210',
    channel: 'Meta',
    source: 'Facebook',
    status: 'En seguimiento',
    lastContact: 'Ultimo contacto ayer',
    nextAction: 'Enviar opciones de contrato',
    avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=160&q=80',
  },
  {
    id: 'rent-lead-3',
    name: 'Daniel Torres',
    property: 'Distrito Zen B-1203',
    channel: 'Google Ads',
    source: 'Landing',
    status: 'En seguimiento',
    lastContact: 'Ultimo contacto hace tres dias',
    nextAction: 'Validar presupuesto y fecha de entrada',
    avatarUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=160&q=80',
  },
  {
    id: 'rent-lead-4',
    name: 'Camila Ponce',
    property: 'Aldea Hortus D-506',
    channel: 'Whatsapp',
    source: 'Referido',
    status: 'En seguimiento',
    lastContact: 'Ultimo contacto hoy',
    nextAction: 'Agendar visita virtual',
    avatarUrl: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=160&q=80',
  },
]

export const coordinatorRentAssistantActions: CoordinatorRentAssistantAction[] = [
  { id: 'dictate-followup', label: 'Dictar seguimiento', icon: 'mic' },
  { id: 'voice-appointment', label: 'Agendar cita por voz', icon: 'wave' },
  { id: 'add-lead', label: 'Agregar lead', icon: 'plus' },
]
