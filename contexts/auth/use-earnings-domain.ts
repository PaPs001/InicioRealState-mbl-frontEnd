import { useMemo } from 'react'
import { usePropertyDomain } from './use-property-domain'
import {
  getInvestorEarningsSummary,
  getPropertyEarningsBreakdown,
  getPropertyValueBreakdown,
  getRentProjections,
} from '@/lib/services/investor-earnings-domain'

export function useEarningsDomain() {
  const { userProperties } = usePropertyDomain()

  const summary = useMemo(() => getInvestorEarningsSummary(userProperties), [userProperties])
  const propertyValueBreakdown = useMemo(
    () => getPropertyValueBreakdown(userProperties),
    [userProperties],
  )
  const propertyEarningsData = useMemo(
    () => getPropertyEarningsBreakdown(userProperties),
    [userProperties],
  )
  const rentProjections = useMemo(() => getRentProjections(userProperties), [userProperties])

  return {
    userProperties,
    summary,
    propertyValueBreakdown,
    propertyEarningsData,
    rentProjections,
  }
}

export default useEarningsDomain
