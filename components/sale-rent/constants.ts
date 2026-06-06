import type { LucideIcon } from 'lucide-react-native'
import { Building2, Briefcase, Home, MapPin, Store } from 'lucide-react-native'

import type { StepType } from './types'

export const INTERNAL_STEPS: StepType[] = [
  'transaction-type',
  'listing-source',
  'select-property',
  'internal-price',
  'client-info',
  'documents',
  'summary',
]

export const EXTERNAL_STEPS: StepType[] = [
  'transaction-type',
  'listing-source',
  'property-type',
  'property-details',
  'property-location',
  'property-amenities',
  'property-measurements',
  'property-photos',
  'property-pricing',
  'property-name',
  'owner-info',
  'external-agent-info',
  'client-info',
  'documents',
  'summary',
]

export type PropertyTypeOption = {
  id: string
  label: string
  icon: LucideIcon
}

export const PROPERTY_TYPES: PropertyTypeOption[] = [
  { id: 'house', label: 'Casa', icon: Home },
  { id: 'apartment', label: 'Apartamento', icon: Building2 },
  { id: 'land', label: 'Terreno', icon: MapPin },
  { id: 'office', label: 'Oficina', icon: Briefcase },
  { id: 'commercial', label: 'Local Comercial', icon: Store },
]

export const AMENITIES_LIST = [
  'Alberca', 'Gimnasio', 'Jardin', 'Terraza', 'Estacionamiento techado',
  'Seguridad 24/7', 'Area de juegos', 'Salon de eventos', 'Roof garden',
  'Elevador', 'Bodega', 'Cuarto de servicio', 'Area de lavado', 'Pet friendly',
  'Aire acondicionado', 'Calefaccion', 'Cocina integral', 'Closets',
]

export const DOCUMENTS_LIST = [
  { id: 'ine', label: 'INE / Pasaporte', required: true },
  { id: 'address', label: 'Comprobante de domicilio', required: true },
  { id: 'deeds', label: 'Escrituras', required: false },
  { id: 'contract', label: 'Contrato', required: false },
  { id: 'rfc', label: 'RFC', required: false },
  { id: 'curp', label: 'CURP', required: false },
  { id: 'income', label: 'Comprobante de ingresos', required: false },
  { id: 'authorization', label: 'Carta de autorizacion', required: false },
  { id: 'legal', label: 'Documentos legales del inmueble', required: false },
]

export const STEP_TITLES: Record<StepType, string> = {
  'transaction-type': 'Tipo de Transaccion',
  'listing-source': 'Origen del Inmueble',
  'select-property': 'Seleccionar Propiedad',
  'internal-price': 'Precio',
  'property-type': 'Tipo de Propiedad',
  'property-details': 'Detalles del Inmueble',
  'property-location': 'Ubicacion',
  'property-amenities': 'Amenidades',
  'property-measurements': 'Medidas',
  'property-photos': 'Fotografías',
  'property-pricing': 'Precio',
  'property-name': 'Nombre del Inmueble',
  'owner-info': 'Datos del Propietario',
  'external-agent-info': 'Asesor Externo',
  'client-info': 'Datos del Cliente',
  documents: 'Documentos',
  summary: 'Resumen',
}
