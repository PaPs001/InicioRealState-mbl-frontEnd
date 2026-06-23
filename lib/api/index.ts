/**
 * API centralizada - Punto de entrada unico
 * 
 * Uso:
 * import { api } from '@/lib/api'
 * 
 * // Auth
 * const result = await api.auth.loginUser({ email, password })
 * const result = await api.auth.registerUser({ ... })
 * 
 * // Catalog
 * const properties = await api.catalog.getCatalogRentProperties()
 * 
 * // User Properties
 * await api.properties.createUserProperty(payload, token)
 */

export { apiClient, coreApi, notificationsApi, API_URLS } from './client'

import * as auth from './endpoints/auth'
import * as activity from './endpoints/activity'
import * as catalog from './endpoints/catalog'
import * as dates from './endpoints/dates'
import * as documents from './endpoints/documents'
import * as investor from './endpoints/investor'
import * as leads from './endpoints/leads'
import * as messaging from './endpoints/messaging'
import * as pdfReports from './endpoints/pdfReports'
import * as portfolio from './endpoints/portfolio'
import * as properties from './endpoints/properties'

export const api = {
  activity,
  auth,
  catalog,
  dates,
  documents,
  investor,
  leads,
  messaging,
  pdfReports,
  portfolio,
  properties,
} as const

export {
  getAppointmentActivityRecords,
  getFilteredAppointmentActivityRecords,
  getFilteredLeadActivityRecords,
  getLeadActivityRecords,
  getNotificationActivityRecords,
} from './endpoints/activity'

export {
  getCurrentUser,
  getAuthMockUserById,
  registerUser,
  loginUser,
  checkEmailExists,
  updateUserProfile,
  validateRegistrationData,
} from './endpoints/auth'

export {
  getCatalogRentProperties,
  getCatalogSaleProperties,
  getAllCatalogProperties,
  mapApiPropertyToProperty,
  type PropertyCatalogItemResponse,
} from './endpoints/catalog'

export {
  getDocumentContractRecords,
  type DocumentContractRecord,
} from './endpoints/documents'

export {
  createGoogleCalendarDate,
  deleteGoogleCalendarDate,
  disconnectGoogleCalendar,
  getGoogleCalendarConnectionStatus,
  getGoogleCalendars,
  getGoogleCalendarAuthUrl,
  getGoogleCalendarDates,
  getGoogleCalendarTasks,
  getSelectedGoogleCalendars,
  saveSelectedGoogleCalendars,
  syncGoogleCalendars,
  type GoogleCalendarDate,
  type GoogleCalendarDateFilters,
  type CreateGoogleCalendarDatePayload,
  type GoogleCalendarConnectionStatus,
  type GoogleCalendarOption,
  type GoogleCalendarSyncResponse,
  type SelectedGoogleCalendar,
  type GoogleTask,
  type GoogleTaskList,
} from './endpoints/dates'

export {
  getInvestorCampaignPropertyRecord,
  getInvestorCampaignRecords,
  getInvestorPropertyEarningsRecords,
  getInvestorPropertyRecords,
} from './endpoints/investor'

export {
  createLeadRecord,
  createBackendLeadFollowUp,
  getBackendLeadRecords,
  getBackendLeadFollowUps,
  getLeadAgents,
  getLeadAgentById,
  getLeadRecordById,
  getLeadRecords,
  mapBackendLeadToPropertyLead,
  mapBackendFollowUpToLeadFollowUp,
  saveLeadFollowUps,
  type CreateBackendLeadFollowUpPayload,
} from './endpoints/leads'

export {
  createAndOpenTemporaryPropertyListPdf,
  createTemporaryPropertyListPdfUrl,
  type GeneratePropertyListPdfPayload,
  type TemporaryPdfReport,
  type PdfReportAction,
  type PdfReportAgentName,
  type PdfReportDesign,
  type PdfReportList,
} from './endpoints/pdfReports'

export {
  getConversationPropertyRecord,
  getConversationRecords,
  getConversationUserRecord,
} from './endpoints/messaging'

export {
  getPortfolioAgentRecord,
  getPortfolioOwnerProperties,
  getPortfolioPropertyEarningsRecord,
  getPortfolioPropertyRecord,
} from './endpoints/portfolio'

export {
  createUserProperty,
  getPropertyRecordById,
  getUserProperties,
  updateUserProperty,
  deleteUserProperty,
  type CreateUserPropertyPayload,
} from './endpoints/properties'
