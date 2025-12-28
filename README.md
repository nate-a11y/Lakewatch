# Lake Watch Pros

Professional home watch and concierge services for Lake of the Ozarks properties.

## Tech Stack

- **Framework**: Next.js 15 (App Router)
- **Styling**: Tailwind CSS v4
- **Language**: TypeScript
- **CMS**: Payload CMS 3.x
- **Database**: PostgreSQL (Supabase)
- **Storage**: Vercel Blob
- **Deployment**: Vercel

## Getting Started

### Prerequisites

- Node.js 18+
- PostgreSQL database (Supabase recommended)

### Environment Variables

Copy `.env.example` to `.env.local` and fill in your values:

```bash
cp .env.example .env.local
```

Required environment variables:
- `DATABASE_URL` - PostgreSQL connection string
- `PAYLOAD_SECRET` - Secret key for Payload CMS
- `BLOB_READ_WRITE_TOKEN` - Vercel Blob storage token (optional)
- `NEXT_PUBLIC_SITE_URL` - Your site URL

### Installation

```bash
npm install
```

### Development

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) for the website and [http://localhost:3000/admin](http://localhost:3000/admin) for the CMS.

### Build

```bash
npm run build
npm start
```

## Project Structure

```
src/
├── app/
│   ├── (frontend)/     # Public website routes
│   └── (payload)/      # Payload CMS admin routes
├── components/
│   ├── layout/         # Header, Footer
│   ├── sections/       # Page sections (Hero, Services, etc.)
│   ├── seo/           # Schema markup components
│   └── ui/            # Reusable UI components
├── lib/               # Utilities and config
└── payload/
    └── collections/   # Payload CMS collections
```

## CMS Collections

- **Services** - Service offerings with pricing tiers
- **Testimonials** - Customer testimonials
- **Team** - Team member profiles
- **FAQs** - Frequently asked questions
- **Pages** - Custom page content
- **Leads** - Contact form submissions
- **Media** - Image and file uploads
- **Users** - Admin users

## Deployment

Deploy to Vercel:

1. Connect your repository to Vercel
2. Add environment variables in Vercel dashboard
3. Deploy

The app is configured for automatic deployments from the main branch.

## Brand Guidelines

- **Primary Green**: #4cbb17
- **Light Green**: #60e421
- **Dark Green**: #3a8e11
- **Black**: #060606
- **White**: #ffffff

Part of the Lake Ride Pros family of companies.

## License

Private - All rights reserved.
