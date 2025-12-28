import type { CollectionConfig } from 'payload'

export const Pages: CollectionConfig = {
  slug: 'pages',
  dbName: 'lwp_pages',
  admin: {
    useAsTitle: 'title',
    defaultColumns: ['title', 'slug', 'updatedAt'],
    group: 'Content',
  },
  access: {
    read: () => true,
  },
  fields: [
    {
      name: 'title',
      type: 'text',
      required: true,
    },
    {
      name: 'slug',
      type: 'text',
      required: true,
      unique: true,
      admin: {
        description: 'URL path (e.g., "about" for /about)',
      },
    },
    {
      name: 'metaTitle',
      type: 'text',
      admin: {
        description: 'SEO title (defaults to page title if empty)',
      },
    },
    {
      name: 'metaDescription',
      type: 'textarea',
      admin: {
        description: 'SEO meta description',
      },
    },
    {
      name: 'heroTitle',
      type: 'text',
      admin: {
        description: 'Hero section title',
      },
    },
    {
      name: 'heroSubtitle',
      type: 'textarea',
      admin: {
        description: 'Hero section subtitle/description',
      },
    },
    {
      name: 'heroImage',
      type: 'upload',
      relationTo: 'media',
    },
    {
      name: 'content',
      type: 'richText',
    },
    {
      name: 'sections',
      type: 'array',
      admin: {
        description: 'Custom content sections',
      },
      fields: [
        {
          name: 'sectionTitle',
          type: 'text',
        },
        {
          name: 'sectionContent',
          type: 'richText',
        },
        {
          name: 'sectionImage',
          type: 'upload',
          relationTo: 'media',
        },
      ],
    },
  ],
}
