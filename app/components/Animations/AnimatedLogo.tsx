import { useEffect, useRef } from 'react'
import { View, StyleSheet, Animated, Easing } from 'react-native'
import LogoGris from '@/app/assets/LogoInicioSVGris.svg'

export type AnimatedLogoVariant = 
  | 'pulse'           // Pulso suave (default)
  | 'breathe'         // Respiracion lenta y elegante
  | 'fade-in'         // Aparicion con fade
  | 'scale-bounce'    // Escala con rebote
  | 'rotate-gentle'   // Rotacion suave
  | 'shimmer'         // Efecto shimmer/brillo

type AnimatedLogoProps = {
  width?: number
  height?: number
  variant?: AnimatedLogoVariant
  duration?: number
  loop?: boolean
  delay?: number
  onAnimationComplete?: () => void
}

export default function AnimatedLogo({
  width = 120,
  height = 40,
  variant = 'pulse',
  duration = 1500,
  loop = true,
  delay = 0,
  onAnimationComplete,
}: AnimatedLogoProps) {
  const fadeAnim = useRef(new Animated.Value(variant === 'fade-in' ? 0 : 1)).current
  const scaleAnim = useRef(new Animated.Value(variant === 'scale-bounce' ? 0.3 : 1)).current
  const pulseAnim = useRef(new Animated.Value(1)).current
  const rotateAnim = useRef(new Animated.Value(0)).current
  const shimmerAnim = useRef(new Animated.Value(0)).current

  useEffect(() => {
    const startDelay = delay > 0 ? Animated.delay(delay) : null

    let animation: Animated.CompositeAnimation | null = null

    switch (variant) {
      case 'pulse':
        animation = Animated.loop(
          Animated.sequence([
            Animated.timing(pulseAnim, {
              toValue: 1.08,
              duration: duration / 2,
              easing: Easing.inOut(Easing.ease),
              useNativeDriver: true,
            }),
            Animated.timing(pulseAnim, {
              toValue: 1,
              duration: duration / 2,
              easing: Easing.inOut(Easing.ease),
              useNativeDriver: true,
            }),
          ]),
          { iterations: loop ? -1 : 1 }
        )
        break

      case 'breathe':
        animation = Animated.loop(
          Animated.sequence([
            Animated.timing(scaleAnim, {
              toValue: 1.05,
              duration: duration,
              easing: Easing.inOut(Easing.sin),
              useNativeDriver: true,
            }),
            Animated.timing(scaleAnim, {
              toValue: 0.98,
              duration: duration,
              easing: Easing.inOut(Easing.sin),
              useNativeDriver: true,
            }),
          ]),
          { iterations: loop ? -1 : 1 }
        )
        break

      case 'fade-in':
        animation = Animated.parallel([
          Animated.timing(fadeAnim, {
            toValue: 1,
            duration: duration,
            easing: Easing.out(Easing.ease),
            useNativeDriver: true,
          }),
          Animated.timing(scaleAnim, {
            toValue: 1,
            duration: duration,
            easing: Easing.out(Easing.back(1.1)),
            useNativeDriver: true,
          }),
        ])
        break

      case 'scale-bounce':
        animation = Animated.spring(scaleAnim, {
          toValue: 1,
          friction: 4,
          tension: 50,
          useNativeDriver: true,
        })
        break

      case 'rotate-gentle':
        animation = Animated.loop(
          Animated.sequence([
            Animated.timing(rotateAnim, {
              toValue: 1,
              duration: duration,
              easing: Easing.inOut(Easing.ease),
              useNativeDriver: true,
            }),
            Animated.timing(rotateAnim, {
              toValue: -1,
              duration: duration,
              easing: Easing.inOut(Easing.ease),
              useNativeDriver: true,
            }),
            Animated.timing(rotateAnim, {
              toValue: 0,
              duration: duration / 2,
              easing: Easing.inOut(Easing.ease),
              useNativeDriver: true,
            }),
          ]),
          { iterations: loop ? -1 : 1 }
        )
        break

      case 'shimmer':
        animation = Animated.loop(
          Animated.sequence([
            Animated.timing(shimmerAnim, {
              toValue: 1,
              duration: duration,
              easing: Easing.linear,
              useNativeDriver: true,
            }),
            Animated.timing(shimmerAnim, {
              toValue: 0,
              duration: 0,
              useNativeDriver: true,
            }),
          ]),
          { iterations: loop ? -1 : 1 }
        )
        break
    }

    if (animation) {
      if (startDelay) {
        Animated.sequence([startDelay, animation]).start(() => {
          onAnimationComplete?.()
        })
      } else {
        animation.start(() => {
          onAnimationComplete?.()
        })
      }
    }

    return () => {
      animation?.stop()
    }
  }, [variant, duration, loop, delay, fadeAnim, scaleAnim, pulseAnim, rotateAnim, shimmerAnim, onAnimationComplete])

  const getTransformStyle = () => {
    switch (variant) {
      case 'pulse':
        return { transform: [{ scale: pulseAnim }] }
      
      case 'breathe':
        return { transform: [{ scale: scaleAnim }] }
      
      case 'fade-in':
        return { 
          opacity: fadeAnim,
          transform: [{ scale: scaleAnim }] 
        }
      
      case 'scale-bounce':
        return { transform: [{ scale: scaleAnim }] }
      
      case 'rotate-gentle':
        return {
          transform: [{
            rotate: rotateAnim.interpolate({
              inputRange: [-1, 0, 1],
              outputRange: ['-3deg', '0deg', '3deg'],
            }),
          }],
        }
      
      case 'shimmer':
        return {
          opacity: shimmerAnim.interpolate({
            inputRange: [0, 0.5, 1],
            outputRange: [1, 0.6, 1],
          }),
        }
      
      default:
        return {}
    }
  }

  return (
    <View style={styles.container}>
      <Animated.View style={[styles.logoWrapper, getTransformStyle()]}>
        <LogoGris width={width} height={height} />
      </Animated.View>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoWrapper: {
    alignItems: 'center',
    justifyContent: 'center',
  },
})
