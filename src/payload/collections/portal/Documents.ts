import type { CollectionConfig } from 'payload'

export const Documents: CollectionConfig = {
  slug: 'documents',
  dbName: 'lwp_documents',
  admin: {
    useAsTitle: 'name',
    defaultColumns: ['name', 'property', 'type', 'createdAt'],
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
      name: 'uploadedBy',
      type: 'relationship',
      relationTo: 'users',
      required: true,
    },
    {
      name: 'name',
      type: 'text',
      required: true,
    },
    {
      name: 'type',
      type: 'select',
      required: true,
      options: [
        { label: 'Insurance', value: 'insurance' },
        { label: 'Warranty', value: 'warranty' },
        { label: 'Manual', value: 'manual' },
        { label: 'Contract', value: 'contract' },
        { label: 'Photo', value: 'photo' },
        { label: 'Other', value: 'other' },
      ],
    },
    {
      name: 'file',
      type: 'upload',
      relationTo: 'media',
      required: true,
    },
    {
      name: 'expiresAt',
      type: 'date',
      admin: {
        description: 'For insurance docs or contracts with expiration',
        date: {
          pickerAppearance: 'dayOnly',
        },
      },
    },
    {
      name: 'notes',
      type: 'textarea',
    },
  ],
  timestamps: true,
}
