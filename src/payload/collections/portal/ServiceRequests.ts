import type { CollectionConfig } from 'payload'

export const ServiceRequests: CollectionConfig = {
  slug: 'service-requests',
  dbName: 'lwp_service_requests',
  admin: {
    useAsTitle: 'title',
    defaultColumns: ['title', 'property', 'type', 'status', 'preferredDate'],
    group: 'Portal',
  },
  access: {
    read: () => true,
    create: () => true,
  },
  fields: [
    {
      name: 'property',
      type: 'relationship',
      relationTo: 'properties',
      required: true,
    },
    {
      name: 'requestedBy',
      type: 'relationship',
      relationTo: 'users',
      required: true,
    },
    {
      name: 'type',
      type: 'select',
      required: true,
      options: [
        { label: 'Pre-Arrival', value: 'pre_arrival' },
        { label: 'Post-Departure', value: 'post_departure' },
        { label: 'Grocery Stocking', value: 'grocery_stocking' },
        { label: 'Contractor Meet-up', value: 'contractor_meetup' },
        { label: 'Storm Check', value: 'storm_check' },
        { label: 'Custom', value: 'custom' },
      ],
    },
    {
      name: 'title',
      type: 'text',
      required: true,
    },
    {
      name: 'description',
      type: 'richText',
    },
    {
      name: 'preferredDate',
      type: 'date',
      admin: {
        date: {
          pickerAppearance: 'dayOnly',
        },
      },
    },
    {
      name: 'preferredTimeWindow',
      type: 'group',
      fields: [
        {
          name: 'start',
          type: 'text',
        },
        {
          name: 'end',
          type: 'text',
        },
      ],
    },
    {
      name: 'assignedTo',
      type: 'relationship',
      relationTo: 'users',
      admin: {
        description: 'Assigned technician',
      },
    },
    {
      name: 'status',
      type: 'select',
      required: true,
      defaultValue: 'pending',
      options: [
        { label: 'Pending', value: 'pending' },
        { label: 'Scheduled', value: 'scheduled' },
        { label: 'In Progress', value: 'in_progress' },
        { label: 'Completed', value: 'completed' },
        { label: 'Cancelled', value: 'cancelled' },
      ],
      admin: {
        position: 'sidebar',
      },
    },
    {
      name: 'priority',
      type: 'select',
      required: true,
      defaultValue: 'normal',
      options: [
        { label: 'Low', value: 'low' },
        { label: 'Normal', value: 'normal' },
        { label: 'High', value: 'high' },
        { label: 'Urgent', value: 'urgent' },
      ],
      admin: {
        position: 'sidebar',
      },
    },
    {
      name: 'estimatedDuration',
      type: 'number',
      admin: {
        description: 'Estimated duration in minutes',
      },
    },
    {
      name: 'pricing',
      type: 'group',
      fields: [
        {
          name: 'type',
          type: 'select',
          options: [
            { label: 'Hourly', value: 'hourly' },
            { label: 'Flat Rate', value: 'flat' },
            { label: 'Quote Required', value: 'quote' },
          ],
        },
        {
          name: 'amount',
          type: 'number',
          min: 0,
        },
        {
          name: 'notes',
          type: 'text',
        },
      ],
    },
    {
      name: 'completionNotes',
      type: 'richText',
    },
    {
      name: 'completionPhotos',
      type: 'array',
      fields: [
        {
          name: 'photo',
          type: 'upload',
          relationTo: 'media',
          required: true,
        },
        {
          name: 'caption',
          type: 'text',
        },
      ],
    },
    {
      name: 'invoice',
      type: 'relationship',
      relationTo: 'invoices',
    },
  ],
  timestamps: true,
}
