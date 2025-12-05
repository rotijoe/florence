'use client'

import { useState } from 'react'
import { AuthDialog } from '@/components/auth_dialog'
import { Button } from '@/components/ui/button'

export default function HomePage() {
  const [authDialogOpen, setAuthDialogOpen] = useState(false)
  const [authDialogTab, setAuthDialogTab] = useState<'signin' | 'signup'>('signin')

  const handleSignInClick = () => {
    setAuthDialogTab('signin')
    setAuthDialogOpen(true)
  }

  const handleSignUpClick = () => {
    setAuthDialogTab('signup')
    setAuthDialogOpen(true)
  }

  return (
    <div className='flex min-h-screen items-center justify-center'>
      <div className='flex flex-col items-center gap-8'>
        <div className='flex flex-col items-center gap-2'>
          <h1 className='text-6xl font-bold tracking-tight'>Florence</h1>
          <p className='text-muted-foreground text-lg'>Health Tracking</p>
        </div>

        <div className='flex gap-4'>
          <Button onClick={handleSignInClick} variant='default' size='lg'>
            Sign In
          </Button>
          <Button onClick={handleSignUpClick} variant='outline' size='lg'>
            Sign Up
          </Button>
        </div>
      </div>

      <AuthDialog
        open={authDialogOpen}
        onOpenChange={setAuthDialogOpen}
        defaultTab={authDialogTab}
      />
    </div>
  )
}

