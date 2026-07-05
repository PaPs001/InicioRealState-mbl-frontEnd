import type { ImageSourcePropType } from 'react-native'

export type AdviserPriority = {
  id: string
  value: number
  label: string
}

export type AdviserProgressGoal = {
  id: string
  title: string
  current: number
  target: number
  unit: string
  caption: string
}

export type AdviserAppointment = {
  id: string
  property: string
  client: string
  adviser: string
  day: string
  time: string
  status: string
}

export type AdviserQuickAccess = {
  id: string
  label: string
}

export type AdviserLeadMetric = {
  id: string
  value: number
  label: string
  tone: 'neutral' | 'warning' | 'danger' | 'success'
}

export type AdviserLeadAlert = {
  id: string
  message: string
}

export type AdviserCampaignMetric = {
  id: string
  value: number
  label: string
  tone: 'success' | 'warning' | 'neutral' | 'danger'
}

export type AdviserCampaignProperty = {
  id: string
  title: string
  dateRange: string
  status: string
  statusTone: 'warning' | 'danger' | 'success'
  remaining: string
  image: ImageSourcePropType
}

const homeImage = require('../../assets/login-new-hero.png')

export const adviserDashboardMock = {
  date: '13 de junio, 2026',
  role: 'Asesor de Rentas',
  name: 'Victor Perea',
  headline: 'Aqui esta lo importante de hoy',
  initials: 'VP',
  listedProperties: 24,
  monthEarnings: '$17,500',
  activeListedProperties: 13,
  priorities: [
    { id: 'closing', value: 5, label: 'Apartados En cierre' },
    { id: 'messages', value: 3, label: 'Mensajes sin responder' },
    { id: 'editing', value: 2, label: 'Propiedades en edicion' },
    { id: 'urgent', value: 1, label: 'Incidencia urgente ' },
  ] satisfies AdviserPriority[],
  goals: [
    { id: 'weekly', title: 'Meta semanal', current: 1, target: 4, unit: 'Rentas', caption: '3 seguimientos' },
    { id: 'monthly', title: 'Meta mensual', current: 7, target: 10, unit: 'Rentas', caption: 'Vamos ya casi llegas a la meta' },
    { id: 'listed', title: 'Meta listado', current: 1, target: 3, unit: 'Propiedades', caption: 'Listado de este mes' },
  ] satisfies AdviserProgressGoal[],
  appointments: [
    {
      id: 'apt-1',
      property: 'Aldea Hortus Coto 6 - D 506',
      client: 'Andrea Hortiz',
      adviser: 'Carlos Trujeque',
      day: 'Lunes 26 junio',
      time: '10:30 am',
      status: 'Confirmada ',
    },
    {
      id: 'apt-2',
      property: 'Altea - B 205',
      client: 'Margarita Ruiz',
      adviser: 'Jorge Sanchez',
      day: 'Lunes 26 junio',
      time: '02:30 pm',
      status: 'Pendiente ',
    },
    {
      id: 'apt-3',
      property: 'Aldea Hortus Coto 4 - A 112',
      client: 'Manuel Lopez',
      adviser: 'Citlalli Tapia',
      day: 'Martes 27 junio',
      time: '10:30 am',
      status: 'Confirmada ',
    },
  ] satisfies AdviserAppointment[],
  quickAccess: [
    { id: 'owners', label: 'Propietarios' },
    { id: 'tenants', label: 'Inquilinos' },
    { id: 'property', label: 'Agregar propiedad' },
    { id: 'contracts', label: 'Contratos' },
    { id: 'files', label: 'Expedientes' },
    { id: 'campaigns', label: 'Campañas activas' },
  ] satisfies AdviserQuickAccess[],
  leadMetrics: [
    { id: 'active', value: 77, label: 'Leads activos', tone: 'neutral' },
    { id: 'pending', value: 17, label: 'Seguimientos pendientes', tone: 'warning' },
    { id: 'late', value: 5, label: 'Atrasados', tone: 'danger' },
    { id: 'today', value: 3, label: 'Proximos hoy', tone: 'warning' },
  ] satisfies AdviserLeadMetric[],
  leadFunnel: [
    { id: 'new', value: 17, label: 'Nuevos', tone: 'neutral' },
    { id: 'following', value: 34, label: 'En seguimiento', tone: 'neutral' },
    { id: 'closing', value: 8, label: 'Por cerrar', tone: 'neutral' },
    { id: 'won', value: 7, label: 'Ganados', tone: 'success' },
    { id: 'lost', value: 3, label: 'Perdidos', tone: 'neutral' },
  ] satisfies AdviserLeadMetric[],
  leadAlerts: [
    { id: 'inactive', message: '7 leads sin movimiento en 3 dias' },
    { id: 'expired', message: '3 con proximo contacto vencido' },
    { id: 'next-action', message: '4 sin siguiente accion definida' },
  ] satisfies AdviserLeadAlert[],
  campaignMetrics: [
    { id: 'active', value: 15, label: 'Activas ', tone: 'success' },
    { id: 'expiring', value: 4, label: 'Por vencer ', tone: 'warning' },
    { id: 'paused', value: 3, label: 'Sin pauta ', tone: 'neutral' },
    { id: 'review', value: 6, label: 'Requieren revision ', tone: 'danger' },
  ] satisfies AdviserCampaignMetric[],
  campaigns: [
    {
      id: 'campaign-1',
      title: 'C13 CASA - VILLA PARADISO',
      dateRange: '28 de abril de 2026 - 10 de mayo de 2026',
      status: 'Por agotarse',
      statusTone: 'warning',
      remaining: '$514',
      image: homeImage,
    },
    {
      id: 'campaign-2',
      title: '112 TORRE E COTO 6- ALDEA HORTUS',
      dateRange: '28 de abril de 2026 - 10 de mayo de 2026',
      status: 'Excedido',
      statusTone: 'danger',
      remaining: '-$105',
      image: homeImage,
    },
    {
      id: 'campaign-3',
      title: 'CASA 305 LOS ENCANTOS 3',
      dateRange: '28 de abril de 2026 - 10 de mayo de 2026',
      status: 'Saludable',
      statusTone: 'success',
      remaining: '$1,027',
      image: homeImage,
    },
    {
      id: 'campaign-4',
      title: '401 TORRE 3 - SAUZ',
      dateRange: '28 de abril de 2026 - 10 de mayo de 2026',
      status: 'Saludable',
      statusTone: 'success',
      remaining: '$2,002',
      image: homeImage,
    },
  ] satisfies AdviserCampaignProperty[],
} as const
