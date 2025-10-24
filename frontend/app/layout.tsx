import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'LexFlow - Legal Client Intake & E-Signing',
  description: 'Streamlined client intake and e-signing for solo attorneys and small law firms',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body className="antialiased">
        {children}
      </body>
    </html>
  )
}
