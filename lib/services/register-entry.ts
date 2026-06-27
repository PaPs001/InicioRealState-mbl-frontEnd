export type RegisterClientType = 'advisor' | 'owner' | 'renter' | 'tenant'

export type RegisterEntryOption = {
  id: RegisterClientType
  title: string
  description: string
}

export const registerEntryOptions: RegisterEntryOption[] = [
  {
    id: 'advisor',
    title: 'Equipo INICIO',
    description: 'Asesores, coordinacion y ventas',
  },
  {
    id: 'owner',
    title: 'Propietario',
    description: 'Consulta el avance de tu propiedad',
  },
  {
    id: 'renter',
    title: 'Inquilino',
    description: 'Pagos, reportes e incidencias',
  },
  {
    id: 'tenant',
    title: 'Busco Propiedad',
    description: 'Ver ventas, rentas, promociones y agendar cita',
  },
]

export function getRegisterRoute(clientType: RegisterClientType) {
  return `/register?clientType=${clientType}` as const
}

export function getRegisterEntryRoute(clientType: RegisterClientType) {
  if (clientType === 'owner') {
    return '/register-owner' as const
  }

  return getRegisterRoute(clientType)
}
