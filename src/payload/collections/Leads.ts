import type { CollectionConfig } from 'payload'

export const Leads: CollectionConfig = {
  slug: 'leads',
  dbName: 'lwp_leads',
  admin: {
    useAsTitle: 'name',
    defaultColumns: ['name', 'email', 'serviceInterest', 'createdAt'],
    group: 'Submissions',
  },
  access: {
    read: () => true,
    create: () => true,
  },
  fields: [
    {
      name: 'name',
      type: 'text',
      required: true,
    },
    {
      name: 'email',
      type: 'email',
      required: true,
    },
    {
      name: 'phone',
      type: 'text',
    },
    {
      name: 'propertyAddress',
      type: 'textarea',
      admin: {
        description: 'Full property address',
      },
    },
    {
      name: 'propertySize',
      type: 'select',
      options: [
        { label: 'Under 2,000 sq ft', value: 'under-2000' },
        { label: '2,000 - 4,000 sq ft', value: '2000-4000' },
        { label: '4,000 - 6,500 sq ft', value: '4000-6500' },
        { label: 'Over 6,500 sq ft', value: 'over-6500' },
        { label: 'Not sure', value: 'unknown' },
      ],
    },
    {
      name: 'serviceInterest',
      type: 'select',
      hasMany: true,
      options: [
        { label: 'Home Watch Inspections', value: 'home-watch' },
        { label: 'Pre-Arrival Preparation', value: 'pre-arrival' },
        { label: 'Post-Departure Closing', value: 'post-departure' },
        { label: 'Storm/Weather Checks', value: 'storm-check' },
        { label: 'Contractor Coordination', value: 'contractor-coordination' },
        { label: 'Concierge Services', value: 'concierge' },
        { label: 'Winterization', value: 'winterization' },
        { label: 'Summerization', value: 'summerization' },
        { label: 'Emergency Response', value: 'emergency' },
        { label: 'Other', value: 'other' },
      ],
    },
    {
      name: 'message',
      type: 'textarea',
    },
    {
      name: 'source',
      type: 'text',
      admin: {
        description: 'Where the lead came from (e.g., "website", "referral")',
      },
      defaultValue: 'website',
    },
    {
      name: 'status',
      type: 'select',
      defaultValue: 'new',
      options: [
        { label: 'New', value: 'new' },
        { label: 'Contacted', value: 'contacted' },
        { label: 'Qualified', value: 'qualified' },
        { label: 'Converted', value: 'converted' },
        { label: 'Closed', value: 'closed' },
      ],
      admin: {
        position: 'sidebar',
      },
    },
    {
      name: 'notes',
      type: 'textarea',
      admin: {
        description: 'Internal notes about this lead',
        position: 'sidebar',
      },
    },
  ],
  timestamps: true,
}
