import { SidebarProvider, SidebarInset } from '@/components/ui/sidebar'
import { AppSidebar } from '@/components/app_sidebar'
import { SiteHeader } from '@/components/site_header'
import { redirect } from 'next/navigation'
import { getServerSession } from '@/lib/auth_server'

interface UserLayoutProps {
  children: React.ReactNode
  params: Promise<{ userId: string }>
}

export default async function UserLayout({ children, params }: UserLayoutProps) {
  const { userId } = await params
  const session = await getServerSession()

  const sessionUserId = session?.user?.id
  if (!sessionUserId) {
    redirect('/')
  }

  // If userId in URL doesn't match session, redirect to correct user's page
  if (sessionUserId !== userId) {
    redirect(`/${sessionUserId}`)
  }

  return (
    <SidebarProvider>
      <AppSidebar variant='inset' />
      <SidebarInset className='overflow-auto max-h-[calc(100vh-1rem)]'>
        <SiteHeader className='sticky top-0 z-10' />
        <main className='flex flex-1 flex-col'>
          <div className='flex flex-col gap-4 md:gap-6'>{children}</div>
        </main>
      </SidebarInset>
    </SidebarProvider>
  )
}
