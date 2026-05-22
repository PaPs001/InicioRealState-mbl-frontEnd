/**
 * Tipos de Campanas
 */

export type CampaignStatus = 'active' | 'paused' | 'completed' | 'cancelled'
export type CampaignResult = 'rented' | 'sold' | 'not_achieved' | 'cancelled' | 'pending'
export type CampaignType = 'rent' | 'sale'

export interface Campaign {
  id: string
  propertyId: string
  ownerId: string
  type: CampaignType
  status: CampaignStatus
  budget: number
  spentBudget: number
  remainingBudget: number
  leadsCount: number
  startDate: string
  endDate: string
  durationDays: number
  result?: CampaignResult
  platform: string[]
  createdAt: string
}
