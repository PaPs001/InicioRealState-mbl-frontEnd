/**
 * Tipos de Leads y Agentes
 */

export type LeadStatus = 'nuevo' | 'contactado' | 'cita_agendada' | 'visitado' | 'negociando' | 'cerrado' | 'descartado'
export type LeadV2SystemStatus = 'nuevo' | 'seguimiento' | 'frio' | 'congelado' | 'en_espera' | 'con_cita' | 'provisional' | 'lead_muerto' | 'lead_ganador' | 'lead_perdido' | 'spam' | 'duplicado'
export type LeadV2StatusSource = 'advisor' | 'coordinator' | 'system' | 'notion' | 'manychat'
export type LeadContactType = 'call' | 'whatsapp' | 'email' | 'visit' | 'meeting'
export type LeadSearchIntent = 'sale' | 'rent'

export interface PropertyLead {
  id: string
  leadNotionId?: string
  propertyId: string
  agentId: string
  advisorId?: string
  assignedAgentName?: string
  name: string
  phone: string
  email?: string
  status: LeadStatus
  advisorStatus?: string
  systemStatus?: LeadV2SystemStatus
  statusSource?: LeadV2StatusSource
  statusReason?: string
  statusUntil?: string
  nextAction?: string
  nextActionAt?: string
  nextFollowUpAt?: string
  source: string
  contactType?: LeadContactType
  searchIntent?: LeadSearchIntent
  notes?: string
  followUps?: LeadFollowUp[]
  createdDate: string
  firstContactDate?: string
  lastContactDate?: string
  imageUri?: string
}

export interface LeadFollowUp {
  id: string
  leadId?: string
  clientId?: string
  followNumber?: string
  date: string
  type: LeadContactType
  result?: string
  notes: string
  nextAction?: string
  nextActionDate?: string
}

export interface Commission {
  id: string
  agentId: string
  propertyId: string
  transactionType: 'sale' | 'rent'
  amount: number
  rate: number
  status: 'pending' | 'approved' | 'paid'
  createdDate: string
  paidDate?: string
}

export interface Referral {
  id: string
  referrerId: string
  referredId: string
  propertyId?: string
  amount: number
  status: 'pending' | 'completed'
  createdDate: string
}
