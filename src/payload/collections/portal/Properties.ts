import type { CollectionConfig } from 'payload'

export const Properties: CollectionConfig = {
  slug: 'properties',
  dbName: 'lwp_properties',
  admin: {
    useAsTitle: 'name',
    defaultColumns: ['name', 'owner', 'status', 'updatedAt'],
    group: 'Portal',
  },
  access: {
    read: () => true,
  },
  fields: [
    {
      name: 'owner',
      type: 'relationship',
      relationTo: 'users',
      required: true,
      admin: {
        description: 'Property owner',
      },
    },
    {
      name: 'name',
      type: 'text',
      required: true,
      admin: {
        description: 'Friendly name like "Lake House" or "Smith Residence"',
      },
    },
    {
      name: 'address',
      type: 'group',
      fields: [
        {
          name: 'street',
          type: 'text',
          required: true,
        },
        {
          name: 'city',
          type: 'text',
          required: true,
        },
        {
          name: 'state',
          type: 'text',
          required: true,
          defaultValue: 'MO',
        },
        {
          name: 'zip',
          type: 'text',
          required: true,
        },
        {
          name: 'lat',
          type: 'number',
          admin: {
            description: 'Latitude coordinate',
          },
        },
        {
          name: 'lng',
          type: 'number',
          admin: {
            description: 'Longitude coordinate',
          },
        },
      ],
    },
    {
      name: 'squareFootage',
      type: 'number',
      admin: {
        description: 'Property size in square feet',
      },
    },
    {
      name: 'propertyType',
      type: 'select',
      required: true,
      defaultValue: 'house',
      options: [
        { label: 'House', value: 'house' },
        { label: 'Condo', value: 'condo' },
        { label: 'Townhouse', value: 'townhouse' },
        { label: 'Cabin', value: 'cabin' },
      ],
    },
    {
      name: 'accessInfo',
      type: 'group',
      admin: {
        description: 'Sensitive access information (encrypted)',
      },
      fields: [
        {
          name: 'gateCode',
          type: 'text',
        },
        {
          name: 'lockboxCode',
          type: 'text',
        },
        {
          name: 'alarmCode',
          type: 'text',
        },
        {
          name: 'alarmCompany',
          type: 'text',
        },
        {
          name: 'alarmPhone',
          type: 'text',
        },
        {
          name: 'wifiNetwork',
          type: 'text',
        },
        {
          name: 'wifiPassword',
          type: 'text',
        },
        {
          name: 'specialInstructions',
          type: 'richText',
        },
      ],
    },
    {
      name: 'contacts',
      type: 'array',
      admin: {
        description: 'Emergency contacts, neighbors, etc.',
      },
      fields: [
        {
          name: 'name',
          type: 'text',
          required: true,
        },
        {
          name: 'phone',
          type: 'text',
        },
        {
          name: 'email',
          type: 'email',
        },
        {
          name: 'relationship',
          type: 'text',
          admin: {
            description: 'e.g., Neighbor, Property Manager, Contractor',
          },
        },
      ],
    },
    {
      name: 'utilities',
      type: 'array',
      admin: {
        description: 'Utility providers and account info',
      },
      fields: [
        {
          name: 'type',
          type: 'select',
          required: true,
          options: [
            { label: 'Electric', value: 'electric' },
            { label: 'Gas', value: 'gas' },
            { label: 'Water', value: 'water' },
            { label: 'Propane', value: 'propane' },
            { label: 'Septic', value: 'septic' },
            { label: 'Internet', value: 'internet' },
            { label: 'Security', value: 'security' },
          ],
        },
        {
          name: 'provider',
          type: 'text',
          required: true,
        },
        {
          name: 'accountNumber',
          type: 'text',
        },
        {
          name: 'phone',
          type: 'text',
        },
      ],
    },
    {
      name: 'photos',
      type: 'array',
      fields: [
        {
          name: 'image',
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
      name: 'status',
      type: 'select',
      required: true,
      defaultValue: 'onboarding',
      options: [
        { label: 'Active', value: 'active' },
        { label: 'Inactive', value: 'inactive' },
        { label: 'Onboarding', value: 'onboarding' },
      ],
      admin: {
        position: 'sidebar',
      },
    },
    {
      name: 'servicePlan',
      type: 'relationship',
      relationTo: 'service-plans',
      admin: {
        position: 'sidebar',
      },
    },
  ],
  timestamps: true,
}
