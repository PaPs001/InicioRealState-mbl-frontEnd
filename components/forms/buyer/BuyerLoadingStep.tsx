import { Animated, Text, View } from 'react-native'

interface BuyerLoadingStepProps {
  styles: any
  pulseStyle: object
  Logo: any
}

export function BuyerLoadingStep({ styles, pulseStyle, Logo }: BuyerLoadingStepProps) {
  return (
    <View style={styles.loadingContainer}>
      <Animated.View style={pulseStyle}>
        <Logo width={280} height={95} />
      </Animated.View>

      <Text style={styles.loadingText}>Buscando las mejores opciones...</Text>
    </View>
  )
}
