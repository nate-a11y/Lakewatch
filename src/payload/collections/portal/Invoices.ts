import type { CollectionConfig } from 'payload'

export const Invoices: CollectionConfig = {
  slug: 'invoices',
  dbName: 'lwp_invoices',
  admin: {
    useAsTitle: 'id',
    defaultColumns: ['customer', 'total', 'status', 'dueDate', 'createdAt'],
    group: 'Portal',
  },
  access: {
    read: () => true,
  },
  fields: [
    {
      name: 'customer',
      type: 'relationship',
      relationTo: 'users',
      required: true,
    },
    {
      name: 'property',
      type: 'relationship',
      relationTo: 'properties',
    },
    {
      name: 'lineItems',
      type: 'array',
      required: true,
      fields: [
        {
          name: 'description',
          type: 'text',
          required: true,
        },
        {
          name: 'quantity',
          type: 'number',
          required: true,
          defaultValue: 1,
          min: 1,
        },
        {
          name: 'unitPrice',
          type: 'number',
          required: true,
          min: 0,
        },
        {
          name: 'total',
          type: 'number',
          required: true,
          min: 0,
        },
      ],
    },
    {
      name: 'subtotal',
      type: 'number',
      required: true,
      min: 0,
    },
    {
      name: 'tax',
      type: 'number',
      defaultValue: 0,
      min: 0,
    },
    {
      name: 'total',
      type: 'number',
      required: true,
      min: 0,
    },
    {
      name: 'status',
      type: 'select',
      required: true,
      defaultValue: 'draft',
      options: [
        { label: 'Draft', value: 'draft' },
        { label: 'Sent', value: 'sent' },
        { label: 'Paid', value: 'paid' },
        { label: 'Overdue', value: 'overdue' },
        { label: 'Cancelled', value: 'cancelled' },
      ],
      admin: {
        position: 'sidebar',
      },
    },
    {
      name: 'dueDate',
      type: 'date',
      admin: {
        date: {
          pickerAppearance: 'dayOnly',
        },
      },
    },
    {
      name: 'stripeInvoiceId',
      type: 'text',
      admin: {
        position: 'sidebar',
      },
    },
    {
      name: 'stripePaymentIntentId',
      type: 'text',
      admin: {
        position: 'sidebar',
      },
    },
    {
      name: 'paidAt',
      type: 'date',
      admin: {
        date: {
          pickerAppearance: 'dayAndTime',
        },
      },
    },
    {
      name: 'pdfUrl',
      type: 'text',
    },
  ],
  timestamps: true,
}
