import type { CollectionConfig } from 'payload'

export const Services: CollectionConfig = {
  slug: 'services',
  dbName: 'lwp_services',
  admin: {
    useAsTitle: 'name',
    defaultColumns: ['name', 'featured', 'updatedAt'],
    group: 'Content',
  },
  access: {
    read: () => true,
  },
  fields: [
    {
      name: 'name',
      type: 'text',
      required: true,
    },
    {
      name: 'slug',
      type: 'text',
      required: true,
      unique: true,
      admin: {
        description: 'URL-friendly version of the name (e.g., "home-watch-inspections")',
      },
    },
    {
      name: 'shortDescription',
      type: 'textarea',
      required: true,
      admin: {
        description: 'Brief description for cards and listings (1-2 sentences)',
      },
    },
    {
      name: 'description',
      type: 'richText',
      required: true,
    },
    {
      name: 'icon',
      type: 'select',
      required: true,
      options: [
        { label: 'Home', value: 'home' },
        { label: 'Eye', value: 'eye' },
        { label: 'Key', value: 'key' },
        { label: 'Cloud Storm', value: 'cloud-lightning' },
        { label: 'Users', value: 'users' },
        { label: 'Concierge', value: 'concierge-bell' },
        { label: 'Snowflake', value: 'snowflake' },
        { label: 'Sun', value: 'sun' },
        { label: 'Alert', value: 'alert-triangle' },
        { label: 'Shopping Cart', value: 'shopping-cart' },
        { label: 'Calendar', value: 'calendar' },
        { label: 'Wrench', value: 'wrench' },
        { label: 'Shield', value: 'shield-check' },
        { label: 'Clock', value: 'clock' },
        { label: 'Clipboard', value: 'clipboard-check' },
      ],
    },
    {
      name: 'pricingTiers',
      type: 'array',
      admin: {
        description: 'Pricing tiers for this service',
      },
      fields: [
        {
          name: 'name',
          type: 'text',
          required: true,
          admin: {
            description: 'e.g., "Under 2,000 sq ft" or "Basic Package"',
          },
        },
        {
          name: 'perVisit',
          type: 'text',
          admin: {
            description: 'Per-visit price (e.g., "$50")',
          },
        },
        {
          name: 'monthly1x',
          type: 'text',
          admin: {
            description: 'Monthly price for 1x/month (e.g., "$45/mo")',
          },
        },
        {
          name: 'monthly2x',
          type: 'text',
          admin: {
            description: 'Monthly price for 2x/month (e.g., "$80/mo")',
          },
        },
        {
          name: 'monthly4x',
          type: 'text',
          admin: {
            description: 'Monthly price for 4x/month (e.g., "$150/mo")',
          },
        },
        {
          name: 'flatRate',
          type: 'text',
          admin: {
            description: 'Flat rate price if not tiered (e.g., "$50/hr")',
          },
        },
        {
          name: 'note',
          type: 'text',
          admin: {
            description: 'Additional note (e.g., "Custom quote required")',
          },
        },
      ],
    },
    {
      name: 'features',
      type: 'array',
      admin: {
        description: 'List of features included with this service',
      },
      fields: [
        {
          name: 'feature',
          type: 'text',
          required: true,
        },
      ],
    },
    {
      name: 'featured',
      type: 'checkbox',
      defaultValue: false,
      admin: {
        description: 'Show on homepage featured services section',
      },
    },
    {
      name: 'order',
      type: 'number',
      defaultValue: 0,
      admin: {
        description: 'Display order (lower numbers appear first)',
      },
    },
    {
      name: 'image',
      type: 'upload',
      relationTo: 'media',
    },
  ],
}
