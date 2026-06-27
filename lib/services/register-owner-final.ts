export type OwnerFinalSelection = {
  preferredChannel?: string
  platformNotification?: string
  notes: string
}

export const OWNER_FINAL_NOTES_LIMIT = 200

export const ownerPreferredChannelOptions = [
  { id: 'whatsapp', label: 'WhatsApp' },
  { id: 'email', label: 'Correo' },
  { id: 'call', label: 'Llamada' },
]

export const ownerPlatformNotificationOptions = [
  { id: 'notices', label: 'Avisos' },
  { id: 'new-projects', label: 'Nuevos proyectos' },
  { id: 'follow-up', label: 'Seguimiento' },
]

export function normalizeOwnerFinalNotes(value: string) {
  return value.slice(0, OWNER_FINAL_NOTES_LIMIT)
}

export function isOwnerFinalSelectionComplete(selection: OwnerFinalSelection) {
  return Boolean(selection.preferredChannel && selection.platformNotification)
}

export function getOwnerFinalRegisterParams(
  params: Record<string, string | undefined>,
  selection: OwnerFinalSelection,
) {
  return {
    clientType: 'owner',
    ownerAccess: '1',
    fullName: params.fullName ?? '',
    email: params.email ?? '',
    phone: params.phone ?? '',
    password: params.password ?? '',
    propertyProfile: params.propertyProfile ?? '',
    primaryInterest: params.primaryInterest ?? '',
    priority: params.priority ?? '',
    preferredChannel: selection.preferredChannel ?? '',
    platformNotification: selection.platformNotification ?? '',
    ownerNotes: selection.notes.trim(),
  } as const
}
