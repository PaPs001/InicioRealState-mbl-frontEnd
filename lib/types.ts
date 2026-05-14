// Tipos de usuario
export type UserRole = 'investor' | 'searching' | 'tenant' | 'agent' | 'admin'

export interface User {
  id: string
  name: string
  email: string
  phone: string
  role: UserRole
  referralCode?: string
  avatar?: string
  createdAt: string
}

// Tipos de propiedad
export type PropertyType = 'house' | 'apartment' | 'land'
export type PropertyStatus = 'owned' | 'for_sale' | 'for_rent' | 'rented' | 'available' | 'pending_sale' | 'pending_rent'

export interface Property {
  id: string
  title: string
  address: string
  city: string
  price: number
  currentValue?: number
  type: PropertyType
  status: PropertyStatus
  amenities: string[]
  bedrooms?: number
  bathrooms?: number
  sqMeters: number
  description?: string
  features?: string[]
  images?: string[]
  ownerId?: string
  agentId?: string
  monthlyRent?: number
  createdAt: string
}

// Tipos de leads
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

// Tipos de citas
export interface Appointment {
  id: string
  propertyId: string
  userId: string
  agentId?: string
  date: string
  time: string
  status: 'pending' | 'confirmed' | 'completed' | 'cancelled'
  notes?: string
  createdAt: string
}

// Tipos de documentos
export interface Document {
  id: string
  name: string
  type: string
  url: string
  uploadDate: string
  status: 'pending' | 'approved' | 'rejected'
}

// Tipos de comisiones
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

// Tipos de referidos
export interface Referral {
  id: string
  referrerId: string
  referredId: string
  propertyId?: string
  amount: number
  status: 'pending' | 'completed'
  createdDate: string
}

// Tipos de notificaciones
export interface Notification {
  id: string
  userId: string
  title: string
  message: string
  type: 'info' | 'success' | 'warning' | 'error'
  read: boolean
  createdAt: string
}

// Tipos de registro venta/renta
export interface SaleRentRegistration {
  id: string
  propertyId: string
  agentId: string
  type: 'sale' | 'rent'
  transactionAmount: number
  originalPrice?: number
  priceChangeReason?: string
  startDate?: string
  endDate?: string
  duration?: number
  commissionRate: number
  commissionAmount: number
  commissionChangeReason?: string
  isExternalProperty: boolean
  isSharedCommission: boolean
  sharedAgentId?: string
  sharedAgentName?: string
  sharedCommissionRate?: number
  sharedCommissionChangeReason?: string
  agentCommission?: number
  sharedAgentCommission?: number
  referralCode?: string
  referralValid: boolean
  referralUserId?: string
  referralUserName?: string
  referralAmount?: number
  clientName: string
  clientPhone: string
  clientEmail?: string
  documents: RegistrationDocument[]
  pendingDocuments: string[]
  status: 'pending_review' | 'approved' | 'rejected' | 'suspended'
  rejectionReason?: string
  createdDate: string
  reviewedDate?: string
  reviewedBy?: string
  notes?: string
}

export interface RegistrationDocument {
  id: string
  name: string
  type: string
  url: string
  uploadDate: string
  status: 'pending' | 'approved' | 'rejected'
}
