export type RegisterClientType = 'advisor' /*| 'coordinator'*/ | 'owner' | 'renter' | 'tenant'

export type RegisterEntryOption = {
  id: RegisterClientType
  title: string
  description: string
}

export const registerEntryOptions: RegisterEntryOption[] = [
  {
    id: 'advisor',
    title: 'Asesor',
    description: 'Acompana clientes y gestiona oportunidades',
  },
  /*{
    id: 'coordinator',
    title: 'Coordinador',
    description: 'Coordina asesores, citas y seguimientos',
  },*/
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
  const routes: Record<RegisterClientType, string> = {
    advisor: '/regAdvisor',
    //coordinator: '/regCoordinator-new',
    owner: '/regOwnerHouse',
    renter: '/regInquilino',
    tenant: '/regSearcher',
  }

  return routes[clientType] as never
}

export function getRegisterEntryRoute(clientType: RegisterClientType) {
  return getRegisterRoute(clientType)
}
