import type { CollectionConfig } from 'payload'

export const Users: CollectionConfig = {
  slug: 'users',
  dbName: 'lwp_users',
  admin: {
    useAsTitle: 'email',
    defaultColumns: ['email', 'firstName', 'lastName', 'role', 'createdAt'],
    group: 'Admin',
  },
  auth: true,
  fields: [
    {
      type: 'row',
      fields: [
        {
          name: 'firstName',
          type: 'text',
        },
        {
          name: 'lastName',
          type: 'text',
        },
      ],
    },
    {
      name: 'phone',
      type: 'text',
    },
    {
      name: 'role',
      type: 'select',
      options: [
        { label: 'Customer', value: 'customer' },
        { label: 'Technician', value: 'technician' },
        { label: 'Admin', value: 'admin' },
        { label: 'Owner', value: 'owner' },
      ],
      defaultValue: 'customer',
      required: true,
      admin: {
        position: 'sidebar',
      },
    },
    {
      name: 'avatar',
      type: 'upload',
      relationTo: 'media',
    },
    {
      name: 'supabaseId',
      type: 'text',
      admin: {
        description: 'Linked Supabase Auth user ID',
        position: 'sidebar',
      },
    },
    {
      name: 'stripeCustomerId',
      type: 'text',
      admin: {
        description: 'Stripe Customer ID',
        position: 'sidebar',
      },
    },
    {
      name: 'notificationPreferences',
      type: 'group',
      admin: {
        description: 'How to notify this user',
      },
      fields: [
        {
          name: 'email',
          type: 'checkbox',
          defaultValue: true,
          label: 'Email notifications',
        },
        {
          name: 'sms',
          type: 'checkbox',
          defaultValue: true,
          label: 'SMS notifications',
        },
        {
          name: 'push',
          type: 'checkbox',
          defaultValue: true,
          label: 'Push notifications',
        },
      ],
    },
  ],
}
