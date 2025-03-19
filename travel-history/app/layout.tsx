import { Inter } from 'next/font/google'
import './globals.css'
import type { Metadata } from 'next'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'FlyMeBack - Travel History',
  description: 'Visualize your travel history and flight paths',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={`${inter.className} min-h-screen bg-background font-sans antialiased`}>
        {children}
      </body>
    </html>
  )
}
