import {
  forwardRef,
  useImperativeHandle,
  useMemo,
  useRef,
} from 'react'
import {
  StyleSheet,
  TextInput,
  TouchableOpacity,
  View,
  type NativeSyntheticEvent,
  type StyleProp,
  type TextInputKeyPressEventData,
  type TextStyle,
  type ViewStyle,
} from 'react-native'

export type VerificationCodeInputHandle = {
  focus: (index?: number) => void
}

type VerificationCodeInputProps = {
  value: string
  onChange: (value: string) => void
  length?: number
  disabled?: boolean
  containerStyle?: StyleProp<ViewStyle>
  boxesStyle?: StyleProp<ViewStyle>
  boxStyle?: StyleProp<TextStyle>
  boxTextStyle?: StyleProp<TextStyle>
  activeBoxStyle?: StyleProp<TextStyle>
  gapAfterIndex?: number
}

export const VerificationCodeInput = forwardRef<
  VerificationCodeInputHandle,
  VerificationCodeInputProps
>(function VerificationCodeInput(
  {
    value,
    onChange,
    length = 6,
    disabled = false,
    containerStyle,
    boxesStyle,
    boxStyle,
    boxTextStyle,
    activeBoxStyle,
    gapAfterIndex,
  },
  ref,
) {
  const inputRefs = useRef<Array<TextInput | null>>([])
  const code = normalizeCode(value, length)
  const characters = useMemo(
    () => Array.from({ length }, (_, index) => code[index] ?? ''),
    [code, length],
  )

  const focus = (index = 0) => {
    const safeIndex = Math.min(Math.max(index, 0), length - 1)
    inputRefs.current[safeIndex]?.focus()
  }

  useImperativeHandle(ref, () => ({ focus }))

  const updateCharacter = (input: string, index: number) => {
    const digits = normalizeCode(input, length)
    const nextCharacters = [...characters]

    if (!digits) {
      nextCharacters[index] = ''
      onChange(nextCharacters.join(''))
      return
    }

    digits.split('').forEach((digit, offset) => {
      const targetIndex = index + offset
      if (targetIndex < length) nextCharacters[targetIndex] = digit
    })
    onChange(nextCharacters.join(''))

    if (index + digits.length < length) {
      focus(index + digits.length)
    }
  }

  const handleKeyPress = (
    event: NativeSyntheticEvent<TextInputKeyPressEventData>,
    index: number,
  ) => {
    if (event.nativeEvent.key !== 'Backspace' || characters[index]) return

    const previousIndex = index - 1
    if (previousIndex < 0) return

    const nextCharacters = [...characters]
    nextCharacters[previousIndex] = ''
    onChange(nextCharacters.join(''))
    focus(previousIndex)
  }

  return (
    <TouchableOpacity
      style={[styles.container, containerStyle]}
      activeOpacity={1}
      onPress={() => focus(code.length)}
      disabled={disabled}
    >
      <View style={[styles.boxes, boxesStyle]}>
        {characters.map((character, index) => (
          <TextInput
            key={index}
            ref={(input) => {
              inputRefs.current[index] = input
            }}
            style={[
              styles.box,
              styles.boxText,
              boxStyle,
              boxTextStyle,
              gapAfterIndex === index && styles.gapAfterBox,
              index === code.length && [styles.activeBox, activeBoxStyle],
            ]}
            value={character}
            onChangeText={(input) => updateCharacter(input, index)}
            onKeyPress={(event) => handleKeyPress(event, index)}
            keyboardType="number-pad"
            textContentType={index === 0 ? 'oneTimeCode' : 'none'}
            maxLength={length}
            autoFocus={index === 0}
            editable={!disabled}
            selectTextOnFocus
            textAlign="center"
            accessibilityLabel={`Digito ${index + 1} del codigo de verificacion`}
          />
        ))}
      </View>
    </TouchableOpacity>
  )
})

function normalizeCode(value: string, length: number) {
  return value.replace(/\D/g, '').slice(0, length)
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  boxes: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 10,
  },
  box: {
    width: 42,
    height: 54,
    borderWidth: 1,
    borderColor: '#e5dfd2',
    borderRadius: 8,
    backgroundColor: '#fffef9',
  },
  boxText: {
    color: '#697b74',
    fontSize: 18,
    fontWeight: '600',
    lineHeight: 23,
  },
  activeBox: {
    borderColor: '#c2824b',
  },
  gapAfterBox: {
    marginLeft: 22,
  },
})
