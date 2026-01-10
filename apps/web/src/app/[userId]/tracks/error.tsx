'use client'

import { useEffect } from 'react'
import { Card, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'

interface ErrorProps {
  error: Error & { digest?: string }
  reset: () => void
}

export default function Error({ error, reset }: ErrorProps) {
  useEffect(() => {
    console.error('Tracks page error:', error)
  }, [error])

  return (
    <div className='container mx-auto px-4 py-8 max-w-7xl'>
      <Card className='rounded-2xl border-muted/40 bg-muted/20 py-0 shadow-sm'>
        <CardHeader className='px-4 py-4 sm:px-6 sm:py-5'>
          <CardTitle className='text-base font-semibold'>Couldn't load your tracks</CardTitle>
          <CardDescription className='text-sm'>
            {error.message || 'An error occurred while loading your tracks'}
          </CardDescription>
        </CardHeader>
        <CardFooter className='border-t border-muted/40 px-4 py-4 sm:px-6 sm:py-5'>
          <Button onClick={reset}>Try again</Button>
        </CardFooter>
      </Card>
    </div>
  )
}

