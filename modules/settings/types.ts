export type OperationMode = 'rent' | 'sale' | 'both'

export type AppSettings = {
  operationMode: OperationMode
}

export type AppCapabilities = {
  canViewRentals: boolean
  canViewSales: boolean
  canCreateRentalFollowUp: boolean
  canCreateSalesLead: boolean
}

export type SettingsContextValue = AppSettings & {
  isHydrated: boolean
  capabilities: AppCapabilities
  setOperationMode: (mode: OperationMode) => Promise<void>
  resetSettings: () => Promise<void>
}
