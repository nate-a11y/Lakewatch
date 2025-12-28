import type { CollectionConfig } from 'payload'

export const Inspections: CollectionConfig = {
  slug: 'inspections',
  dbName: 'lwp_inspections',
  admin: {
    useAsTitle: 'id',
    defaultColumns: ['property', 'technician', 'scheduledDate', 'status'],
    group: 'Portal',
  },
  access: {
    read: () => true,
  },
  fields: [
    {
      name: 'property',
      type: 'relationship',
      relationTo: 'properties',
      required: true,
    },
    {
      name: 'technician',
      type: 'relationship',
      relationTo: 'users',
    },
    {
      name: 'scheduledDate',
      type: 'date',
      required: true,
      admin: {
        date: {
          pickerAppearance: 'dayOnly',
        },
      },
    },
    {
      name: 'scheduledTimeWindow',
      type: 'group',
      fields: [
        {
          name: 'start',
          type: 'text',
          admin: {
            description: 'e.g., "9:00 AM"',
          },
        },
        {
          name: 'end',
          type: 'text',
          admin: {
            description: 'e.g., "12:00 PM"',
          },
        },
      ],
    },
    {
      name: 'status',
      type: 'select',
      required: true,
      defaultValue: 'scheduled',
      options: [
        { label: 'Scheduled', value: 'scheduled' },
        { label: 'In Progress', value: 'in_progress' },
        { label: 'Completed', value: 'completed' },
        { label: 'Cancelled', value: 'cancelled' },
        { label: 'Missed', value: 'missed' },
      ],
      admin: {
        position: 'sidebar',
      },
    },
    {
      name: 'checkIn',
      type: 'group',
      fields: [
        {
          name: 'timestamp',
          type: 'date',
          admin: {
            date: {
              pickerAppearance: 'dayAndTime',
            },
          },
        },
        {
          name: 'lat',
          type: 'number',
        },
        {
          name: 'lng',
          type: 'number',
        },
        {
          name: 'verified',
          type: 'checkbox',
          defaultValue: false,
          admin: {
            description: 'GPS matches property location',
          },
        },
      ],
    },
    {
      name: 'checkOut',
      type: 'group',
      fields: [
        {
          name: 'timestamp',
          type: 'date',
          admin: {
            date: {
              pickerAppearance: 'dayAndTime',
            },
          },
        },
        {
          name: 'lat',
          type: 'number',
        },
        {
          name: 'lng',
          type: 'number',
        },
      ],
    },
    {
      name: 'checklist',
      type: 'relationship',
      relationTo: 'checklists',
    },
    {
      name: 'checklistResponses',
      type: 'array',
      fields: [
        {
          name: 'itemId',
          type: 'text',
          required: true,
        },
        {
          name: 'category',
          type: 'text',
        },
        {
          name: 'item',
          type: 'text',
        },
        {
          name: 'response',
          type: 'select',
          required: true,
          options: [
            { label: 'Pass', value: 'pass' },
            { label: 'Fail', value: 'fail' },
            { label: 'N/A', value: 'na' },
            { label: 'Needs Attention', value: 'needs_attention' },
          ],
        },
        {
          name: 'notes',
          type: 'textarea',
        },
        {
          name: 'photos',
          type: 'array',
          fields: [
            {
              name: 'photo',
              type: 'upload',
              relationTo: 'media',
              required: true,
            },
          ],
        },
      ],
    },
    {
      name: 'summary',
      type: 'richText',
      admin: {
        description: 'Overall inspection summary',
      },
    },
    {
      name: 'issuesFound',
      type: 'array',
      fields: [
        {
          name: 'severity',
          type: 'select',
          required: true,
          options: [
            { label: 'Low', value: 'low' },
            { label: 'Medium', value: 'medium' },
            { label: 'High', value: 'high' },
            { label: 'Critical', value: 'critical' },
          ],
        },
        {
          name: 'description',
          type: 'textarea',
          required: true,
        },
        {
          name: 'photos',
          type: 'array',
          fields: [
            {
              name: 'photo',
              type: 'upload',
              relationTo: 'media',
              required: true,
            },
          ],
        },
        {
          name: 'actionTaken',
          type: 'textarea',
        },
        {
          name: 'followUpRequired',
          type: 'checkbox',
          defaultValue: false,
        },
      ],
    },
    {
      name: 'weather',
      type: 'group',
      fields: [
        {
          name: 'temperature',
          type: 'number',
          admin: {
            description: 'Temperature in Fahrenheit',
          },
        },
        {
          name: 'conditions',
          type: 'text',
          admin: {
            description: 'e.g., "Sunny", "Rainy", "Cloudy"',
          },
        },
      ],
    },
    {
      name: 'reportPdf',
      type: 'upload',
      relationTo: 'media',
      admin: {
        description: 'Generated PDF report',
      },
    },
    {
      name: 'reportSentAt',
      type: 'date',
      admin: {
        date: {
          pickerAppearance: 'dayAndTime',
        },
      },
    },
    {
      name: 'customerViewed',
      type: 'checkbox',
      defaultValue: false,
    },
    {
      name: 'customerViewedAt',
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
