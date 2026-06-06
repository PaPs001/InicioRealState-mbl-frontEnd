import {
  getInvestorCampaignPropertyRecord,
  getInvestorCampaignRecords,
  getInvestorPropertyEarningsRecords,
  getInvestorPropertyRecords,
} from '@/lib/api'
import type { Campaign, Property, PropertyEarnings } from '@/lib/types'

const ANNUAL_APPRECIATION_RATE = 0.08
const SALE_COMMISSION_RATE = 0.05
const NOTARY_COST_RATE = 0.02
const ESTIMATED_ISR_RATE = 0.35
const ESTIMATED_MONTHLY_RENT_RATE = 0.005

export type PropertyEarningsView = {
  property: Property
  earnings: PropertyEarnings
}

export type RentProjectionView = {
  property: Property
  estimatedRent: number
  annualRent: number
  roi: string
  currentlyRented: boolean
}

export function getInvestorProperties(currentUserId?: string | null): Property[] {
  return getInvestorPropertyRecords(currentUserId)
}

export function getInvestorEarningsSummary(properties: Property[]) {
  const earningsRecords = getInvestorPropertyEarningsRecords()

  const totalEarnings = earningsRecords.reduce((sum, earning) => {
    const property = properties.find((item) => item.id === earning.propertyId)
    return property ? sum + earning.totalEarnings : sum
  }, 0)

  const monthlyIncome = properties
    .filter((property) => property.status === 'rented' && property.monthlyRent)
    .reduce((sum, property) => sum + (property.monthlyRent || 0), 0)

  const totalPropertyValue = properties.reduce((sum, property) => sum + property.price, 0)
  const projectedValue1Year = totalPropertyValue * (1 + ANNUAL_APPRECIATION_RATE)
  const projectedValue5Years = totalPropertyValue * Math.pow(1 + ANNUAL_APPRECIATION_RATE, 5)
  const potentialGain = projectedValue1Year - totalPropertyValue
  const saleCommission = totalPropertyValue * SALE_COMMISSION_RATE
  const notaryCosts = totalPropertyValue * NOTARY_COST_RATE
  const estimatedIsr = potentialGain * ESTIMATED_ISR_RATE

  return {
    totalEarnings,
    monthlyIncome,
    projectedAnnual: monthlyIncome * 12,
    totalPropertyValue,
    projectedValue1Year,
    projectedValue5Years,
    potentialGain,
    saleCommission,
    notaryCosts,
    estimatedIsr,
    estimatedNetGain: potentialGain - saleCommission - notaryCosts - estimatedIsr,
    annualAppreciationRateLabel: '8%',
    rentedCount: properties.filter((property) => property.status === 'rented').length,
    availableCount: properties.filter((property) => property.status !== 'rented').length,
  }
}

export function getPropertyValueBreakdown(properties: Property[]) {
  return properties.map((property) => {
    const value1Year = property.price * (1 + ANNUAL_APPRECIATION_RATE)
    const gain = value1Year - property.price

    return {
      property,
      value1Year,
      gain,
    }
  })
}

export function getPropertyEarningsBreakdown(properties: Property[]): PropertyEarningsView[] {
  const earningsRecords = getInvestorPropertyEarningsRecords()

  return properties.map((property) => {
    const earnings = earningsRecords.find((item) => item.propertyId === property.id)

    return {
      property,
      earnings: earnings || {
        propertyId: property.id,
        totalEarnings: 0,
        monthlyEarnings: 0,
        occupancyRate: 0,
        paymentHistory: [],
      },
    }
  })
}

export function getRentProjections(properties: Property[]): RentProjectionView[] {
  return properties.map((property) => {
    const estimatedRent = property.monthlyRent || Math.round(property.price * ESTIMATED_MONTHLY_RENT_RATE)
    const annualRent = estimatedRent * 12
    const roi = ((annualRent / property.price) * 100).toFixed(1)

    return {
      property,
      estimatedRent,
      annualRent,
      roi,
      currentlyRented: property.status === 'rented',
    }
  })
}

export function getInvestorCampaigns(currentUserId?: string | null): Campaign[] {
  return getInvestorCampaignRecords(currentUserId)
}

export function getActiveCampaigns(campaigns: Campaign[]) {
  return campaigns.filter((campaign) => campaign.status === 'active' || campaign.status === 'paused')
}

export function getHistoricalCampaigns(campaigns: Campaign[]) {
  return campaigns.filter((campaign) => campaign.status === 'completed' || campaign.status === 'cancelled')
}

export function getCampaignProperty(propertyId: string) {
  return getInvestorCampaignPropertyRecord(propertyId)
}

export function getCampaignDaysRemaining(endDate: string) {
  const end = new Date(endDate)
  const now = new Date()
  const diff = Math.ceil((end.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
  return diff > 0 ? diff : 0
}

export function getCampaignProgressPercent(campaign: Campaign) {
  return (campaign.spentBudget / campaign.budget) * 100
}

export function getActiveCampaignStats(campaigns: Campaign[]) {
  const totalBudget = campaigns.reduce((acc, campaign) => acc + campaign.budget, 0)
  const totalSpent = campaigns.reduce((acc, campaign) => acc + campaign.spentBudget, 0)
  const totalLeads = campaigns.reduce((acc, campaign) => acc + campaign.leadsCount, 0)

  return {
    totalBudget,
    totalSpent,
    totalLeads,
    count: campaigns.length,
  }
}

export function getHistoricalCampaignStats(campaigns: Campaign[]) {
  const totalSpent = campaigns.reduce((acc, campaign) => acc + campaign.spentBudget, 0)
  const totalLeads = campaigns.reduce((acc, campaign) => acc + campaign.leadsCount, 0)
  const successful = campaigns.filter(
    (campaign) => campaign.result === 'rented' || campaign.result === 'sold'
  ).length

  return {
    totalSpent,
    totalLeads,
    successful,
    count: campaigns.length,
  }
}

export function getCampaignResultText(result?: Campaign['result']) {
  switch (result) {
    case 'rented':
      return 'Rentada'
    case 'sold':
      return 'Vendida'
    case 'not_achieved':
      return 'No logrado'
    case 'cancelled':
      return 'Cancelada'
    default:
      return 'Pendiente'
  }
}
