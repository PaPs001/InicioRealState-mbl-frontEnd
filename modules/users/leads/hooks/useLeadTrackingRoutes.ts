import { usePathname } from 'expo-router'

export function useLeadTrackingRoutes() {
  const pathname = usePathname()
  const mode = pathname.startsWith('/userCoordinator') ? 'coordinator' : 'advisor'
  const basePath = mode === 'coordinator'
    ? '/userCoordinator/lead-tracking'
    : '/userAdviser/lead-tracking'

  return {
    mode,
    index: basePath,
    selecting: `${basePath}/selecting`,
    detail: `${basePath}/detail`,
    followups: `${basePath}/followups`,
  } as const
}
