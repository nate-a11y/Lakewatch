import type { CollectionConfig } from 'payload'

export const FAQs: CollectionConfig = {
  slug: 'faqs',
  dbName: 'lwp_faqs',
  admin: {
    useAsTitle: 'question',
    defaultColumns: ['question', 'category', 'order'],
    group: 'Content',
  },
  access: {
    read: () => true,
  },
  fields: [
    {
      name: 'question',
      type: 'text',
      required: true,
    },
    {
      name: 'answer',
      type: 'richText',
      required: true,
    },
    {
      name: 'category',
      type: 'select',
      required: true,
      options: [
        { label: 'General', value: 'general' },
        { label: 'Home Watch', value: 'home-watch' },
        { label: 'Concierge', value: 'concierge' },
        { label: 'Pricing', value: 'pricing' },
        { label: 'Insurance', value: 'insurance' },
        { label: 'Service Area', value: 'service-area' },
      ],
    },
    {
      name: 'order',
      type: 'number',
      defaultValue: 0,
      admin: {
        description: 'Display order within category (lower numbers appear first)',
      },
    },
  ],
}
