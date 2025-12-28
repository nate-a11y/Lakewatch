import type { CollectionConfig } from 'payload'

export const ServicePlans: CollectionConfig = {
  slug: 'service-plans',
  dbName: 'lwp_service_plans',
  admin: {
    useAsTitle: 'name',
    defaultColumns: ['name', 'squareFootageTier', 'monthlyPrice', 'isActive'],
    group: 'Portal',
  },
  access: {
    read: () => true,
  },
  fields: [
    {
      name: 'name',
      type: 'text',
      required: true,
      admin: {
        description: 'e.g., "Basic", "Standard", "Premium"',
      },
    },
    {
      name: 'description',
      type: 'richText',
    },
    {
      name: 'squareFootageTier',
      type: 'select',
      required: true,
      options: [
        { label: 'Under 2,000 sq ft', value: 'under2000' },
        { label: '2,000 - 4,000 sq ft', value: '2000to4000' },
        { label: '4,000 - 6,500 sq ft', value: '4000to6500' },
        { label: 'Over 6,500 sq ft', value: 'over6500' },
      ],
    },
    {
      name: 'frequency',
      type: 'select',
      required: true,
      options: [
        { label: 'Weekly', value: 'weekly' },
        { label: 'Bi-weekly', value: 'biweekly' },
        { label: 'Monthly', value: 'monthly' },
        { label: 'Custom', value: 'custom' },
      ],
    },
    {
      name: 'visitsPerMonth',
      type: 'number',
      required: true,
      min: 1,
    },
    {
      name: 'pricePerVisit',
      type: 'number',
      required: true,
      min: 0,
      admin: {
        description: 'Price per individual visit',
      },
    },
    {
      name: 'monthlyPrice',
      type: 'number',
      required: true,
      min: 0,
      admin: {
        description: 'Total monthly subscription price',
      },
    },
    {
      name: 'features',
      type: 'array',
      fields: [
        {
          name: 'feature',
          type: 'text',
          required: true,
        },
      ],
    },
    {
      name: 'stripeProductId',
      type: 'text',
      admin: {
        description: 'Stripe Product ID',
        position: 'sidebar',
      },
    },
    {
      name: 'stripePriceId',
      type: 'text',
      admin: {
        description: 'Stripe Price ID',
        position: 'sidebar',
      },
    },
    {
      name: 'isActive',
      type: 'checkbox',
      defaultValue: true,
      admin: {
        position: 'sidebar',
      },
    },
  ],
  timestamps: true,
}
