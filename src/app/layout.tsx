// app/layout.tsx
import { Providers } from './providers'
import './globals.css'
import '@solana/wallet-adapter-react-ui/styles.css'

export const metadata = {
  title: 'Solana Swap',
  description: 'Solana Token Swap Interface',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  )
}
