import { buildConfig } from 'payload'
import { postgresAdapter } from '@payloadcms/db-postgres'
import { lexicalEditor } from '@payloadcms/richtext-lexical'
import { vercelBlobStorage } from '@payloadcms/storage-vercel-blob'
import path from 'path'
import { fileURLToPath } from 'url'

// Website collections
import {
  Services,
  Testimonials,
  Team,
  FAQs,
  Pages,
  Leads,
  Media,
  Users,
} from './payload/collections'

// Portal collections
import {
  Properties,
  ServicePlans,
  Checklists,
  Inspections,
  ServiceRequests,
  OccupancyCalendar,
  Invoices,
  Conversations,
  Messages,
  Documents,
  Notifications,
} from './payload/collections/portal'

const filename = fileURLToPath(import.meta.url)
const dirname = path.dirname(filename)

export default buildConfig({
  admin: {
    user: Users.slug,
    meta: {
      titleSuffix: ' | Lake Watch Pros Admin',
    },
  },
  collections: [
    // Website
    Services,
    Testimonials,
    Team,
    FAQs,
    Pages,
    Leads,
    Media,
    Users,
    // Portal
    Properties,
    ServicePlans,
    Checklists,
    Inspections,
    ServiceRequests,
    OccupancyCalendar,
    Invoices,
    Conversations,
    Messages,
    Documents,
    Notifications,
  ],
  editor: lexicalEditor(),
  secret: process.env.PAYLOAD_SECRET!,
  typescript: {
    outputFile: path.resolve(dirname, 'payload-types.ts'),
  },
  db: postgresAdapter({
    pool: {
      connectionString: process.env.DATABASE_URL || '',
    },
  }),
  plugins: [
    ...(process.env.BLOB_READ_WRITE_TOKEN
      ? [
          vercelBlobStorage({
            collections: {
              media: true,
            },
            token: process.env.BLOB_READ_WRITE_TOKEN,
          }),
        ]
      : []),
  ],
})
