import { useEffect } from 'react'
import { View, StyleSheet, Animated } from 'react-native'
import { useRouter } from 'expo-router'
import { useAuth } from '@/contexts/AuthContext'
import { clientThemes } from '@/lib/theme'
import LogoGris from '@/app/assets/LogoInicioSVGris.svg'

export default function LogoutTransition() {
  const router = useRouter()
  const { logout } = useAuth()
  const pulseAnim = new Animated.Value(1)
  const theme = clientThemes.investor

  useEffect(() => {
    // Animacion de pulso del logo
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

    // Ejecutar logout y navegar despues de la animacion
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
