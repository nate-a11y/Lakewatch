import { jsPDF } from 'jspdf'

interface ChecklistItem {
  category: string
  item: string
  status: 'pass' | 'fail' | 'attention' | 'na'
  notes?: string
  photoUrl?: string
}

interface InspectionReportData {
  reportNumber: string
  inspectionDate: string
  inspectionTime: string
  property: {
    name: string
    address: string
    city: string
    state: string
    zip: string
  }
  owner: {
    name: string
    email: string
    phone?: string
  }
  technician: {
    name: string
  }
  weather?: {
    temperature?: number
    conditions?: string
  }
  overallStatus: 'good' | 'issues_found'
  checklistItems: ChecklistItem[]
  summaryNotes?: string
  photos?: Array<{
    url: string
    caption: string
  }>
}

// Generate inspection report PDF
export async function generateInspectionReportPDF(
  data: InspectionReportData
): Promise<Blob> {
  const doc = new jsPDF()
  const pageWidth = doc.internal.pageSize.getWidth()
  const margin = 20
  let y = margin

  // Colors
  const primaryColor = [76, 187, 23] as [number, number, number] // #4cbb17
  const textColor = [0, 0, 0] as [number, number, number]
  const grayColor = [113, 113, 122] as [number, number, number]

  // Header
  doc.setFillColor(...primaryColor)
  doc.rect(0, 0, pageWidth, 40, 'F')

  doc.setTextColor(0, 0, 0)
  doc.setFontSize(24)
  doc.setFont('helvetica', 'bold')
  doc.text('Lake Watch Pros', margin, 25)

  doc.setFontSize(12)
  doc.setFont('helvetica', 'normal')
  doc.text('Inspection Report', pageWidth - margin - 50, 25)

  y = 55

  // Report Info
  doc.setTextColor(...textColor)
  doc.setFontSize(10)
  doc.setFont('helvetica', 'bold')
  doc.text(`Report #: ${data.reportNumber}`, margin, y)
  doc.text(`Date: ${data.inspectionDate}`, pageWidth / 2, y)
  y += 6
  doc.setFont('helvetica', 'normal')
  doc.text(`Inspector: ${data.technician.name}`, margin, y)
  doc.text(`Time: ${data.inspectionTime}`, pageWidth / 2, y)
  y += 15

  // Property Section
  doc.setFillColor(245, 245, 245)
  doc.rect(margin, y - 5, pageWidth - margin * 2, 35, 'F')

  doc.setFont('helvetica', 'bold')
  doc.setFontSize(12)
  doc.text('Property', margin + 5, y + 3)

  doc.setFont('helvetica', 'normal')
  doc.setFontSize(10)
  y += 12
  doc.text(data.property.name, margin + 5, y)
  y += 5
  doc.setTextColor(...grayColor)
  doc.text(data.property.address, margin + 5, y)
  y += 5
  doc.text(`${data.property.city}, ${data.property.state} ${data.property.zip}`, margin + 5, y)

  // Owner info on right side
  doc.setTextColor(...textColor)
  doc.setFont('helvetica', 'bold')
  doc.text('Owner', pageWidth / 2 + 10, y - 17)
  doc.setFont('helvetica', 'normal')
  doc.text(data.owner.name, pageWidth / 2 + 10, y - 12)
  doc.setTextColor(...grayColor)
  doc.text(data.owner.email, pageWidth / 2 + 10, y - 7)
  if (data.owner.phone) {
    doc.text(data.owner.phone, pageWidth / 2 + 10, y - 2)
  }

  y += 20

  // Overall Status
  doc.setTextColor(...textColor)
  doc.setFontSize(14)
  doc.setFont('helvetica', 'bold')
  doc.text('Overall Status:', margin, y)

  if (data.overallStatus === 'good') {
    doc.setTextColor(...primaryColor)
    doc.text('ALL CLEAR', margin + 45, y)
  } else {
    doc.setTextColor(234, 179, 8)
    doc.text('ISSUES FOUND', margin + 45, y)
  }

  y += 15

  // Weather (if available)
  if (data.weather) {
    doc.setTextColor(...grayColor)
    doc.setFontSize(9)
    doc.setFont('helvetica', 'normal')
    let weatherText = 'Weather: '
    if (data.weather.temperature) {
      weatherText += `${data.weather.temperature}°F`
    }
    if (data.weather.conditions) {
      weatherText += ` - ${data.weather.conditions}`
    }
    doc.text(weatherText, margin, y)
    y += 10
  }

  // Checklist Section
  doc.setTextColor(...textColor)
  doc.setFontSize(12)
  doc.setFont('helvetica', 'bold')
  doc.text('Inspection Checklist', margin, y)
  y += 8

  // Group items by category
  const categories = [...new Set(data.checklistItems.map((item) => item.category))]

  for (const category of categories) {
    // Check for page break
    if (y > 250) {
      doc.addPage()
      y = margin
    }

    // Category header
    doc.setFillColor(245, 245, 245)
    doc.rect(margin, y - 3, pageWidth - margin * 2, 8, 'F')
    doc.setTextColor(...textColor)
    doc.setFontSize(10)
    doc.setFont('helvetica', 'bold')
    doc.text(category, margin + 3, y + 2)
    y += 10

    const categoryItems = data.checklistItems.filter((item) => item.category === category)

    for (const item of categoryItems) {
      // Check for page break
      if (y > 270) {
        doc.addPage()
        y = margin
      }

      // Status indicator
      const statusColors: Record<string, [number, number, number]> = {
        pass: [34, 197, 94], // green
        fail: [239, 68, 68], // red
        attention: [234, 179, 8], // yellow
        na: [156, 163, 175], // gray
      }
      const statusLabels: Record<string, string> = {
        pass: 'PASS',
        fail: 'FAIL',
        attention: 'ATTN',
        na: 'N/A',
      }

      doc.setFillColor(...(statusColors[item.status] || statusColors.na))
      doc.roundedRect(margin, y - 3, 12, 6, 1, 1, 'F')
      doc.setTextColor(255, 255, 255)
      doc.setFontSize(6)
      doc.setFont('helvetica', 'bold')
      doc.text(statusLabels[item.status] || 'N/A', margin + 1.5, y + 1)

      // Item text
      doc.setTextColor(...textColor)
      doc.setFontSize(9)
      doc.setFont('helvetica', 'normal')
      doc.text(item.item, margin + 16, y)

      y += 5

      // Notes if present
      if (item.notes) {
        doc.setTextColor(...grayColor)
        doc.setFontSize(8)
        doc.text(`Note: ${item.notes}`, margin + 16, y)
        y += 4
      }

      y += 3
    }

    y += 5
  }

  // Summary Notes
  if (data.summaryNotes) {
    if (y > 230) {
      doc.addPage()
      y = margin
    }

    doc.setTextColor(...textColor)
    doc.setFontSize(12)
    doc.setFont('helvetica', 'bold')
    doc.text('Summary Notes', margin, y)
    y += 8

    doc.setFontSize(10)
    doc.setFont('helvetica', 'normal')
    const lines = doc.splitTextToSize(data.summaryNotes, pageWidth - margin * 2)
    doc.text(lines, margin, y)
    y += lines.length * 5 + 10
  }

  // Footer on each page
  const pageCount = doc.getNumberOfPages()
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i)
    doc.setTextColor(...grayColor)
    doc.setFontSize(8)
    doc.text(
      `Generated by Lake Watch Pros | Page ${i} of ${pageCount}`,
      pageWidth / 2,
      doc.internal.pageSize.getHeight() - 10,
      { align: 'center' }
    )
  }

  return doc.output('blob')
}

