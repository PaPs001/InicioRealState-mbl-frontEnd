/**
 * Tipos de Leads y Agentes
 */

export type LeadStatus = 'nuevo' | 'contactado' | 'cita_agendada' | 'visitado' | 'negociando' | 'cerrado' | 'descartado'

export interface PropertyLead {
  id: string
  propertyId: string
  agentId: string
  name: string
  phone: string
  email?: string
  status: LeadStatus
  source: string
  notes?: string
  followUps?: LeadFollowUp[]
  createdDate: string
  lastContactDate?: string
}

export interface LeadFollowUp {
  id: string
  date: string
  type: 'call' | 'whatsapp' | 'email' | 'visit' | 'meeting'
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
