import {Pressable, Text, StyleSheet} from 'react-native';
import {buttonColor, generalColors, radius, spacing, fontFamily, fontSize, lineHeight} from '@/theme'
import { styles } from './navigation/BottomNav.styles';
import { borderRadius } from '@/lib/theme';
type PrimaryButtonProps = {
  children: string,
  onPress: () => void
}

export const PrimaryButton = ({
  children,
  onPress
}: PrimaryButtonProps) => {
  return(
    <Pressable 
      onPress={onPress}
      style={({ pressed }) =>[
      stylePrimaryButton.primaryButton, pressed && stylePrimaryButton.primaryButtonPressed
    ]}>
      {({ pressed }) =>(
        <Text 
          style={[stylePrimaryButton.primaryText, pressed && stylePrimaryButton.primaryTextPressed]}
        >
          {children}
        </Text>
      )}
    </Pressable>
  )
}

const stylePrimaryButton = StyleSheet.create({
  primaryButton:{
    width: '100%',
    height: 52,
    alignItems: 'center',
    justifyContent:'center',
    borderRadius: radius.xl,
    backgroundColor: buttonColor.primaryBackground
  },
  primaryButtonPressed:{
    opacity: 0.68
  },
  primaryText:{
    color: generalColors.white,
    fontSize: fontSize.titleSmall,
    lineHeight: lineHeight.body,
  },
  primaryTextPressed:{

  }
})

export const SecondaryButton = ({
  children,
  onPress
}:PrimaryButtonProps) =>{
  return(
    <Pressable 
      onPress={onPress}
      style={({ pressed }) =>[
        styleSecondaryButton.secondaryButton, pressed && styleSecondaryButton.secondaryButtonPressed
    ]}>
      {({ pressed }) =>(
        <Text 
          style={[styleSecondaryButton.secondaryText, pressed && styleSecondaryButton.secondaryTextPressed
        ]}>
          {children}
        </Text>
      )}
    </Pressable>
  )
}

const styleSecondaryButton = StyleSheet.create({
  secondaryButton:{
    width: '100%',
    height: 52,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: buttonColor.BorderButtonSecondary,
    borderRadius: radius.xl,
    backgroundColor: buttonColor.secondaryBackground
  },
  secondaryButtonPressed:{
    opacity: .068
  },
  secondaryText:{
    color: buttonColor.textButtonSecondary,
    fontSize: fontSize.titleSmall,
    lineHeight: fontSize.body
  },
  secondaryTextPressed:{

  }
})
