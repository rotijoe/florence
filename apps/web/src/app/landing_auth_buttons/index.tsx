'use client'

import { useState } from 'react'
import { AuthDialog } from '@/components/auth_dialog'
import { Button } from '@/components/ui/button'

export function LandingAuthButtons() {
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
    <>
      <div className='flex gap-4'>
        <Button
          onClick={handleSignInClick}
          variant='default'
          size='lg'
          className='bg-blue-300 text-white hover:bg-blue-400 hover:text-white cursor-pointer'
        >
          Sign In
        </Button>
        <Button
          onClick={handleSignUpClick}
          variant='outline'
          size='lg'
          className='bg-blue-300 text-white hover:bg-blue-400 hover:text-white cursor-pointer'
        >
          Sign Up
        </Button>
      </div>

      <AuthDialog
        open={authDialogOpen}
        onOpenChange={setAuthDialogOpen}
        defaultTab={authDialogTab}
      />
    </>
  )
}
