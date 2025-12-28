import { Geist } from 'next/font/google'
import { Header, Footer } from '@/components/layout'
import { LocalBusinessSchema, OrganizationSchema } from '@/components/seo/schema'
import '../globals.css'

const geist = Geist({
  subsets: ['latin'],
  variable: '--font-geist-sans',
})

export default function FrontendLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className={geist.variable}>
      <head>
        <LocalBusinessSchema />
        <OrganizationSchema />
      </head>
      <body className="min-h-screen bg-[#060606] text-white antialiased">
        <a href="#main-content" className="skip-link">
          Skip to main content
        </a>
        <Header />
        <main id="main-content">{children}</main>
        <Footer />
      </body>
    </html>
  )
}
