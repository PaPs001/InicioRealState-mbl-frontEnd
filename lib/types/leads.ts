/**
 * Tipos de Leads y Agentes
 */

export type LeadStatus = 'nuevo' | 'contactado' | 'cita_agendada' | 'visitado' | 'negociando' | 'cerrado' | 'descartado'
export type LeadContactType = 'call' | 'whatsapp' | 'email' | 'visit' | 'meeting'
export type LeadSearchIntent = 'sale' | 'rent'

export interface PropertyLead {
  id: string
  propertyId: string
  agentId: string
  advisorId?: string
  assignedAgentName?: string
  name: string
  phone: string
  email?: string
  status: LeadStatus
  source: string
  contactType?: LeadContactType
  searchIntent?: LeadSearchIntent
  notes?: string
  followUps?: LeadFollowUp[]
  createdDate: string
  firstContactDate?: string
  lastContactDate?: string
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
