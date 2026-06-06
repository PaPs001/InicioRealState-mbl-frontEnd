import {
  Car,
  Dumbbell,
  Shield,
  Sparkles,
  Store,
  Trees,
  Waves,
  Wifi,
  Wind,
} from 'lucide-react-native'

export type PropertyType = 'house' | 'department' | 'lot'
export type AcquisitionType = 'inicio' | 'external'

export const TOTAL_STEPS = 7

export const AMENITIES = [
  { id: 'wifi', label: 'Internet/Wifi', icon: Wifi },
  { id: 'parking', label: 'Estacionamiento', icon: Car },
  { id: 'garden', label: 'Jardin', icon: Trees },
  { id: 'gym', label: 'Gimnasio', icon: Dumbbell },
  { id: 'security', label: 'Seguridad 24/7', icon: Shield },
  { id: 'ac', label: 'Aire acondicionado', icon: Wind },
  { id: 'pool', label: 'Alberca', icon: Waves },
  { id: 'furnished', label: 'Amueblado', icon: Sparkles },
  { id: 'store', label: 'Cuarto de servicio', icon: Store },
] as const