// Generate invoice PDF
export async function generateInvoicePDF(data: {
  invoiceNumber: string
  date: string
  dueDate: string
  customer: {
    name: string
    email: string
    address?: string
  }
  lineItems: Array<{
    description: string
    quantity: number
    unitPrice: number
    total: number
  }>
  subtotal: number
  tax: number
  total: number
  notes?: string
}): Promise<Blob> {
  const doc = new jsPDF()
  const pageWidth = doc.internal.pageSize.getWidth()
  const margin = 20
  let y = margin

  // Colors
  const primaryColor = [76, 187, 23] as [number, number, number]
  const textColor = [0, 0, 0] as [number, number, number]
  const grayColor = [113, 113, 122] as [number, number, number]

  // Header
  doc.setFillColor(...primaryColor)
  doc.rect(0, 0, pageWidth, 35, 'F')

  doc.setTextColor(0, 0, 0)
  doc.setFontSize(22)
  doc.setFont('helvetica', 'bold')
  doc.text('INVOICE', margin, 23)

  y = 50

  // Invoice details
  doc.setTextColor(...textColor)
  doc.setFontSize(10)
  doc.setFont('helvetica', 'bold')
  doc.text(`Invoice #: ${data.invoiceNumber}`, margin, y)
  doc.setFont('helvetica', 'normal')
  y += 6
  doc.text(`Date: ${data.date}`, margin, y)
  y += 6
  doc.text(`Due Date: ${data.dueDate}`, margin, y)

  // Bill To
  doc.setFont('helvetica', 'bold')
  doc.text('Bill To:', pageWidth / 2, y - 12)
  doc.setFont('helvetica', 'normal')
  doc.text(data.customer.name, pageWidth / 2, y - 6)
  doc.setTextColor(...grayColor)
  doc.text(data.customer.email, pageWidth / 2, y)
  if (data.customer.address) {
    y += 6
    doc.text(data.customer.address, pageWidth / 2, y)
  }

  y += 20

  // Line items header
  doc.setFillColor(245, 245, 245)
  doc.rect(margin, y - 3, pageWidth - margin * 2, 10, 'F')
  doc.setTextColor(...textColor)
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(9)
  doc.text('Description', margin + 3, y + 3)
  doc.text('Qty', pageWidth - 80, y + 3)
  doc.text('Price', pageWidth - 55, y + 3)
  doc.text('Total', pageWidth - 30, y + 3)

  y += 12

  // Line items
  doc.setFont('helvetica', 'normal')
  for (const item of data.lineItems) {
    doc.text(item.description, margin + 3, y)
    doc.text(String(item.quantity), pageWidth - 80, y)
    doc.text(`$${item.unitPrice.toFixed(2)}`, pageWidth - 55, y)
    doc.text(`$${item.total.toFixed(2)}`, pageWidth - 30, y)
    y += 8
  }

  // Divider
  y += 5
  doc.setDrawColor(200, 200, 200)
  doc.line(pageWidth - 80, y, pageWidth - margin, y)
  y += 10

  // Totals
  doc.setFont('helvetica', 'normal')
  doc.text('Subtotal:', pageWidth - 70, y)
  doc.text(`$${data.subtotal.toFixed(2)}`, pageWidth - 30, y)
  y += 7

  if (data.tax > 0) {
    doc.text('Tax:', pageWidth - 70, y)
    doc.text(`$${data.tax.toFixed(2)}`, pageWidth - 30, y)
    y += 7
  }

  doc.setFont('helvetica', 'bold')
  doc.setFontSize(12)
  doc.text('Total:', pageWidth - 70, y)
  doc.setTextColor(...primaryColor)
  doc.text(`$${data.total.toFixed(2)}`, pageWidth - 30, y)

  // Notes
  if (data.notes) {
    y += 25
    doc.setTextColor(...textColor)
    doc.setFontSize(10)
    doc.setFont('helvetica', 'bold')
    doc.text('Notes:', margin, y)
    y += 6
    doc.setFont('helvetica', 'normal')
    doc.setTextColor(...grayColor)
    const lines = doc.splitTextToSize(data.notes, pageWidth - margin * 2)
    doc.text(lines, margin, y)
  }

  // Footer
  doc.setTextColor(...grayColor)
  doc.setFontSize(8)
  doc.text(
    'Lake Watch Pros | Professional Home Watch Services',
    pageWidth / 2,
    doc.internal.pageSize.getHeight() - 15,
    { align: 'center' }
  )
  doc.text(
    'Thank you for your business!',
    pageWidth / 2,
    doc.internal.pageSize.getHeight() - 10,
    { align: 'center' }
  )

  return doc.output('blob')
}
