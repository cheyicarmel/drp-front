import { Outfit } from 'next/font/google'
import './globals.css'
import 'flatpickr/dist/flatpickr.css'
import { SidebarProvider } from '@/context/SidebarContext'
import { ThemeProvider } from '@/context/ThemeContext'
import ReactQueryProvider from '@/context/ReactQueryProvider'

const outfit = Outfit({
  subsets: ['latin'],
})

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="fr">
      <body className={`${outfit.className} dark:bg-gray-900`}>
        <ThemeProvider>
          <SidebarProvider>
            <ReactQueryProvider>
              {children}
            </ReactQueryProvider>
          </SidebarProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}