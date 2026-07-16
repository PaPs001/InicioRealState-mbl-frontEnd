import type { RegisterClientType } from './register-entry'

export type RegisterProfileSelection = {
  propertyProfile?: string[]
  primaryInterest?: string[]
  priority?: string[]
}

export type RegisterProfileField = keyof RegisterProfileSelection

export type RegisterProfileOption = {
  id: string
  label: string
  icon: string
}

export type RegisterProfileSection = {
  field: RegisterProfileField
  title: string
  options: RegisterProfileOption[]
}

const ownerPropertyProfileOptions: RegisterProfileOption[] = [
  { id: 'residential', label: 'Residencial', icon: 'register-owner-profile-residential.png' },
  { id: 'rentals', label: 'Rentas', icon: 'register-owner-profile-rentals.png' },
  { id: 'commercial', label: 'Comercial', icon: 'register-owner-profile-commercial.png' },
  { id: 'mixed', label: 'Mixtos', icon: 'register-owner-profile-mixed.png' },
]

const ownerPrimaryInterestOptions: RegisterProfileOption[] = [
  { id: 'manage', label: 'Gestionar propiedades', icon: 'register-owner-interest-manage.png' },
  { id: 'rentals', label: 'Rentas', icon: 'register-owner-interest-rentals.png' },
  { id: 'wealth', label: 'Patrimonio', icon: 'register-owner-interest-wealth.png' },
  { id: 'investment', label: 'Patrimonio e inversion', icon: 'register-owner-interest-investment.png' },
]

const ownerPriorityOptions: RegisterProfileOption[] = [
  { id: 'cashflow', label: 'Flujo mensual', icon: 'register-owner-priority-cashflow.png' },
  { id: 'growth', label: 'Crecimiento', icon: 'register-owner-priority-growth.png' },
  { id: 'security', label: 'Seguridad', icon: 'register-owner-priority-security.png' },
  { id: 'expansion', label: 'Expansion', icon: 'register-owner-priority-expansion.png' },
]

const advisorWorkFocusOptions: RegisterProfileOption[] = [
  { id: 'sales', label: 'Ventas', icon: 'register-owner-profile-residential.png' },
  { id: 'rentals', label: 'Rentas', icon: 'register-owner-interest-rentals.png' },
  { id: 'commercial-support', label: 'Apoyo comercial', icon: 'register-owner-profile-commercial.png' },
  { id: 'sales-and-rentals', label: 'Ventas y rentas', icon: 'register-owner-profile-mixed.png' },
]

const advisorClientTypeOptions: RegisterProfileOption[] = [
  { id: 'buyers', label: 'Compradores', icon: 'register-owner-interest-investment.png' },
  { id: 'tenants', label: 'Inquilinos', icon: 'register-owner-interest-rentals.png' },
  { id: 'owners', label: 'Propietarios', icon: 'register-owner-priority-security.png' },
  { id: 'investors', label: 'Inversionistas', icon: 'register-owner-interest-wealth.png' },
]

const advisorPropertyTypeOptions: RegisterProfileOption[] = [
  { id: 'house', label: 'Casa', icon: 'register-owner-profile-residential.png' },
  { id: 'apartment', label: 'Departamento', icon: 'register-owner-priority-growth.png' },
  { id: 'commercial', label: 'Comercial', icon: 'register-owner-profile-commercial.png' },
  { id: 'land', label: 'Terrenos', icon: 'register-owner-priority-expansion.png' },
]

const ownerProfileSections: RegisterProfileSection[] = [
  {
    field: 'propertyProfile',
    title: 'Perfil de propietario',
    options: ownerPropertyProfileOptions,
  },
  {
    field: 'primaryInterest',
    title: 'Me interesa principalmente',
    options: ownerPrimaryInterestOptions,
  },
  {
    field: 'priority',
    title: 'Mis prioridades',
    options: ownerPriorityOptions,
  },
]

const advisorProfileSections: RegisterProfileSection[] = [
  {
    field: 'propertyProfile',
    title: 'Que area trabajaras principalmente?',
    options: advisorWorkFocusOptions,
  },
  {
    field: 'primaryInterest',
    title: 'Que tipo de clientes atenderas con mayor frecuencia?',
    options: advisorClientTypeOptions,
  },
  {
    field: 'priority',
    title: 'Que tipo de propiedad trabajas principales?',
    options: advisorPropertyTypeOptions,
  },
]

const registerProfileSectionsByClientType: Record<RegisterClientType, RegisterProfileSection[]> = {
  advisor: advisorProfileSections,
  owner: ownerProfileSections,
  renter: ownerProfileSections,
  tenant: ownerProfileSections,
}

export function getRegisterProfileClientType(value: string | string[] | undefined): RegisterClientType {
  const clientType = getParamValue(value) as RegisterClientType
  if (clientType === 'advisor' || clientType === 'owner' || clientType === 'renter' || clientType === 'tenant') {
    return clientType
  }

  return 'owner'
}

export function getRegisterProfileSections(clientType: RegisterClientType) {
  return registerProfileSectionsByClientType[clientType] ?? ownerProfileSections
}

export function toggleRegisterProfileSelection(
  selection: RegisterProfileSelection,
  field: RegisterProfileField,
  value: string,
): RegisterProfileSelection {
  const currentValues = selection[field] ?? []
  const nextValues = currentValues.includes(value)
    ? currentValues.filter((currentValue) => currentValue !== value)
    : [...currentValues, value]

  return {
    ...selection,
    [field]: nextValues,
  }
}

export function isRegisterProfileSelectionComplete(selection: RegisterProfileSelection) {
  return Boolean(
    selection.propertyProfile?.length && selection.primaryInterest?.length && selection.priority?.length,
  )
}

export function getRegisterProfileValidationErrors(
  selection: RegisterProfileSelection,
  sections: RegisterProfileSection[],
) {
  return sections
    .filter((section) => !selection[section.field]?.length)
    .map((section) => `${section.title}: selecciona al menos una opcion.`)
}

export function getRegisterProfileParams(
  params: Record<string, string | string[] | undefined>,
  selection: RegisterProfileSelection,
) {
  return {
    clientType: getRegisterProfileClientType(params.clientType),
    registrationAccess: '1',
    fullName: getParamValue(params.fullName),
    email: getParamValue(params.email),
    phone: getParamValue(params.phone),
    password: getParamValue(params.password),
    emailVerificationToken: getParamValue(params.emailVerificationToken),
    propertyProfile: selection.propertyProfile ?? [],
    primaryInterest: selection.primaryInterest ?? [],
    priority: selection.priority ?? [],
  } as const
}

function getParamValue(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] ?? '' : value ?? ''
}