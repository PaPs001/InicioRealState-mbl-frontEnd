import { useEffect } from 'react'
import { View, ActivityIndicator, StyleSheet } from 'react-native'
import { useRouter } from 'expo-router'
import { useAuth } from '@/contexts/AuthContext'
import { colors } from '@/lib/theme'

export default function Index() {
  const { isLoading, isLoggedIn } = useAuth()
  const router = useRouter()

  console.log("[v0] Index rendered - isLoading:", isLoading, "isLoggedIn:", isLoggedIn)

  useEffect(() => {
    console.log("[v0] Index useEffect - isLoading:", isLoading, "isLoggedIn:", isLoggedIn)
    if (!isLoading) {
      if (isLoggedIn) {
        console.log("[v0] Navigating to (tabs)")
        router.replace('/(tabs)')
      } else {
        console.log("[v0] Navigating to /login")
        router.replace('/login')
      }
    }
  }, [isLoading, isLoggedIn])

  return (
    <View style={styles.container}>
      <ActivityIndicator size="large" color={colors.accent} />
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.background,
  },
})
