'use client'

import { useState } from 'react'
import { useSession } from '@/lib/auth_client'
import { Button } from '@/components/ui/button'
import { AuthDialog } from '@/components/auth_dialog'
import type { NavbarProps } from './types'
import { handleSignOut } from './helpers'
import Link from 'next/link'

export function Navbar({ className }: NavbarProps) {
  const { data: session, isPending } = useSession()
  const [authDialogOpen, setAuthDialogOpen] = useState(false)
  const [isSigningOut, setIsSigningOut] = useState(false)

  const onSignOut = async () => {
    setIsSigningOut(true)
    const result = await handleSignOut()

    if (!result.success) {
      console.error('Sign out error:', result.error)
    }

    setIsSigningOut(false)
  }

  const renderLoadingState = () => (
    <nav
      className={`border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 ${className}`}
    >
      <div className='container flex h-14 items-center'>
        <div className='mr-4 flex'>
          <Link className='mr-6 flex items-center space-x-2' href='/'>
            <span className='font-bold'>Florence</span>
          </Link>
        </div>
        <div className='ml-auto'>
          <div className='h-8 w-16 bg-muted animate-pulse rounded' />
        </div>
      </div>
    </nav>
  )

  const renderBrand = () => (
    <div className='mr-4 flex'>
      <Link className='mr-6 flex items-center space-x-2' href='/'>
        <span className='font-bold'>Florence</span>
      </Link>
    </div>
  )

  const renderAuthenticatedUser = () => (
    <>
      <Link href='/dashboard'>
        <Button
          className='cursor-pointer'
          variant='outline'
          size='sm'
          disabled={isSigningOut}
        >
          Dashboard
        </Button>
      </Link>
      <Button
        className='cursor-pointer'
        variant='outline'
        size='sm'
        onClick={onSignOut}
        disabled={isSigningOut}
      >
        {isSigningOut ? 'Signing out...' : 'Sign Out'}
      </Button>
    </>
  )

  const renderUnauthenticatedUser = () => (
    <Button variant='default' size='sm' onClick={() => setAuthDialogOpen(true)}>
      Sign In / Sign Up
    </Button>
  )

  const renderUserActions = () => (
    <div className='ml-auto flex items-center space-x-2'>
      {session?.user ? renderAuthenticatedUser() : renderUnauthenticatedUser()}
    </div>
  )

  const renderNavbar = () => (
    <nav
      className={`border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 ${className}`}
    >
      <div className='container flex h-14 items-center'>
        {renderBrand()}
        {renderUserActions()}
      </div>
    </nav>
  )

  if (isPending) {
    return renderLoadingState()
  }

  return (
    <>
      {renderNavbar()}
      <AuthDialog open={authDialogOpen} onOpenChange={setAuthDialogOpen} />
    </>
  )
}
