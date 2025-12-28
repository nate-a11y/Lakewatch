// Property actions
export {
  getCustomerProperties,
  getCustomerProperty,
  getAllProperties,
  getProperty,
  createProperty,
  updateProperty,
  deleteProperty,
  getTechnicianProperties,
} from './properties'

// Inspection actions
export {
  getCustomerInspections,
  getCustomerInspection,
  getAllInspections,
  getTechnicianSchedule,
  getTechnicianHistory,
  checkInToInspection,
  submitInspectionResponse,
  completeInspection,
  scheduleInspection,
  getChecklist,
  getAllChecklists,
} from './inspections'

// Service request actions
export {
  getCustomerRequests,
  getCustomerRequest,
  createServiceRequest,
  getAllRequests,
  getRequest,
  updateRequest,
  getTechnicianRequests,
  startRequest,
  completeRequest,
  cancelRequest,
} from './requests'

// Message actions
export {
  getCustomerConversations,
  getCustomerConversation,
  sendCustomerMessage,
  startConversation,
  getAllConversations,
  getConversation,
  sendStaffMessage,
  closeConversation,
  reopenConversation,
} from './messages'

// Calendar actions
export {
  getCustomerCalendarEvents,
  createCalendarEvent,
  updateCalendarEvent,
  deleteCalendarEvent,
  getAllCalendarEvents,
  getUpcomingArrivals,
  getUpcomingDepartures,
} from './calendar'

// Billing actions
export {
  getCustomerInvoices,
  getCustomerInvoice,
  getCustomerBillingSummary,
  getAllInvoices,
  getInvoice,
  createInvoice,
  updateInvoice,
  markInvoicePaid,
  sendInvoice,
  getServicePlans,
} from './billing'

// User actions
export {
  getCurrentUser,
  updateProfile,
  updateNotificationPreferences,
  getAllCustomers,
  getCustomer,
  getAllTeamMembers,
  getTeamMember,
  updateTeamMemberRole,
  getTechnicians,
  getNotifications,
  markNotificationRead,
  markAllNotificationsRead,
} from './users'

// Export types
export type { Property, PropertyContact, PropertyUtility } from './properties'
export type { Inspection, InspectionResponse, InspectionIssue } from './inspections'
export type { ServiceRequest } from './requests'
export type { Conversation, Message } from './messages'
export type { OccupancyEvent } from './calendar'
export type { Invoice, InvoiceLineItem } from './billing'
export type { User } from './users'
