import twilio from 'twilio'

// Lazy initialize to avoid build-time errors when env vars aren't set
let _client: ReturnType<typeof twilio> | null = null

function getClient() {
  if (!_client) {
    if (!process.env.TWILIO_ACCOUNT_SID || !process.env.TWILIO_AUTH_TOKEN) {
      throw new Error('Twilio credentials not configured')
    }
    _client = twilio(
      process.env.TWILIO_ACCOUNT_SID,
      process.env.TWILIO_AUTH_TOKEN
    )
  }
  return _client
}

export { getClient as client }

// Base send function
export async function sendSMS(data: {
  to: string
  body: string
}) {
  const client = getClient()
  const fromNumber = process.env.TWILIO_PHONE_NUMBER
  if (!fromNumber) {
    throw new Error('TWILIO_PHONE_NUMBER not configured')
  }

  // Format phone number to E.164 format if not already
  let toNumber = data.to.replace(/\D/g, '')
  if (toNumber.length === 10) {
    toNumber = `+1${toNumber}`
  } else if (!toNumber.startsWith('+')) {
    toNumber = `+${toNumber}`
  }

  const message = await client.messages.create({
    body: data.body,
    from: fromNumber,
    to: toNumber,
  })
  return message
}

// Inspection Complete SMS
export async function sendInspectionCompleteSMS(data: {
  to: string
  propertyName: string
  status: 'good' | 'issues_found'
  reportUrl: string
}) {
  const statusText = data.status === 'good'
    ? 'All clear!'
    : 'Issues found - please review.'

  const body = `Lake Watch Pros: Inspection complete for ${data.propertyName}. ${statusText} View report: ${data.reportUrl}`

  return sendSMS({ to: data.to, body })
}

// Service Request Update SMS
export async function sendServiceRequestUpdateSMS(data: {
  to: string
  requestTitle: string
  newStatus: string
}) {
  const body = `Lake Watch Pros: Your service request "${data.requestTitle}" has been updated to: ${data.newStatus}`

  return sendSMS({ to: data.to, body })
}

// Urgent Issue Alert SMS
export async function sendUrgentAlertSMS(data: {
  to: string
  propertyName: string
  issue: string
}) {
  const body = `URGENT - Lake Watch Pros: Issue found at ${data.propertyName}: ${data.issue}. Please call us immediately.`

  return sendSMS({ to: data.to, body })
}

// Upcoming Inspection Reminder SMS
export async function sendInspectionReminderSMS(data: {
  to: string
  propertyName: string
  date: string
  timeWindow: string
}) {
  const body = `Lake Watch Pros: Reminder - Inspection scheduled for ${data.propertyName} on ${data.date}, ${data.timeWindow}.`

  return sendSMS({ to: data.to, body })
}

// Invoice Reminder SMS
export async function sendInvoiceReminderSMS(data: {
  to: string
  amount: number
  dueDate: string
  paymentUrl: string
}) {
  const body = `Lake Watch Pros: Invoice reminder - $${data.amount.toFixed(2)} due ${data.dueDate}. Pay now: ${data.paymentUrl}`

  return sendSMS({ to: data.to, body })
}

// Arrival Notification SMS (for pre-arrival service)
export async function sendArrivalNotificationSMS(data: {
  to: string
  propertyName: string
  arrivalDate: string
  technicianName: string
}) {
  const body = `Lake Watch Pros: Your property ${data.propertyName} will be ready for your arrival on ${data.arrivalDate}. ${data.technicianName} will complete the pre-arrival service.`

  return sendSMS({ to: data.to, body })
}

// Technician Check-in SMS (for admin/owner)
export async function sendTechnicianCheckinSMS(data: {
  to: string
  technicianName: string
  propertyName: string
  time: string
}) {
  const body = `Lake Watch Pros: ${data.technicianName} has checked in at ${data.propertyName} at ${data.time}.`

  return sendSMS({ to: data.to, body })
}
