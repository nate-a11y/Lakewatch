// Shared TypeScript types for Lake Watch Pros

// User roles
export type UserRole = 'customer' | 'technician' | 'staff' | 'admin' | 'owner'

// User
export interface User {
  id: number
  supabase_id: string
  email: string
  first_name: string
  last_name: string
  phone?: string
  role: UserRole
  avatar_url?: string
  stripe_customer_id?: string
  stripe_subscription_id?: string
  subscription_status?: string
  notification_preferences?: NotificationPreferences
  created_at: string
  updated_at: string
}

export interface NotificationPreferences {
  email_inspection_complete: boolean
  email_invoice: boolean
  email_messages: boolean
  sms_urgent: boolean
  sms_reminders: boolean
}

// Property
export interface Property {
  id: number
  name: string
  street: string
  city: string
  state: string
  zip: string
  latitude?: number
  longitude?: number
  owner_id: number
  service_plan_id?: number
  access_info?: AccessInfo
  emergency_contacts?: EmergencyContact[]
  utility_info?: UtilityInfo
  photos?: string[]
  notes?: string
  status: 'active' | 'inactive' | 'pending'
  created_at: string
  updated_at: string
  // Joined
  owner?: User
  service_plan?: ServicePlan
}

export interface AccessInfo {
  gate_code?: string
  lockbox_code?: string
  alarm_code?: string
  alarm_company?: string
  wifi_network?: string
  wifi_password?: string
  key_location?: string
  notes?: string
}

export interface EmergencyContact {
  name: string
  phone: string
  email?: string
  relationship: string
  is_primary: boolean
}

export interface UtilityInfo {
  electric_company?: string
  electric_account?: string
  water_company?: string
  water_account?: string
  gas_company?: string
  gas_account?: string
  hvac_company?: string
  hvac_contact?: string
  pool_service?: string
  pool_contact?: string
  landscaping?: string
  landscaping_contact?: string
}

// Service Plan
export interface ServicePlan {
  id: number
  name: string
  description?: string
  price_monthly: number
  price_yearly?: number
  inspection_frequency: 'weekly' | 'biweekly' | 'monthly'
  includes_photos: boolean
  max_properties: number
  features: string[]
  stripe_product_id?: string
  stripe_price_id_monthly?: string
  stripe_price_id_yearly?: string
  is_active: boolean
  created_at: string
}

// Inspection
export interface Inspection {
  id: number
  property_id: number
  technician_id?: number
  scheduled_date: string
  scheduled_time_start?: string
  scheduled_time_end?: string
  inspection_type: 'regular' | 'storm_check' | 'pre_arrival' | 'post_departure' | 'custom'
  checklist_id?: number
  status: 'pending' | 'scheduled' | 'in_progress' | 'completed' | 'cancelled'
  check_in_time?: string
  check_in_location?: { latitude: number; longitude: number }
  check_out_time?: string
  check_out_location?: { latitude: number; longitude: number }
  checklist_responses?: ChecklistResponse[]
  issues_found?: Issue[]
  overall_status?: 'good' | 'issues_found'
  summary_notes?: string
  weather?: { temperature: number; conditions: string }
  report_pdf_url?: string
  created_at: string
  updated_at: string
  // Joined
  property?: Property
  technician?: User
  checklist?: Checklist
}

export interface ChecklistResponse {
  item_id: string
  status: 'pass' | 'fail' | 'attention' | 'na'
  notes?: string
  photo_urls?: string[]
}

export interface Issue {
  id: string
  category: string
  description: string
  severity: 'low' | 'medium' | 'high' | 'critical'
  photo_urls?: string[]
  resolved: boolean
  resolved_at?: string
}

// Checklist
export interface Checklist {
  id: number
  name: string
  type: 'home_watch' | 'storm_check' | 'pre_arrival' | 'post_departure' | 'custom'
  items: ChecklistItem[]
  is_default: boolean
  is_active: boolean
  created_at: string
  updated_at: string
}

export interface ChecklistItem {
  id: string
  category: string
  item: string
  required: boolean
  requires_photo: boolean
  order: number
}

