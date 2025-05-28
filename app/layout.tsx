import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Voice Agent Chat - AI-Powered Voice Conversations',
  description: 'Connect and chat with an AI agent using real-time voice communication. Test your setup, configure audio devices, and enjoy natural voice conversations.',
  generator: 'Next.js',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" >
      <body>{children}</body>
    </html>
  )
}
