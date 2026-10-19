import type { RegisterClientType } from './register-entry'

export type RegisterFinalSelection = {
  preferredChannel?: string[]
  platformNotification?: string[]
  notes: string
}

export const REGISTER_FINAL_NOTES_LIMIT = 200

export const registerPreferredChannelOptions = [
  { id: 'whatsapp', label: 'WhatsApp' },
  { id: 'email', label: 'Correo' },
  { id: 'call', label: 'Llamada' },
  { id: 'date', label: 'Cita presencial' },
  { id: 'videoCall', label: 'Videollamada ' },
  { id: 'others', label: 'Otros'}
]

type RegisterFinalOption = {
  id: string
  label: string
}

export const registerPlatformNotificationOptionsByClientType: Record<RegisterClientType, RegisterFinalOption[]> = {
  advisor: [
    { id: 'mezcales', label: 'Mezcales' },
    { id: 'nuevo-Vallarta', label: 'Nuevo Vallarta' },
    { id: 'bucerias', label: 'Bucerias' },
    { id: 'versalles', label: 'Versalles'},
    { id: 'puerto-vallarta', label: 'Puerto Vallarta'},
    { id: 'others', label: 'Otros'}
  ],
  owner: [
    { id: 'owner-property-updates', label: 'Avance de propiedad' },
    { id: 'owner-prospect-activity', label: 'Actividad de prospectos' },
    { id: 'owner-documents', label: 'Documentos' },
  ],
  renter: [
    { id: 'renter-payments', label: 'Pagos' },
    { id: 'renter-incidents', label: 'Incidencias' },
    { id: 'renter-announcements', label: 'Avisos' },
  ],
  tenant: [
    { id: 'mezcales', label: 'Mezcales' },
    { id: 'nuevo-Vallarta', label: 'Nuevo Vallarta' },
    { id: 'bucerias', label: 'Bucerias' },
    { id: 'versalles', label: 'Versalles'},
    { id: 'puerto-vallarta', label: 'Puerto Vallarta'},
    { id: 'others', label: 'Otros'}
  ],
}

export const registerPlatformNotificationOptions = registerPlatformNotificationOptionsByClientType.owner

export function getRegisterPlatformNotificationOptions(clientType?: string) {
  return isRegisterClientType(clientType)
    ? registerPlatformNotificationOptionsByClientType[clientType]
    : registerPlatformNotificationOptions
}

export function getRegisterFinalClientType(params: Record<string, string | string[] | undefined>) {
  const clientType = getParamValue(params.clientType)

  return isRegisterClientType(clientType) ? clientType : 'owner'
}

function isRegisterClientType(value?: string): value is RegisterClientType {
  return value === 'advisor' || value === 'owner' || value === 'renter' || value === 'tenant'
}

export const legacyRegisterPlatformNotificationOptions = [
  { id: 'Mezcales', label: 'Avisos' },
  { id: 'Nuevo Vallarta', label: 'Nuevos proyectos' },
  { id: 'Bucerias', label: 'Seguimiento' },
]

export function toggleRegisterFinalSelection(
  selection: RegisterFinalSelection,
  field: 'preferredChannel' | 'platformNotification',
  value: string,
): RegisterFinalSelection {
  const currentValues = selection[field] ?? []
  const nextValues = currentValues.includes(value)
    ? currentValues.filter((currentValue) => currentValue !== value)
    : [...currentValues, value]

  return {
    ...selection,
    [field]: nextValues,
  }
}
export function normalizeRegisterFinalNotes(value: string) {
  return value.slice(0, REGISTER_FINAL_NOTES_LIMIT)
}

export function isRegisterFinalSelectionComplete(selection: RegisterFinalSelection) {
  return Boolean(selection.preferredChannel?.length && selection.platformNotification?.length)
}

export function getRegisterFinalValidationErrors(selection: RegisterFinalSelection) {
  const errors: string[] = []

  if (!selection.preferredChannel?.length) {
    errors.push('Canales preferidos: selecciona como quieres que te contactemos.')
  }

  if (!selection.platformNotification?.length) {
    errors.push('Notificaciones en la plataforma: selecciona que tipo de avisos quieres recibir.')
  }

  return errors
}

export function getRegisterFinalParams(
  params: Record<string, string | string[] | undefined>,
  selection: RegisterFinalSelection,
) {
  return {
    clientType: getRegisterFinalClientType(params),
    registrationAccess: '1',
    fullName: getParamValue(params.fullName),
    email: getParamValue(params.email),
    phone: getParamValue(params.phone),
    password: getParamValue(params.password),
    emailVerificationToken: getParamValue(params.emailVerificationToken),
    propertyProfile: getParamValues(params.propertyProfile),
    primaryInterest: getParamValues(params.primaryInterest),
    priority: getParamValues(params.priority),
    preferredChannel: selection.preferredChannel ?? [],
    platformNotification: selection.platformNotification ?? [],
    registrationNotes: selection.notes.trim(),
  } as const
}

function getParamValues(value: string | string[] | undefined) {
  if (Array.isArray(value)) {
    return value.filter((item) => item !== '')
  }

  return value ? [value] : []
}
function getParamValue(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] ?? '' : value ?? ''
}

