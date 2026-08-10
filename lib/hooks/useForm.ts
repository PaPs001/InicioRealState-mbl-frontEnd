/**
 * Hook para manejar formularios con validacion
 */
import { useState, useCallback, useMemo } from 'react'

type ValidationRule<T> = {
  validate: (value: T[keyof T], values: T) => boolean
  message: string
}

type FieldValidation<T> = {
  [K in keyof T]?: ValidationRule<T>[]
}

interface UseFormOptions<T> {
  validations?: FieldValidation<T>
  onSubmit?: (values: T) => Promise<void> | void
}

interface UseFormResult<T> {
  values: T
  errors: Partial<Record<keyof T, string>>
  touched: Partial<Record<keyof T, boolean>>
  isValid: boolean
  isSubmitting: boolean
  isDirty: boolean
  
  // Acciones
  setValue: <K extends keyof T>(field: K, value: T[K]) => void
  setValues: (values: Partial<T>) => void
  setError: (field: keyof T, error: string) => void
  clearError: (field: keyof T) => void
  clearErrors: () => void
  setTouched: (field: keyof T, touched?: boolean) => void
  reset: () => void
  validate: () => boolean
  validateField: (field: keyof T) => boolean
  handleSubmit: () => Promise<void>
  
  // Helpers para inputs
  getFieldProps: (field: keyof T) => {
    value: T[keyof T]
    onChangeText: (text: string) => void
    onBlur: () => void
    error: string | undefined
  }
}

export function useForm<T extends Record<string, unknown>>(
  options: UseFormOptions<T>
): UseFormResult<T> {
  const { initialValues, onSubmit } = options
  const validations: FieldValidation<T> = options.validations ?? {}

  const [values, setValuesState] = useState<T>(initialValues)
  const [errors, setErrors] = useState<Partial<Record<keyof T, string>>>({})
  const [touched, setTouchedState] = useState<Partial<Record<keyof T, boolean>>>({})
  const [isSubmitting, setIsSubmitting] = useState(false)

  const isDirty = useMemo(() => {
    return JSON.stringify(values) !== JSON.stringify(initialValues)
  }, [values, initialValues])

  const validateField = useCallback((field: keyof T): boolean => {
    const fieldValidations = validations[field]
    if (!fieldValidations) return true

    for (const rule of fieldValidations) {
      if (!rule.validate(values[field], values)) {
        setErrors(prev => ({ ...prev, [field]: rule.message }))
        return false
      }
    }

    setErrors(prev => {
      const next = { ...prev }
      delete next[field]
      return next
    })
    return true
  }, [values, validations])

  const validate = useCallback((): boolean => {
    let isValid = true
    const newErrors: Partial<Record<keyof T, string>> = {}

    for (const field of Object.keys(validations) as (keyof T)[]) {
      const fieldValidations = validations[field]
      if (!fieldValidations) continue

      for (const rule of fieldValidations) {
        if (!rule.validate(values[field], values)) {
          newErrors[field] = rule.message
          isValid = false
          break
        }
      }
    }

    setErrors(newErrors)
    return isValid
  }, [values, validations])

  const isValid = useMemo(() => {
    for (const field of Object.keys(validations) as (keyof T)[]) {
      const fieldValidations = validations[field]
      if (!fieldValidations) continue

      for (const rule of fieldValidations) {
        if (!rule.validate(values[field], values)) {
          return false
        }
      }
    }
    return true
  }, [values, validations])

  const setValue = useCallback(<K extends keyof T>(field: K, value: T[K]) => {
    setValuesState(prev => ({ ...prev, [field]: value }))
  }, [])

  const setValues = useCallback((newValues: Partial<T>) => {
    setValuesState(prev => ({ ...prev, ...newValues }))
  }, [])

  const setError = useCallback((field: keyof T, error: string) => {
    setErrors(prev => ({ ...prev, [field]: error }))
  }, [])

  const clearError = useCallback((field: keyof T) => {
    setErrors(prev => {
      const next = { ...prev }
      delete next[field]
      return next
    })
  }, [])

  const clearErrors = useCallback(() => {
    setErrors({})
  }, [])

  const setTouched = useCallback((field: keyof T, isTouched = true) => {
    setTouchedState(prev => ({ ...prev, [field]: isTouched }))
  }, [])

  const reset = useCallback(() => {
    setValuesState(initialValues)
    setErrors({})
    setTouchedState({})
  }, [initialValues])

  const handleSubmit = useCallback(async () => {
    if (!validate() || !onSubmit) return

    setIsSubmitting(true)
    try {
      await onSubmit(values)
    } finally {
      setIsSubmitting(false)
    }
  }, [validate, onSubmit, values])

  const getFieldProps = useCallback((field: keyof T) => ({
    value: values[field],
    onChangeText: (text: string) => setValue(field, text as T[keyof T]),
    onBlur: () => {
      setTouched(field)
      validateField(field)
    },
    error: touched[field] ? errors[field] : undefined,
  }), [values, errors, touched, setValue, setTouched, validateField])

  return {
    values,
    errors,
    touched,
    isValid,
    isSubmitting,
    isDirty,
    setValue,
    setValues,
    setError,
    clearError,
    clearErrors,
    setTouched,
    reset,
    validate,
    validateField,
    handleSubmit,
    getFieldProps,
  }
}

// Validadores comunes
export const validators = {
  required: (message = 'Este campo es requerido') => ({
    validate: (value: unknown) => {
      if (typeof value === 'string') return value.trim().length > 0
      return value !== null && value !== undefined
    },
    message,
  }),

  email: (message = 'Email invalido') => ({
    validate: (value: unknown) => {
      if (typeof value !== 'string') return false
      return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)
    },
    message,
  }),

  minLength: (min: number, message?: string) => ({
    validate: (value: unknown) => {
      if (typeof value !== 'string') return false
      return value.length >= min
    },
    message: message || `Minimo ${min} caracteres`,
  }),

  maxLength: (max: number, message?: string) => ({
    validate: (value: unknown) => {
      if (typeof value !== 'string') return true
      return value.length <= max
    },
    message: message || `Maximo ${max} caracteres`,
  }),

  phone: (message = 'Telefono invalido') => ({
    validate: (value: unknown) => {
      if (typeof value !== 'string') return false
      return /^\d{10,15}$/.test(value.replace(/\D/g, ''))
    },
    message,
  }),

  match: (fieldToMatch: string, message = 'Los campos no coinciden') => ({
    validate: (value: unknown, values: Record<string, unknown>) => {
      return value === values[fieldToMatch]
    },
    message,
  }),
}

export default useForm
