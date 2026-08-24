import './globals.css'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Grand Jeté · Academia de Danza',
  description: 'Sistema de gestión administrativa de Grand Jeté'
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return <html lang="es"><body>{children}</body></html>
}
