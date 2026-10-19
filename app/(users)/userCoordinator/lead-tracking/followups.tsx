import LeadFollowUpScreen from '@/modules/users/leads/screens/leadsFollowing'
import { useTrackingHistory } from '@/modules/users/leads/hooks/useTrackingHistory'

export default function FollowUpsRoute() {
  useTrackingHistory('followups')
  return <LeadFollowUpScreen />
}
