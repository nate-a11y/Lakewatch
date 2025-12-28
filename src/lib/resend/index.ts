import { Resend } from 'resend'

// Lazy initialize to avoid build-time errors when env vars aren't set
let _resend: Resend | null = null

function getResend(): Resend {
  if (!_resend) {
    if (!process.env.RESEND_API_KEY) {
      throw new Error('RESEND_API_KEY not configured')
    }
    _resend = new Resend(process.env.RESEND_API_KEY)
  }
  return _resend
}

const FROM_EMAIL = process.env.FROM_EMAIL || 'Lake Watch Pros <noreply@lakewatchpros.com>'

export { getResend as resend }

// Base send function
export async function sendEmail(data: {
  to: string | string[]
  subject: string
  html: string
  text?: string
  replyTo?: string
}) {
  const resend = getResend()
  const result = await resend.emails.send({
    from: FROM_EMAIL,
    to: data.to,
    subject: data.subject,
    html: data.html,
    text: data.text,
    replyTo: data.replyTo,
  })
  return result
}

// Inspection Complete Notification
export async function sendInspectionCompleteEmail(data: {
  to: string
  customerName: string
  propertyName: string
  inspectionDate: string
  status: 'good' | 'issues_found'
  issueCount?: number
  reportUrl: string
}) {
  const statusText = data.status === 'good'
    ? 'All clear! No issues were found during this inspection.'
    : `${data.issueCount || 'Some'} issue(s) were noted and require your attention.`

  const html = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
      </head>
      <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background-color: #0a0a0a; color: #ffffff; margin: 0; padding: 20px;">
        <div style="max-width: 600px; margin: 0 auto; background-color: #171717; border-radius: 12px; overflow: hidden;">
          <div style="background-color: #4cbb17; padding: 24px; text-align: center;">
            <h1 style="color: #000000; margin: 0; font-size: 24px;">Inspection Complete</h1>
          </div>
          <div style="padding: 32px;">
            <p style="margin: 0 0 16px; font-size: 16px;">Hi ${data.customerName},</p>
            <p style="margin: 0 0 24px; font-size: 16px;">Your inspection for <strong>${data.propertyName}</strong> on ${data.inspectionDate} has been completed.</p>

            <div style="background-color: ${data.status === 'good' ? 'rgba(76, 187, 23, 0.1)' : 'rgba(234, 179, 8, 0.1)'}; border: 1px solid ${data.status === 'good' ? 'rgba(76, 187, 23, 0.3)' : 'rgba(234, 179, 8, 0.3)'}; border-radius: 8px; padding: 16px; margin-bottom: 24px;">
              <p style="margin: 0; font-size: 16px; color: ${data.status === 'good' ? '#4cbb17' : '#eab308'};">
                ${statusText}
              </p>
            </div>

            <a href="${data.reportUrl}" style="display: inline-block; background-color: #4cbb17; color: #000000; text-decoration: none; padding: 12px 24px; border-radius: 8px; font-weight: 600; font-size: 16px;">View Full Report</a>
          </div>
          <div style="padding: 24px; border-top: 1px solid #27272a; text-align: center;">
            <p style="margin: 0; font-size: 14px; color: #71717a;">Lake Watch Pros - Professional Home Watch Services</p>
          </div>
        </div>
      </body>
    </html>
  `

  return sendEmail({
    to: data.to,
    subject: `Inspection Complete: ${data.propertyName}`,
    html,
  })
}

// Invoice Sent Notification
export async function sendInvoiceEmail(data: {
  to: string
  customerName: string
  invoiceNumber: string
  amount: number
  dueDate: string
  description: string
  paymentUrl: string
}) {
  const html = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
      </head>
      <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background-color: #0a0a0a; color: #ffffff; margin: 0; padding: 20px;">
        <div style="max-width: 600px; margin: 0 auto; background-color: #171717; border-radius: 12px; overflow: hidden;">
          <div style="background-color: #4cbb17; padding: 24px; text-align: center;">
            <h1 style="color: #000000; margin: 0; font-size: 24px;">New Invoice</h1>
          </div>
          <div style="padding: 32px;">
            <p style="margin: 0 0 16px; font-size: 16px;">Hi ${data.customerName},</p>
            <p style="margin: 0 0 24px; font-size: 16px;">A new invoice has been generated for your account.</p>

            <div style="background-color: #0a0a0a; border-radius: 8px; padding: 20px; margin-bottom: 24px;">
              <table style="width: 100%; border-collapse: collapse;">
                <tr>
                  <td style="padding: 8px 0; color: #71717a;">Invoice #</td>
                  <td style="padding: 8px 0; text-align: right; font-weight: 600;">${data.invoiceNumber}</td>
                </tr>
                <tr>
                  <td style="padding: 8px 0; color: #71717a;">Description</td>
                  <td style="padding: 8px 0; text-align: right;">${data.description}</td>
                </tr>
                <tr>
                  <td style="padding: 8px 0; color: #71717a;">Due Date</td>
                  <td style="padding: 8px 0; text-align: right;">${data.dueDate}</td>
                </tr>
                <tr style="border-top: 1px solid #27272a;">
                  <td style="padding: 16px 0 8px; font-weight: 600; font-size: 18px;">Total</td>
                  <td style="padding: 16px 0 8px; text-align: right; font-weight: 600; font-size: 18px; color: #4cbb17;">$${data.amount.toFixed(2)}</td>
                </tr>
              </table>
            </div>

            <a href="${data.paymentUrl}" style="display: inline-block; background-color: #4cbb17; color: #000000; text-decoration: none; padding: 12px 24px; border-radius: 8px; font-weight: 600; font-size: 16px;">Pay Now</a>
          </div>
          <div style="padding: 24px; border-top: 1px solid #27272a; text-align: center;">
            <p style="margin: 0; font-size: 14px; color: #71717a;">Lake Watch Pros - Professional Home Watch Services</p>
          </div>
        </div>
      </body>
    </html>
  `

  return sendEmail({
    to: data.to,
    subject: `Invoice ${data.invoiceNumber} - $${data.amount.toFixed(2)} Due ${data.dueDate}`,
    html,
  })
}

