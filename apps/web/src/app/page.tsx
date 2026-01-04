import Image from 'next/image'
import Link from 'next/link'
import { getServerSession } from '@/lib/auth_server'
import { LandingAuthButtons } from './landing_auth_buttons'
import { Button } from '@/components/ui/button'

export default async function HomePage() {
  const session = await getServerSession()
  const isAuthenticated = !!session?.user
  const userId = session?.user?.id

  return (
    <div className='flex min-h-screen items-center justify-center'>
      <div className='flex flex-col items-center gap-8 max-w-2xl px-4'>
        <div className='flex flex-col items-center border-1 border-grey-300 rounded-xl p-1'>
          <Image
            src='/logo.png'
            alt='Florence'
            width={120}
            height={120}
            priority
            className='object-contain'
          />
        </div>

        {isAuthenticated && userId ? (
          <Button
            asChild
            size='lg'
            variant='default'
            className='bg-blue-300 hover:bg-blue-400 hover:text-white cursor-pointer'
          >
            <Link href={`/${userId}`}>Go to Hub</Link>
          </Button>
        ) : (
          <LandingAuthButtons />
        )}
      </div>
    </div>
  )
}
