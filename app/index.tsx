import { useEffect } from 'react'
import { View, StyleSheet } from 'react-native'
import { useRouter } from 'expo-router'
import { useSessionDomain } from '@/contexts/auth/use-session-domain'
import { clientThemes } from '@/lib/theme'
import LogoGris from '@/app/assets/LogoInicioSVGris.svg'
import { Animated } from 'react-native'

export default function Index() {
  const { isLoading, isLoggedIn, currentUser } = useSessionDomain()
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
        router.replace('/(tabs)')
      } else {
        router.replace('/login')
      }
    }
  }, [isLoading, isLoggedIn])

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
