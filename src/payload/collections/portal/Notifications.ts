import type { CollectionConfig } from 'payload'

export const Notifications: CollectionConfig = {
  slug: 'notifications',
  dbName: 'lwp_notifications',
  admin: {
    useAsTitle: 'title',
    defaultColumns: ['user', 'type', 'title', 'read', 'createdAt'],
    group: 'Portal',
  },
  access: {
    read: () => true,
    create: () => true,
  },
  fields: [
    {
      name: 'user',
      type: 'relationship',
      relationTo: 'users',
      required: true,
    },
    {
      name: 'type',
      type: 'select',
      required: true,
      options: [
        { label: 'Inspection Scheduled', value: 'inspection_scheduled' },
        { label: 'Inspection Complete', value: 'inspection_complete' },
        { label: 'Report Ready', value: 'report_ready' },
        { label: 'Invoice Sent', value: 'invoice_sent' },
        { label: 'Payment Received', value: 'payment_received' },
        { label: 'Message', value: 'message' },
        { label: 'Service Request Update', value: 'service_request_update' },
        { label: 'System', value: 'system' },
      ],
    },
    {
      name: 'title',
      type: 'text',
      required: true,
    },
    {
      name: 'body',
      type: 'textarea',
      required: true,
    },
    {
      name: 'data',
      type: 'json',
      admin: {
        description: 'Additional data for deep linking',
      },
    },
    {
      name: 'channels',
      type: 'select',
      hasMany: true,
      options: [
        { label: 'Push', value: 'push' },
        { label: 'Email', value: 'email' },
        { label: 'SMS', value: 'sms' },
      ],
    },
    {
      name: 'sentVia',
      type: 'select',
      hasMany: true,
      options: [
        { label: 'Push', value: 'push' },
        { label: 'Email', value: 'email' },
        { label: 'SMS', value: 'sms' },
      ],
    },
    {
      name: 'read',
      type: 'checkbox',
      defaultValue: false,
      admin: {
        position: 'sidebar',
      },
    },
    {
      name: 'readAt',
      type: 'date',
      admin: {
        date: {
          pickerAppearance: 'dayAndTime',
        },
      },
    },
  ],
  timestamps: true,
}
