import { useEffect, useState } from 'react'
import { StyleSheet, Text, View } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useRouter } from 'expo-router'

import LogoIRSPrincipal from '@/assets/logoIRSprincipal.svg'
import { useSessionDomain } from '@/contexts/auth/use-session-domain'

export default function RegistrationCompleteScreen() {
  const router = useRouter()
  const { logout } = useSessionDomain()
  const [secondsRemaining, setSecondsRemaining] = useState(5)

  useEffect(() => {
    const intervalId = setInterval(() => {
      setSecondsRemaining((currentSeconds) => {
        if (currentSeconds <= 1) {
          clearInterval(intervalId)
          return 0
        }

        return currentSeconds - 1
      })
    }, 1000)

    return () => clearInterval(intervalId)
  }, [])

  useEffect(() => {
    if (secondsRemaining > 0) return

    let isMounted = true

    const closeSessionAndReturnToLogin = async () => {
      await logout()
      if (isMounted) {
        router.replace('/login/login' as never)
      }
    }

    closeSessionAndReturnToLogin()

    return () => {
      isMounted = false
    }
  }, [logout, router, secondsRemaining])

  return (
    <SafeAreaView style={styles.safeArea} edges={['left', 'right', 'bottom']}>
      <View style={styles.content}>
        <LogoIRSPrincipal width={156} height={52} />
        <View style={styles.messageBox}>
          <Text style={styles.title}>Su registro se ha completado</Text>
          <Text style={styles.subtitle}>Nos vemos pronto.</Text>
          <Text style={styles.countdown}>
            Seras redirigido al inicio de sesion en {secondsRemaining} segundos.
          </Text>
        </View>
      </View>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 28,
    gap: 28,
  },
  messageBox: {
    alignItems: 'center',
    gap: 8,
  },
  title: {
    color: '#315b41',
    fontSize: 22,
    fontWeight: '800',
    textAlign: 'center',
  },
  subtitle: {
    color: '#7b8780',
    fontSize: 15,
    textAlign: 'center',
  },
  countdown: {
    color: '#315b41',
    fontSize: 14,
    fontWeight: '700',
    marginTop: 10,
    textAlign: 'center',
  },
})
