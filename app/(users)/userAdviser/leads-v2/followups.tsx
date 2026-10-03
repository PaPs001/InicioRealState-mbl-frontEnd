import { Redirect, useLocalSearchParams } from 'expo-router'

export default function LegacyTrackingRedirect() {
  const params = useLocalSearchParams()
  return <Redirect href={{ pathname: '/userAdviser/lead-tracking/followups', params }} />
}
