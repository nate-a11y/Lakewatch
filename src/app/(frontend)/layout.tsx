import { Header, Footer } from '@/components/layout'
import { LocalBusinessSchema, OrganizationSchema } from '@/components/seo/schema'
import '../globals.css'

export default function FrontendLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <head>
        <LocalBusinessSchema />
        <OrganizationSchema />
      </head>
      <body className="min-h-screen bg-[#060606] text-white antialiased font-sans">
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
