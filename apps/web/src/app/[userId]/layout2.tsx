import { redirect } from 'next/navigation'
import { getServerSession } from '@/lib/auth_server'

interface UserLayoutProps {
  children: React.ReactNode
  params: Promise<{ userId: string }>
}

export default async function UserLayout({ children, params }: UserLayoutProps) {
  const { userId } = await params
  const session = await getServerSession()

  // Validate session exists and user is authenticated
  const sessionUserId = session?.user?.id
  if (!sessionUserId) {
    redirect('/')
  }

  // Validate user can only access their own routes
  if (sessionUserId !== userId) {
    redirect('/')
  }

  return <>{children}</>
}
