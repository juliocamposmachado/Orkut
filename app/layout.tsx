import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Orkut Retrô - A rede social nostálgica dos anos 2000',
  description: 'Reviva os bons tempos da internet brasileira com o Orkut Retrô',
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
