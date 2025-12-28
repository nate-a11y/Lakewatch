import type { CollectionConfig } from 'payload'

export const Team: CollectionConfig = {
  slug: 'team',
  admin: {
    useAsTitle: 'name',
    defaultColumns: ['name', 'role', 'order'],
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
      name: 'role',
      type: 'text',
      required: true,
      admin: {
        description: 'e.g., "Owner", "Operations Manager"',
      },
    },
    {
      name: 'bio',
      type: 'richText',
    },
    {
      name: 'shortBio',
      type: 'textarea',
      admin: {
        description: 'Brief bio for team cards (1-2 sentences)',
      },
    },
    {
      name: 'photo',
      type: 'upload',
      relationTo: 'media',
    },
    {
      name: 'email',
      type: 'email',
    },
    {
      name: 'phone',
      type: 'text',
    },
    {
      name: 'order',
      type: 'number',
      defaultValue: 0,
      admin: {
        description: 'Display order (lower numbers appear first)',
      },
    },
  ],
}
