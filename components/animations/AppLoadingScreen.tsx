import { useEffect, useRef } from 'react'
import { Animated, StyleSheet, View } from 'react-native'
import { clientThemes } from '@/lib/theme'
import LogoGris from '@/assets/LogoInicioSVGris.svg'

export default function AppLoadingScreen() {
  const pulseAnim = useRef(new Animated.Value(1)).current
  useEffect(() => {
    const pulse = Animated.loop(Animated.sequence([
      Animated.timing(pulseAnim, { toValue: 1.05, duration: 800, useNativeDriver: true }),
      Animated.timing(pulseAnim, { toValue: 1, duration: 800, useNativeDriver: true }),
    ]))
    pulse.start()
    return () => pulse.stop()
  }, [pulseAnim])

  return (
    <View style={styles.container} accessibilityLabel="Cargando" accessibilityRole="progressbar">
      <Animated.View style={{ transform: [{ scale: pulseAnim }] }}>
        <LogoGris width={200} height={70} />
      </Animated.View>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: clientThemes.investor.background,
    justifyContent: 'center',
    alignItems: 'center',
  },
})
