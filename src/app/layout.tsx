import { Providers } from './providers'
import './globals.css'
import { Inter_Tight } from 'next/font/google'

const interTight = Inter_Tight({ 
  subsets: ['latin'],
  display: 'swap',
})

export const metadata = {
  title: '2.0 Dash',
  description: 'Login',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={interTight.className}>
        <Providers>{children}</Providers>
      </body>
    </html>
  )
}