import type { CollectionConfig } from 'payload'

export const Checklists: CollectionConfig = {
  slug: 'checklists',
  dbName: 'lwp_checklists',
  admin: {
    useAsTitle: 'name',
    defaultColumns: ['name', 'type', 'isDefault', 'isActive'],
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
        description: 'e.g., "Standard Home Watch", "Storm Check", "Pre-Arrival"',
      },
    },
    {
      name: 'type',
      type: 'select',
      required: true,
      options: [
        { label: 'Home Watch', value: 'home_watch' },
        { label: 'Storm Check', value: 'storm_check' },
        { label: 'Pre-Arrival', value: 'pre_arrival' },
        { label: 'Post-Departure', value: 'post_departure' },
        { label: 'Custom', value: 'custom' },
      ],
    },
    {
      name: 'items',
      type: 'array',
      required: true,
      admin: {
        description: 'Checklist items grouped by category',
      },
      fields: [
        {
          name: 'category',
          type: 'text',
          required: true,
          admin: {
            description: 'e.g., "Exterior", "Interior", "HVAC", "Plumbing"',
          },
        },
        {
          name: 'item',
          type: 'text',
          required: true,
          admin: {
            description: 'e.g., "Check for water leaks under sinks"',
          },
        },
        {
          name: 'required',
          type: 'checkbox',
          defaultValue: true,
        },
        {
          name: 'requiresPhoto',
          type: 'checkbox',
          defaultValue: false,
        },
        {
          name: 'order',
          type: 'number',
          defaultValue: 0,
        },
      ],
    },
    {
      name: 'isDefault',
      type: 'checkbox',
      defaultValue: false,
      admin: {
        description: 'Use as default for this inspection type',
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