// Welcome Email
export async function sendWelcomeEmail(data: {
  to: string
  customerName: string
  loginUrl: string
}) {
  const html = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
      </head>
      <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background-color: #0a0a0a; color: #ffffff; margin: 0; padding: 20px;">
        <div style="max-width: 600px; margin: 0 auto; background-color: #171717; border-radius: 12px; overflow: hidden;">
          <div style="background-color: #4cbb17; padding: 24px; text-align: center;">
            <h1 style="color: #000000; margin: 0; font-size: 24px;">Welcome to Lake Watch Pros!</h1>
          </div>
          <div style="padding: 32px;">
            <p style="margin: 0 0 16px; font-size: 16px;">Hi ${data.customerName},</p>
            <p style="margin: 0 0 24px; font-size: 16px;">Thank you for choosing Lake Watch Pros for your home watch services. We're excited to help you protect your property!</p>

            <p style="margin: 0 0 16px; font-size: 16px;">With your customer portal, you can:</p>
            <ul style="margin: 0 0 24px; padding-left: 20px;">
              <li style="margin-bottom: 8px;">View inspection reports and photos</li>
              <li style="margin-bottom: 8px;">Manage your properties and access information</li>
              <li style="margin-bottom: 8px;">Submit service requests</li>
              <li style="margin-bottom: 8px;">Track upcoming inspections on your calendar</li>
              <li style="margin-bottom: 8px;">Message our team directly</li>
            </ul>

            <a href="${data.loginUrl}" style="display: inline-block; background-color: #4cbb17; color: #000000; text-decoration: none; padding: 12px 24px; border-radius: 8px; font-weight: 600; font-size: 16px;">Access Your Portal</a>
          </div>
          <div style="padding: 24px; border-top: 1px solid #27272a; text-align: center;">
            <p style="margin: 0; font-size: 14px; color: #71717a;">Lake Watch Pros - Professional Home Watch Services</p>
          </div>
        </div>
      </body>
    </html>
  `

  return sendEmail({
    to: data.to,
    subject: 'Welcome to Lake Watch Pros!',
    html,
  })
}

// Service Request Update
export async function sendServiceRequestUpdateEmail(data: {
  to: string
  customerName: string
  requestTitle: string
  newStatus: string
  notes?: string
  portalUrl: string
}) {
  const html = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
      </head>
      <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background-color: #0a0a0a; color: #ffffff; margin: 0; padding: 20px;">
        <div style="max-width: 600px; margin: 0 auto; background-color: #171717; border-radius: 12px; overflow: hidden;">
          <div style="background-color: #4cbb17; padding: 24px; text-align: center;">
            <h1 style="color: #000000; margin: 0; font-size: 24px;">Service Request Update</h1>
          </div>
          <div style="padding: 32px;">
            <p style="margin: 0 0 16px; font-size: 16px;">Hi ${data.customerName},</p>
            <p style="margin: 0 0 24px; font-size: 16px;">Your service request has been updated.</p>

            <div style="background-color: #0a0a0a; border-radius: 8px; padding: 20px; margin-bottom: 24px;">
              <p style="margin: 0 0 8px; font-weight: 600; font-size: 16px;">${data.requestTitle}</p>
              <p style="margin: 0; font-size: 14px; color: #71717a;">Status: <span style="color: #4cbb17; font-weight: 600;">${data.newStatus}</span></p>
              ${data.notes ? `<p style="margin: 16px 0 0; font-size: 14px; color: #a1a1aa;">${data.notes}</p>` : ''}
            </div>

            <a href="${data.portalUrl}" style="display: inline-block; background-color: #4cbb17; color: #000000; text-decoration: none; padding: 12px 24px; border-radius: 8px; font-weight: 600; font-size: 16px;">View Request</a>
          </div>
          <div style="padding: 24px; border-top: 1px solid #27272a; text-align: center;">
            <p style="margin: 0; font-size: 14px; color: #71717a;">Lake Watch Pros - Professional Home Watch Services</p>
          </div>
        </div>
      </body>
    </html>
  `

  return sendEmail({
    to: data.to,
    subject: `Service Request Update: ${data.requestTitle}`,
    html,
  })
}

