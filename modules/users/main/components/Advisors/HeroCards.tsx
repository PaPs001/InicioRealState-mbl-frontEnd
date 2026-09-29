import { Pressable, Text, View } from "react-native";
import {styles} from './styles/HeroCards.styles'

type HeroCardColor = {
  backgroundColor: string,
  accentColor: string,
  textColor: string
}

type HeroCardProps ={
  Summary: number,
  OnPress: () => void,
  colors: HeroCardColor,
  titleLabel?: string
}

export const HeroCards = ({
  Summary,
  OnPress,
  colors,
  titleLabel
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
      <View style={styles.textContainer}>
        <Text numberOfLines={1} adjustsFontSizeToFit style={[styles.spacedLabel, { color: colors.textColor }]}>{titleLabel}</Text>
        <Text style={[styles.availableCount, { color: colors.accentColor }]}>{Summary}</Text>
        <Text style={[styles.spacedLabel, { color: colors.textColor }]}>DISPONIBLES </Text>
      </View>
    </Pressable>
  )
}
