import { useEffect } from 'react'
import { View, StyleSheet } from 'react-native'
import { useRouter } from 'expo-router'
import { useSessionDomain } from '@/contexts/auth/use-session-domain'
import { clientThemes } from '@/lib/theme'
import LogoGris from '@/assets/LogoInicioSVGris.svg'
import { Animated } from 'react-native'

export default function Index() {
  const {
    isLoading,
    isLoggedIn,
    isAgent,
    isCoordinator,
    isAdmin,
  } = useSessionDomain()
  const router = useRouter()
  const pulseAnim = new Animated.Value(1)

  useEffect(() => {
    const pulse = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.05,
          duration: 800,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 800,
          useNativeDriver: true,
        }),
      ])
    )
    pulse.start()
    return () => pulse.stop()
  }, [])

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

  const theme = clientThemes.investor

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <Animated.View style={{ transform: [{ scale: pulseAnim }] }}>
        <LogoGris width={200} height={70} />
      </Animated.View>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
})