// Message Notification
export async function sendNewMessageEmail(data: {
  to: string
  customerName: string
  senderName: string
  messagePreview: string
  conversationUrl: string
}) {
  const html = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
      </head>
      <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background-color: #0a0a0a; color: #ffffff; margin: 0; padding: 20px;">
        <div style="max-width: 600px; margin: 0 auto; background-color: #171717; border-radius: 12px; overflow: hidden;">
          <div style="background-color: #4cbb17; padding: 24px; text-align: center;">
            <h1 style="color: #000000; margin: 0; font-size: 24px;">New Message</h1>
          </div>
          <div style="padding: 32px;">
            <p style="margin: 0 0 16px; font-size: 16px;">Hi ${data.customerName},</p>
            <p style="margin: 0 0 24px; font-size: 16px;">You have a new message from ${data.senderName}:</p>

            <div style="background-color: #0a0a0a; border-radius: 8px; padding: 20px; margin-bottom: 24px; border-left: 4px solid #4cbb17;">
              <p style="margin: 0; font-size: 14px; color: #a1a1aa; font-style: italic;">"${data.messagePreview}"</p>
            </div>

            <a href="${data.conversationUrl}" style="display: inline-block; background-color: #4cbb17; color: #000000; text-decoration: none; padding: 12px 24px; border-radius: 8px; font-weight: 600; font-size: 16px;">Reply Now</a>
          </div>
          <div style="padding: 24px; border-top: 1px solid #27272a; text-align: center;">
            <p style="margin: 0; font-size: 14px; color: #71717a;">Lake Watch Pros - Professional Home Watch Services</p>
          </div>
        </div>
      </body>
    </html>
  `

  return sendEmail({
    to: data.to,
    subject: `New Message from ${data.senderName}`,
    html,
  })
}

// Password Reset
export async function sendPasswordResetEmail(data: {
  to: string
  resetUrl: string
}) {
  const html = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
      </head>
      <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background-color: #0a0a0a; color: #ffffff; margin: 0; padding: 20px;">
        <div style="max-width: 600px; margin: 0 auto; background-color: #171717; border-radius: 12px; overflow: hidden;">
          <div style="background-color: #4cbb17; padding: 24px; text-align: center;">
            <h1 style="color: #000000; margin: 0; font-size: 24px;">Reset Your Password</h1>
          </div>
          <div style="padding: 32px;">
            <p style="margin: 0 0 16px; font-size: 16px;">You requested to reset your password. Click the button below to create a new password:</p>

            <a href="${data.resetUrl}" style="display: inline-block; background-color: #4cbb17; color: #000000; text-decoration: none; padding: 12px 24px; border-radius: 8px; font-weight: 600; font-size: 16px; margin: 16px 0;">Reset Password</a>

            <p style="margin: 24px 0 0; font-size: 14px; color: #71717a;">If you didn't request this, you can safely ignore this email. This link will expire in 24 hours.</p>
          </div>
          <div style="padding: 24px; border-top: 1px solid #27272a; text-align: center;">
            <p style="margin: 0; font-size: 14px; color: #71717a;">Lake Watch Pros - Professional Home Watch Services</p>
          </div>
        </div>
      </body>
    </html>
  `

  return sendEmail({
    to: data.to,
    subject: 'Reset Your Password - Lake Watch Pros',
    html,
  })
}