// Service Request
export interface ServiceRequest {
  id: number
  property_id: number
  requested_by_id: number
  assigned_to_id?: number
  request_type: 'pre_arrival' | 'post_departure' | 'grocery_stocking' | 'contractor_meetup' | 'storm_check' | 'custom'
  title: string
  description?: string
  priority: 'low' | 'normal' | 'high' | 'urgent'
  status: 'pending' | 'approved' | 'scheduled' | 'in_progress' | 'completed' | 'cancelled'
  preferred_date?: string
  preferred_time_start?: string
  preferred_time_end?: string
  scheduled_date?: string
  pricing?: {
    type: 'hourly' | 'flat' | 'quote'
    amount?: number
    notes?: string
  }
  completion_notes?: string
  completion_photos?: string[]
  invoice_id?: number
  created_at: string
  updated_at: string
  // Joined
  property?: Property
  requested_by?: User
  assigned_to?: User
}

// Occupancy Calendar
export interface OccupancyEvent {
  id: number
  property_id: number
  event_type: 'owner_visit' | 'guest_visit' | 'rental' | 'contractor'
  start_date: string
  end_date: string
  guest_name?: string
  guest_phone?: string
  guest_email?: string
  notes?: string
  pre_arrival_requested: boolean
  post_departure_requested: boolean
  pre_arrival_request_id?: number
  post_departure_request_id?: number
  created_by_id?: number
  created_at: string
  updated_at: string
  // Joined
  property?: Property
}

// Invoice
export interface Invoice {
  id: number
  customer_id: number
  property_id?: number
  line_items: InvoiceLineItem[]
  subtotal: number
  tax: number
  total: number
  status: 'draft' | 'sent' | 'paid' | 'overdue' | 'cancelled'
  due_date?: string
  paid_at?: string
  stripe_invoice_id?: string
  stripe_payment_intent_id?: string
  pdf_url?: string
  created_at: string
  updated_at: string
  // Joined
  customer?: User
  property?: Property
}

export interface InvoiceLineItem {
  description: string
  quantity: number
  unit_price: number
  total: number
}

// Conversation
export interface Conversation {
  id: number
  subject: string
  property_id?: number
  customer_id: number
  status: 'open' | 'closed'
  last_message_at?: string
  unread_by_customer: boolean
  unread_by_staff: boolean
  created_at: string
  updated_at: string
  // Joined
  property?: Property
  customer?: User
}

// Message
export interface Message {
  id: number
  conversation_id: number
  sender_id: number
  content: string
  is_internal: boolean
  read_at?: string
  attachments?: MessageAttachment[]
  created_at: string
  // Joined
  sender?: User
}

export interface MessageAttachment {
  id: number
  url: string
  filename: string
  mime_type: string
  size: number
}

// Notification
export interface Notification {
  id: number
  user_id: number
  type: 'inspection_scheduled' | 'inspection_complete' | 'report_ready' | 'invoice_sent' | 'payment_received' | 'message' | 'service_request_update' | 'system'
  title: string
  body: string
  data?: Record<string, unknown>
  channels: ('push' | 'email' | 'sms')[]
  sent_via: ('push' | 'email' | 'sms')[]
  read: boolean
  read_at?: string
  created_at: string
}

// Document
export interface Document {
  id: number
  property_id: number
  uploaded_by_id: number
  name: string
  type: 'insurance' | 'warranty' | 'manual' | 'contract' | 'photo' | 'other'
  file_url: string
  expires_at?: string
  notes?: string
  created_at: string
  // Joined
  property?: Property
  uploaded_by?: User
}

// API Response types
export interface ApiResponse<T> {
  data?: T
  error?: string
  success: boolean
}

export interface PaginatedResponse<T> {
  data: T[]
  total: number
  page: number
  limit: number
  hasMore: boolean
}

// Form Data types
export interface PropertyFormData {
  name: string
  street: string
  city: string
  state: string
  zip: string
  servicePlanId?: number
  accessInfo?: Partial<AccessInfo>
  emergencyContacts?: Partial<EmergencyContact>[]
  utilityInfo?: Partial<UtilityInfo>
  notes?: string
}

export interface ServiceRequestFormData {
  propertyId: number
  requestType: ServiceRequest['request_type']
  title: string
  description?: string
  preferredDate?: string
  preferredTimeStart?: string
  preferredTimeEnd?: string
}

export interface OccupancyFormData {
  propertyId: number
  eventType: OccupancyEvent['event_type']
  startDate: string
  endDate: string
  guestName?: string
  guestPhone?: string
  guestEmail?: string
  notes?: string
  preArrivalRequested: boolean
  postDepartureRequested: boolean
}
