export type OwnerProfileSelection = {
  propertyProfile?: string
  primaryInterest?: string
  priority?: string
}

export type OwnerProfileOption = {
  id: string
  label: string
  icon: string
}

export const ownerPropertyProfileOptions: OwnerProfileOption[] = [
  { id: 'residential', label: 'Residencial', icon: 'register-owner-profile-residential.png' },
  { id: 'rentals', label: 'Rentas', icon: 'register-owner-profile-rentals.png' },
  { id: 'commercial', label: 'Comercial', icon: 'register-owner-profile-commercial.png' },
  { id: 'mixed', label: 'Mixtos', icon: 'register-owner-profile-mixed.png' },
]

export const ownerPrimaryInterestOptions: OwnerProfileOption[] = [
  { id: 'manage', label: 'Gestionar propiedades', icon: 'register-owner-interest-manage.png' },
  { id: 'rentals', label: 'Rentas', icon: 'register-owner-interest-rentals.png' },
  { id: 'wealth', label: 'Patrimonio', icon: 'register-owner-interest-wealth.png' },
  { id: 'investment', label: 'Patrimonio e inversion', icon: 'register-owner-interest-investment.png' },
]

export const ownerPriorityOptions: OwnerProfileOption[] = [
  { id: 'cashflow', label: 'Flujo mensual', icon: 'register-owner-priority-cashflow.png' },
  { id: 'growth', label: 'Crecimiento', icon: 'register-owner-priority-growth.png' },
  { id: 'security', label: 'Seguridad', icon: 'register-owner-priority-security.png' },
  { id: 'expansion', label: 'Expansion', icon: 'register-owner-priority-expansion.png' },
]

export function isOwnerProfileSelectionComplete(selection: OwnerProfileSelection) {
  return Boolean(selection.propertyProfile && selection.primaryInterest && selection.priority)
}

export function getOwnerProfileRegisterParams(
  params: Record<string, string | undefined>,
  selection: OwnerProfileSelection,
) {
  return {
    clientType: 'owner',
    ownerAccess: '1',
    fullName: params.fullName ?? '',
    email: params.email ?? '',
    phone: params.phone ?? '',
    password: params.password ?? '',
    propertyProfile: selection.propertyProfile ?? '',
    primaryInterest: selection.primaryInterest ?? '',
    priority: selection.priority ?? '',
  } as const
}
