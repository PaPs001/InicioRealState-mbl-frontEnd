import { LeadsTrackingSelectingScreen } from '@/modules/users/leads/screens/LeadsTrackingSelectingScreen'
import { useTrackingHistory } from '@/modules/users/leads/hooks/useTrackingHistory'

export default function SelectingRoute() {
  useTrackingHistory('selecting')
  return <LeadsTrackingSelectingScreen />
}
