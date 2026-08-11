import { Pressable, Text } from "react-native";
import {styles} from './styles/HeroCards.styles'

type HeroCardColor = {
  backgroundColor: string,
  accentColor: string,
  textColor: string
}

type HeroCardProps ={
  Summary: number,
  OnPress: () => void,
  colors: HeroCardColor
}

export const HeroCards = ({
  Summary,
  OnPress,
  colors
}: HeroCardProps ) => {



  return(
    <Pressable
      style={[
        styles.availableCard, {
          backgroundColor: colors.backgroundColor
        }
      ]} 
      onPress={OnPress}
    >
      <Text style={[styles.spacedLabel, { color: colors.textColor }]}>PROPIEDADES </Text>
      <Text style={[styles.availableCount, { color: colors.accentColor }]}>{Summary}</Text>
      <Text style={[styles.spacedLabel, { color: colors.textColor }]}>DISPONIBLES </Text>
    </Pressable>
  )
}
