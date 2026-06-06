import { mockCampaigns, mockProperties, mockPropertyEarnings } from '@/lib/mock-data'
import type { Campaign, Property, PropertyEarnings } from '@/lib/types'

export function getInvestorPropertyRecords(currentUserId?: string | null): Property[] {
  if (!currentUserId) {
    return []
  }

  return mockProperties.filter((property) => property.ownerId === currentUserId)
}

export function getInvestorPropertyEarningsRecords(): PropertyEarnings[] {
  return mockPropertyEarnings
}

export function getInvestorCampaignRecords(currentUserId?: string | null): Campaign[] {
  if (!currentUserId) {
    return []
  }

  return mockCampaigns.filter((campaign) => campaign.ownerId === currentUserId)
}

export function getInvestorCampaignPropertyRecord(propertyId: string) {
  return mockProperties.find((property) => property.id === propertyId)
}
