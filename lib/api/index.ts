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
import * as agentNotion from './endpoints/agentNotion'
import * as activity from './endpoints/activity'
import * as catalog from './endpoints/catalog'
import * as dates from './endpoints/dates'
import * as leads from './endpoints/leads'
import * as mail from './endpoints/mail'
import * as pdfReports from './endpoints/pdfReports'
import * as portfolio from './endpoints/portfolio'
import * as properties from './endpoints/properties'

export const api = {
  agentNotion,
  activity,
  auth,
  catalog,
  dates,
  leads,
  mail,
  pdfReports,
  portfolio,
  properties,
} as const

export {
  activateAgentNotion,
  type ActivateAgentNotionPayload,
} from './endpoints/agentNotion'

export {
  getAppointmentActivityRecords,
  getFilteredAppointmentActivityRecords,
  getFilteredLeadActivityRecords,
  getLeadActivityRecords,
  getNotificationActivityRecords,
} from './endpoints/activity'

export {
  getCurrentUser,
  registerUser,
  loginUser,
  requestPasswordResetCode,
  verifyPasswordResetCode,
  confirmPasswordReset,
  checkEmailExists,
  updateUserProfile,
  deleteUploadedProfileImage,
  deleteUploadedAgentPresentationImage,
  getUploadedProfileImage,
  getUploadedAgentPresentation,
  uploadProfileImage,
  validateRegistrationData,
  type BackendProfileImagePayload,
  type UploadImageDocumentType,
  type UploadProfileImageResponse,
  type UploadedFilesResponse,
  type PasswordResetRequestInput,
  type PasswordResetRequestResponse,
  type PasswordResetVerifyInput,
  type PasswordResetVerifyResponse,
  type PasswordResetConfirmInput,
  type PasswordResetConfirmResponse,
} from './endpoints/auth'

export {
  getCatalogRentProperties,
  getCatalogSaleProperties,
  getAllCatalogProperties,
  mapApiPropertyToProperty,
  type PropertyCatalogItemResponse,
} from './endpoints/catalog'

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
  updateGoogleCalendarDate,
  type UpdateGoogleCalendarDatePayload,
  type GoogleCalendarDate,
  type GoogleCalendarDateFilters,
  type CreateGoogleCalendarDatePayload,
  type CreateGoogleCalendarDateResponse,
  type GoogleCalendarDateLeadSummary,
  type GoogleCalendarConnectionStatus,
  type GoogleCalendarOption,
  type GoogleCalendarSyncResponse,
  type SelectedGoogleCalendar,
  type GoogleTask,
  type GoogleTaskList,
  type AppointmentType,
} from './endpoints/dates'

export {
  createLeadRecord,
  createBackendLeadFollowUp,
  createBackendLeadV2Following,
  createBackendLeadV2Record,
  createBackendLeadV2Status,
  deleteBackendLeadV2Status,
  getBackendLeadRecords,
  getBackendLeadV2Records,
  getBackendLeadV2Statuses,
  getBackendLeadV2Followings,
  getBackendLeadFollowUps,
  getLeadAgents,
  getLeadAgentById,
  getLeadRecordById,
  getLeadRecords,
  mapBackendLeadToPropertyLead,
  mapBackendFollowUpToLeadFollowUp,
  saveLeadFollowUps,
  setBackendLeadV2NextAction,
  setBackendLeadV2Status,
  updateBackendLeadV2Record,
  type CreateBackendLeadFollowUpPayload,
  type CreateBackendLeadV2FollowingPayload,
  type CreateBackendLeadV2Payload,
  type SetBackendLeadV2NextActionPayload,
  type SetBackendLeadV2StatusPayload,
  type SetBackendLeadV2StatusResponse,
  type UpdateBackendLeadV2Payload,
  type BackendLeadV2FollowingRecord,
} from './endpoints/leads'

export {
  sendRegistrationVerificationEmail,
  verifyRegistrationEmailCode,
  type SendRegistrationVerificationEmailInput,
  type SendRegistrationVerificationEmailResponse,
  type VerifyRegistrationEmailCodeInput,
  type VerifyRegistrationEmailCodeResponse,
} from './endpoints/mail'

export {
  createAndOpenTemporaryPropertyListPdf,
  createTemporaryPropertyListPdfUrl,
  createAndOpenSinglePropertyPdf,
  createSinglePropertyPdfUrl,
  type GeneratePropertyListPdfPayload,
  type GenerateSinglePropertyPdfPayload,
  type TemporaryPdfReport,
  type PdfReportAction,
  type PdfReportAgentName,
  type PdfReportDesign,
  type PdfReportList,
} from './endpoints/pdfReports'

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
