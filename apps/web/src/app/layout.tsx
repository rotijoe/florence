import type { Metadata } from 'next'
// eslint-disable-next-line camelcase
import { Geist, Geist_Mono } from 'next/font/google'
import './globals.css'
import { SidebarProvider, SidebarInset } from '@/components/ui/sidebar'
import { AppSidebar } from '@/components/app_sidebar'
import { SiteHeader } from '@/components/site_header'

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
})

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
})

export const metadata: Metadata = {
  title: 'Florence - Health Tracking',
  description: 'Track your health and wellness journey',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
        style={
          {
            '--sidebar-width': '16rem',
            '--header-height': '3rem',
          } as React.CSSProperties
        }
      >
        <SidebarProvider>
          <AppSidebar variant="inset" />
          <SidebarInset className="overflow-auto max-h-[calc(100vh-1rem)]">
            <SiteHeader className="sticky top-0 z-10" />
            <main className="flex flex-1 flex-col">
              <div className="flex flex-col gap-4 md:gap-6">{children}</div>
            </main>
          </SidebarInset>
        </SidebarProvider>
      </body>
    </html>
  )
}
