import { useEffect } from 'react'
import AppLoadingScreen from '@/components/animations/AppLoadingScreen'
import { useRouter } from 'expo-router'
import { useSessionDomain } from '@/contexts/auth/use-session-domain'




export default function Index() {
  const {
    isLoading,
    isLoggedIn,
    isAgent,
    isCoordinator,
    isAdmin,
  } = useSessionDomain()
  const router = useRouter()

  useEffect(() => {
    if (!isLoading) {
      if (isLoggedIn) {
        if (isCoordinator || isAdmin) {
          router.replace('/userCoordinator' as never)
        } else if (isAgent) {
          router.replace('/userAdviser' as never)
        } else {
          router.replace('/registration-complete' as never)
        }
      } else {
        router.replace('/login/login' as never)
      }
    }
  }, [isAdmin, isAgent, isCoordinator, isLoading, isLoggedIn, router])

  return <AppLoadingScreen />
}
