import {
  hasEmailShape,
  hasMinTrimmedLength,
  hasPasswordLength,
  hasPhoneLength,
} from '@/lib/services/form-validation'

export type OwnerAccessFormData = {
  fullName: string
  email: string
  phone: string
  password: string
}

export type OwnerAccessField = keyof OwnerAccessFormData

export function getInitialOwnerAccessFormData(): OwnerAccessFormData {
  return {
    fullName: '',
    email: '',
    phone: '',
    password: '',
  }
}

export function isOwnerAccessFormValid(data: OwnerAccessFormData) {
  return (
    hasMinTrimmedLength(data.fullName, 3) &&
    hasEmailShape(data.email) &&
    hasPhoneLength(data.phone) &&
    hasPasswordLength(data.password)
  )
}

export function getOwnerAccessRegisterParams(data: OwnerAccessFormData) {
  return {
    clientType: 'owner',
    ownerAccess: '1',
    fullName: data.fullName.trim(),
    email: data.email.trim(),
    phone: data.phone.trim(),
    password: data.password,
  }
}
