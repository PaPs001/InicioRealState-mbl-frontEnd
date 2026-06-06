import { useMemo } from 'react'
import { useSessionDomain } from './use-session-domain'
import {
  getActiveCampaigns,
  getActiveCampaignStats,
  getCampaignDaysRemaining,
  getCampaignProgressPercent,
  getCampaignProperty,
  getCampaignResultText,
  getHistoricalCampaignStats,
  getHistoricalCampaigns,
  getInvestorCampaigns,
} from '@/lib/services/investor-earnings-domain'

export function useCampaignsDomain() {
  const { currentUser } = useSessionDomain()

  const userCampaigns = useMemo(
    () => getInvestorCampaigns(currentUser?.id),
    [currentUser?.id],
  )
  const activeCampaigns = useMemo(() => getActiveCampaigns(userCampaigns), [userCampaigns])
  const historyCampaigns = useMemo(() => getHistoricalCampaigns(userCampaigns), [userCampaigns])
  const activeStats = useMemo(() => getActiveCampaignStats(activeCampaigns), [activeCampaigns])
  const historyStats = useMemo(() => getHistoricalCampaignStats(historyCampaigns), [historyCampaigns])

  return {
    activeCampaigns,
    historyCampaigns,
    activeStats,
    historyStats,
    getProperty: getCampaignProperty,
    getDaysRemaining: getCampaignDaysRemaining,
    getProgressPercent: getCampaignProgressPercent,
    getResultText: getCampaignResultText,
  }
}

export default useCampaignsDomain
