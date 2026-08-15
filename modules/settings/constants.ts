import type { AppSettings } from './types'
import { 
  icons,
  logos
} from '@/assets'
import { OperationMode } from './types'
export const DEFAULT_APP_SETTINGS: AppSettings = {
  operationMode: 'both',
}
import { SvgProps } from 'react-native-svg'
import { ComponentType } from 'react'

export const SETTINGS_STORAGE_PREFIX = '@inicio-real-estate/settings'

export const dashboardAreaConfig = {
  adviser: {
    basePath: "/userAdviser",
    fallbackName: "Asesor",
    roleLabel: "Asesor de Rentas",
    headline: "Aqui esta lo importante de hoy",
  },
  coordinator: {
    basePath: "/userCoordinator",
    fallbackName: "Coordinador",
    roleLabel: "Coordinador",
    headline: "Aqui esta lo importante de hoy",
  },
} as const;

export const operationOptions: Array<{
  value: OperationMode
  label: string
  description: string
  icon: ComponentType<SvgProps>
  height: number
  width: number
}> = [
  { value: 'rent', label: 'Rentas', description: 'Prioriza rentas y sus seguimientos.', icon: icons.House, height: 20, width: 20 },
  { value: 'sale', label: 'Ventas', description: 'Prioriza ventas y oportunidades.', icon: icons.BuildingApartment, height: 20, width: 20 },
  { value: 'both', label: 'Mixto', description: 'Muestra todas las funciones e inventario.', icon: icons.Blend, height: 30, width: 30 },
]
