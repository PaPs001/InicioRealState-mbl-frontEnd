import LeadDetailRouteScreen from '@/modules/users/leads/screens/LeadDetailRouteScreen'
import { useTrackingHistory } from '@/modules/users/leads/hooks/useTrackingHistory'

export default function DetailRoute() {
  useTrackingHistory('detail')
  return <LeadDetailRouteScreen />
}
