export const LEAD_ORIGINS = [
  'Manychat',
  'Google Ads',
  'Página Web',
  'Referido',
  'Monday',
  'Llamada',
  'Guardia Aldea',
  'Respond.io',
  'Agente Externo',
  'Campaña personal',
  'FORMULARIO META',
] as const

export type LeadOrigin = typeof LEAD_ORIGINS[number]

export type LeadOriginColors = {
  backgroundColor: string
  textColor: string
}

export const LEAD_ORIGIN_COLORS = {
  'Manychat': { backgroundColor: '#3B6591', textColor: '#EEEEEE' },
  'Google Ads': { backgroundColor: '#9F4B45', textColor: '#EEEEEE' },
  'Página Web': { backgroundColor: '#6C5080', textColor: '#EEEEEE' },
  'Referido': { backgroundColor: '#35694F', textColor: '#EEEEEE' },
  'Monday': { backgroundColor: '#896B2B', textColor: '#EEEEEE' },
  'Llamada': { backgroundColor: '#8E5330', textColor: '#EEEEEE' },
  'Guardia Aldea': { backgroundColor: '#705747', textColor: '#EEEEEE' },
  'Respond.io': { backgroundColor: '#804661', textColor: '#EEEEEE' },
  'Agente Externo': { backgroundColor: '#373735', textColor: '#EEEEEE' },
  'Campaña personal': { backgroundColor: '#666660', textColor: '#EEEEEE' },
  'FORMULARIO META': { backgroundColor: '#9F4B45', textColor: '#EEEEEE' },
} as const satisfies Record<LeadOrigin, LeadOriginColors>

export function getLeadOriginColors(value?: string): LeadOriginColors | null {
  const origin = getLeadOrigin(value)
  return origin ? LEAD_ORIGIN_COLORS[origin] : null
}

function normalizeOrigin(value: string) {
  return value.normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^\p{L}\p{N}]/gu, '')
    .toLowerCase()
}

const legacyOriginAliases: Record<string, LeadOrigin> = {
  meta: 'FORMULARIO META',
  facebook: 'FORMULARIO META',
  instagram: 'FORMULARIO META',
  web: 'Página Web',
  website: 'Página Web',
}

export function getLeadOrigin(value?: string): LeadOrigin | null {
  const normalized = normalizeOrigin(value || '')
  return LEAD_ORIGINS.find((origin) => normalizeOrigin(origin) === normalized)
    ?? legacyOriginAliases[normalized]
    ?? null
}
