import './globals.css'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Orkut Retrô - A rede social dos anos 2000',
  description: 'Reviva a magia das redes sociais dos anos 2000',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="pt-BR">
      <body>{children}</body>
    </html>
  )
}
