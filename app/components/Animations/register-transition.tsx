import { useEffect, useRef } from 'react'
import { View, StyleSheet, Animated, Easing } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { clientThemes } from '@/lib/theme'
import LogoGris from '@/app/assets/LogoInicioSVGris.svg'

// Colores del inversionista (negro y dorado)
const investorColors = clientThemes.investor

type RegisterTransitionProps = {
  durationMs?: number
  onComplete?: () => void | Promise<void>
}

export default function RegisterTransition({
  durationMs = 3000,
  onComplete,
}: RegisterTransitionProps) {
  // Animacion inicial de entrada (fade-in con scale)
  const initialFadeAnim = useRef(new Animated.Value(0)).current
  const initialScaleAnim = useRef(new Animated.Value(0.8)).current
  
  // Animacion de pulse continuo
  const pulseAnim = useRef(new Animated.Value(1)).current
  
  // Animacion de fade que se repite cada 1.5 segundos
  const fadeLoopAnim = useRef(new Animated.Value(1)).current

  useEffect(() => {
    // 1. Animacion inicial de entrada (pulse + fade-in)
    Animated.parallel([
      Animated.timing(initialFadeAnim, {
        toValue: 1,
        duration: 600,
        easing: Easing.out(Easing.ease),
        useNativeDriver: true,
      }),
      Animated.spring(initialScaleAnim, {
        toValue: 1,
        friction: 8,
        tension: 40,
        useNativeDriver: true,
      }),
    ]).start()

    // 2. Animacion de pulse continuo (mientras carga)
    const pulseLoop = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.08,
          duration: 800,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 800,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
      ])
    )
    pulseLoop.start()

    // 3. Animacion de fade que se repite cada 1.5 segundos
    const fadeLoop = Animated.loop(
      Animated.sequence([
        Animated.timing(fadeLoopAnim, {
          toValue: 0.5,
          duration: 750,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(fadeLoopAnim, {
          toValue: 1,
          duration: 750,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
      ])
    )
    
    // Iniciar fade loop despues de 500ms (cuando termina la entrada inicial)
    const fadeLoopTimer = setTimeout(() => {
      fadeLoop.start()
    }, 500)

    // Timer para completar la transicion
    const completeTimer = setTimeout(() => {
      void onComplete?.()
    }, durationMs)

    return () => {
      pulseLoop.stop()
      fadeLoop.stop()
      clearTimeout(fadeLoopTimer)
      clearTimeout(completeTimer)
    }
  }, [durationMs, initialFadeAnim, initialScaleAnim, onComplete, pulseAnim, fadeLoopAnim])

  return (
    <SafeAreaView style={styles.container}>
      <Animated.View
        style={[
          styles.content,
          {
            opacity: initialFadeAnim,
            transform: [{ scale: initialScaleAnim }],
          },
        ]}
      >
        {/* Logo grande con animaciones de pulse y fade */}
        <Animated.View
          style={[
            styles.logoContainer,
            {
              opacity: fadeLoopAnim,
              transform: [{ scale: pulseAnim }],
            },
          ]}
        >
          <LogoGris width={280} height={95} />
        </Animated.View>
      </Animated.View>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: investorColors.background,
    alignItems: 'center',
    justifyContent: 'center',
  },
  content: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
})
