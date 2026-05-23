/**
 * Tipos de Propiedades
 */

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
  size: number 
  description?: string
  features?: string[]
  images?: string[]
  ownerId?: string
  agentId?: string
  monthlyRent?: number
  purchasedWithUs?: boolean 
  createdAt: string
}

export interface PropertyEarnings {
  propertyId: string
  totalEarnings: number
  monthlyEarnings: number
  occupancyRate: number
  lastPaymentDate?: string
  nextPaymentDate?: string
  paymentHistory: {
    month: string
    amount: number
    status: 'paid' | 'pending' | 'late'
  }[]
}

export interface ActiveRental {
  id: string
  propertyId: string
  tenantId: string
  landlordId: string
  agentId: string
  startDate: string
  endDate: string
  monthlyRent: number
  paymentDay: number
  depositAmount: number
  rules: string[]
  utilities: {
    electricity: { provider: string; phone: string; accountNumber?: string }
    water: { provider: string; phone: string; accountNumber?: string }
    gas: { provider: string; phone: string; accountNumber?: string }
    internet?: { provider: string; phone: string; accountNumber?: string }
  }
  documents: RegistrationDocument[]
  status: 'active' | 'ending_soon' | 'ended'
}

export interface RegistrationDocument {
  id: string
  name: string
  type: string
  url: string
  uploadDate: string
  status: 'pending' | 'approved' | 'rejected'
}

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
