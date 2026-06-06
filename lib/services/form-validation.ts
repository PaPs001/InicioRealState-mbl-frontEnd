export function hasRequiredText(value: string) {
  return value.trim().length > 0
}

export function hasMinTrimmedLength(value: string, minLength: number) {
  return value.trim().length >= minLength
}

export function hasEmailShape(value: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim())
}

export function hasPhoneLength(value: string, minLength = 10) {
  return value.trim().length >= minLength
}

export function hasPasswordLength(value: string, minLength = 6) {
  return value.trim().length >= minLength
}
