import type { CollectionConfig } from 'payload'

export const OccupancyCalendar: CollectionConfig = {
  slug: 'occupancy-calendar',
  dbName: 'lwp_occupancy_calendar',
  admin: {
    useAsTitle: 'id',
    defaultColumns: ['property', 'type', 'startDate', 'endDate', 'guestName'],
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
      name: 'type',
      type: 'select',
      required: true,
      options: [
        { label: 'Owner Visit', value: 'owner_visit' },
        { label: 'Guest Visit', value: 'guest_visit' },
        { label: 'Rental', value: 'rental' },
        { label: 'Contractor', value: 'contractor' },
      ],
    },
    {
      name: 'startDate',
      type: 'date',
      required: true,
      admin: {
        date: {
          pickerAppearance: 'dayOnly',
        },
      },
    },
    {
      name: 'endDate',
      type: 'date',
      required: true,
      admin: {
        date: {
          pickerAppearance: 'dayOnly',
        },
      },
    },
    {
      name: 'guestName',
      type: 'text',
    },
    {
      name: 'guestPhone',
      type: 'text',
    },
    {
      name: 'guestEmail',
      type: 'email',
    },
    {
      name: 'notes',
      type: 'textarea',
    },
    {
      name: 'preArrivalRequested',
      type: 'checkbox',
      defaultValue: false,
      admin: {
        description: 'Request pre-arrival service',
      },
    },
    {
      name: 'postDepartureRequested',
      type: 'checkbox',
      defaultValue: false,
      admin: {
        description: 'Request post-departure service',
      },
    },
    {
      name: 'createdBy',
      type: 'relationship',
      relationTo: 'users',
    },
  ],
  timestamps: true,
}
