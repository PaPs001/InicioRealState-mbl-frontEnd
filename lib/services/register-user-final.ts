import type { RegisterClientType } from './register-entry'

export type RegisterFinalSelection = {
  preferredChannel?: string
  platformNotification?: string
  notes: string
}

export const REGISTER_FINAL_NOTES_LIMIT = 200

export const registerPreferredChannelOptions = [
  { id: 'whatsapp', label: 'WhatsApp' },
  { id: 'email', label: 'Correo' },
  { id: 'call', label: 'Llamada' },
]

export const registerPlatformNotificationOptions = [
  { id: 'notices', label: 'Avisos' },
  { id: 'new-projects', label: 'Nuevos proyectos' },
  { id: 'follow-up', label: 'Seguimiento' },
]

export function normalizeRegisterFinalNotes(value: string) {
  return value.slice(0, REGISTER_FINAL_NOTES_LIMIT)
}

export function isRegisterFinalSelectionComplete(selection: RegisterFinalSelection) {
  return Boolean(selection.preferredChannel && selection.platformNotification)
}

export function getRegisterFinalValidationErrors(selection: RegisterFinalSelection) {
  const errors: string[] = []

  if (!selection.preferredChannel) {
    errors.push('Canales preferidos: selecciona como quieres que te contactemos.')
  }

  if (!selection.platformNotification) {
    errors.push('Notificaciones en la plataforma: selecciona que tipo de avisos quieres recibir.')
  }

  return errors
}

export function getRegisterFinalParams(
  params: Record<string, string | string[] | undefined>,
  selection: RegisterFinalSelection,
) {
  return {
    clientType: getParamValue(params.clientType) as RegisterClientType || 'owner',
    registrationAccess: '1',
    fullName: getParamValue(params.fullName),
    email: getParamValue(params.email),
    phone: getParamValue(params.phone),
    password: getParamValue(params.password),
    emailVerificationToken: getParamValue(params.emailVerificationToken),
    propertyProfile: getParamValue(params.propertyProfile),
    primaryInterest: getParamValue(params.primaryInterest),
    priority: getParamValue(params.priority),
    preferredChannel: selection.preferredChannel ?? '',
    platformNotification: selection.platformNotification ?? '',
    registrationNotes: selection.notes.trim(),
  } as const
}

function getParamValue(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] ?? '' : value ?? ''
}

