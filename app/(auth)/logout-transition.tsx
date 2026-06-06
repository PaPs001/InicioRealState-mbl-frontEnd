import { useEffect } from 'react'
import { View, StyleSheet, Animated } from 'react-native'
import { useRouter, useLocalSearchParams } from 'expo-router'
import { useSessionDomain } from '@/contexts/auth/use-session-domain'
import { clientThemes, colors } from '@/lib/theme'
import LogoGris from '@/app/assets/LogoInicioSVGris.svg'
import LogoNegro from '@/app/assets/LogoInicioSVGNegro.svg'

export default function LogoutTransition() {
  const router = useRouter()
  const { logout } = useSessionDomain()
  const { role } = useLocalSearchParams<{ role: string }>()
  const pulseAnim = new Animated.Value(1)

  // Determinar colores segun el rol
  const getTheme = () => {
    switch (role) {
      case 'investor':
        return { bg: clientThemes.investor.background, useDarkLogo: true }
      case 'tenant':
        return { bg: clientThemes.tenant.background, useDarkLogo: true }
      case 'agent':
      case 'admin':
        return { bg: clientThemes.advisor.background, useDarkLogo: true }
      case 'searching':
      default:
        return { bg: clientThemes.searching.background, useDarkLogo: false }
    }
  }

  const theme = getTheme()

  useEffect(() => {
    const pulse = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.1,
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

    const timer = setTimeout(async () => {
      await logout()
      router.replace('/login')
    }, 1500)

    return () => {
      pulse.stop()
      clearTimeout(timer)
    }
  }, [])

  return (
    <View style={[styles.container, { backgroundColor: theme.bg }]}>
      <Animated.View style={{ transform: [{ scale: pulseAnim }] }}>
        {theme.useDarkLogo ? (
          <LogoGris width={200} height={70} />
        ) : (
          <LogoNegro width={200} height={70} />
        )}
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
