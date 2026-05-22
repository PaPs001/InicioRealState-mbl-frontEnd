import { useLocalSearchParams, useRouter } from 'expo-router'
import { useAuth } from '@/contexts/AuthContext'
import RegisterTransition from '@/components/animations/register-transition'
import type { RegisterTransitionVariant } from '@/components/animations/register-transition'

export default function RegisterTransitionRoute() {
  const router = useRouter()
  const { login } = useAuth()
  const params = useLocalSearchParams<{
    title?: string
    subtitle?: string
    durationMs?: string
    nextRoute?: string
    loginUserId?: string
    variant?: RegisterTransitionVariant
  }>()

  const handleComplete = async () => {
    if (params.loginUserId) {
      await login(params.loginUserId)
    }

    router.replace(params.nextRoute || '/(tabs)')
  }

  return (
    <RegisterTransition
      title={params.title || 'Perfil listo'}
      subtitle={params.subtitle || 'Estamos preparando tu sesión de inversionista.'}
      durationMs={params.durationMs ? Number(params.durationMs) : 1900}
      variant={params.variant || 'pulse-orb'}
      onComplete={handleComplete}
    />
  )
}
