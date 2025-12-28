import type { CollectionConfig } from 'payload'

export const Conversations: CollectionConfig = {
  slug: 'conversations',
  dbName: 'lwp_conversations',
  admin: {
    useAsTitle: 'subject',
    defaultColumns: ['subject', 'property', 'status', 'lastMessageAt'],
    group: 'Portal',
  },
  access: {
    read: () => true,
    create: () => true,
  },
  fields: [
    {
      name: 'participants',
      type: 'relationship',
      relationTo: 'users',
      hasMany: true,
      required: true,
    },
    {
      name: 'property',
      type: 'relationship',
      relationTo: 'properties',
      admin: {
        description: 'Optional - link to specific property',
      },
    },
    {
      name: 'subject',
      type: 'text',
      required: true,
    },
    {
      name: 'lastMessageAt',
      type: 'date',
      admin: {
        date: {
          pickerAppearance: 'dayAndTime',
        },
      },
    },
    {
      name: 'status',
      type: 'select',
      required: true,
      defaultValue: 'active',
      options: [
        { label: 'Active', value: 'active' },
        { label: 'Archived', value: 'archived' },
      ],
      admin: {
        position: 'sidebar',
      },
    },
  ],
  timestamps: true,
}
