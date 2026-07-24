import { getUserProperties, getUserPropertyById } from '@/lib/services/user-properties'

export function getPortfolioOwnerProperties(ownerId?: string | null) {
  return getUserProperties(ownerId)
}

export function getPortfolioPropertyRecord(propertyId?: string | null) {
  return getUserPropertyById(propertyId)
}

export function getPortfolioPropertyEarningsRecord(propertyId?: string | null) {
  if (!propertyId) {
    return null
  }

  return null
}

export function getPortfolioAgentRecord(agentId?: string | null) {
  if (!agentId) {
    return null
  }

  return null
}
