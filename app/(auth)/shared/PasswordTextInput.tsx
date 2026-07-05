import React, { useEffect, useMemo, useRef, useState } from 'react'
import {
  TextInput,
  TextInputProps,
  TextStyle,
  TouchableOpacity,
  ViewStyle,
  StyleProp,
} from 'react-native'
import { Eye, EyeOff } from 'lucide-react-native'

type PasswordTextInputProps = Omit<TextInputProps, 'value' | 'onChangeText' | 'secureTextEntry'> & {
  value: string
  onChangeText: (value: string) => void
  iconColor: string
  inputStyle?: StyleProp<TextStyle>
  toggleStyle?: StyleProp<ViewStyle>
  revealDurationMs?: number
}

const MASK_CHAR = '•'

export function PasswordTextInput({
  value,
  onChangeText,
  iconColor,
  inputStyle,
  style,
  toggleStyle,
  revealDurationMs = 1400,
  ...props
}: PasswordTextInputProps) {
  const [showPassword, setShowPassword] = useState(false)
  const [visibleIndexes, setVisibleIndexes] = useState<Set<number>>(new Set())
  const timers = useRef<ReturnType<typeof setTimeout>[]>([])

  useEffect(() => {
    setVisibleIndexes((current) => {
      const next = new Set<number>()
      current.forEach((index) => {
        if (index < value.length) next.add(index)
      })
      return next
    })
  }, [value.length])

  useEffect(() => {
    return () => {
      timers.current.forEach(clearTimeout)
    }
  }, [])

  const displayValue = useMemo(() => {
    if (showPassword) return value

    return value
      .split('')
      .map((character, index) => (visibleIndexes.has(index) ? character : MASK_CHAR))
      .join('')
  }, [showPassword, value, visibleIndexes])

  const revealIndexes = (indexes: number[]) => {
    if (showPassword || indexes.length === 0) return

    setVisibleIndexes((current) => {
      const next = new Set(current)
      indexes.forEach((index) => next.add(index))
      return next
    })

    const timer = setTimeout(() => {
      setVisibleIndexes((current) => {
        const next = new Set(current)
        indexes.forEach((index) => next.delete(index))
        return next
      })
    }, revealDurationMs)

    timers.current.push(timer)
  }

  const handleHiddenChange = (nextDisplayValue: string) => {
    if (nextDisplayValue.length < value.length) {
      onChangeText(value.slice(0, nextDisplayValue.length))
      return
    }

    if (nextDisplayValue.length > value.length) {
      const insertedText = nextDisplayValue.slice(value.length)
      const nextValue = value + insertedText
      const insertedIndexes = insertedText.split('').map((_, index) => value.length + index)

      onChangeText(nextValue)
      revealIndexes(insertedIndexes)
      return
    }

    if (!nextDisplayValue.includes(MASK_CHAR)) {
      onChangeText(nextDisplayValue)
      revealIndexes(nextDisplayValue.split('').map((_, index) => index))
    }
  }

  const handleChangeText = (nextValue: string) => {
    if (showPassword) {
      onChangeText(nextValue)
      return
    }

    handleHiddenChange(nextValue)
  }

  const selectionEnd = displayValue.length

  return (
    <>
      <TextInput
        {...props}
        style={[style, inputStyle]}
        value={displayValue}
        onChangeText={handleChangeText}
        secureTextEntry={false}
        autoCapitalize="none"
        autoCorrect={false}
        selection={{ start: selectionEnd, end: selectionEnd }}
      />
      <TouchableOpacity
        style={toggleStyle}
        onPress={() => setShowPassword((current) => !current)}
        hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        accessibilityRole="button"
        accessibilityLabel={showPassword ? 'Ocultar contrasena' : 'Ver contrasena'}
      >
        {showPassword ? <EyeOff size={20} color={iconColor} /> : <Eye size={20} color={iconColor} />}
      </TouchableOpacity>
    </>
  )
}
