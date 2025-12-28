import Link from 'next/link'
import '../globals.css'

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-[#060606] text-white antialiased font-sans">
        <div className="min-h-screen flex flex-col">
          {/* Header */}
          <header className="p-6">
            <Link href="/" className="flex items-center gap-2">
              <span className="text-xl font-bold text-[#4cbb17]">Lake Watch Pros</span>
            </Link>
          </header>

          {/* Main content */}
          <main className="flex-1 flex items-center justify-center px-4 py-12">
            <div className="w-full max-w-md">
              {children}
            </div>
          </main>

          {/* Footer */}
          <footer className="p-6 text-center text-sm text-[#71717a]">
            <p>&copy; {new Date().getFullYear()} Lake Watch Pros. All rights reserved.</p>
          </footer>
        </div>
      </body>
    </html>
  )
}
