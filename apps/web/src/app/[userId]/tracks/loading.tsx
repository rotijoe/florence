import { Skeleton } from '@/components/ui/skeleton'

export default function Loading() {
  return (
    <div className='container mx-auto px-4 py-8 max-w-7xl'>
      <div className='space-y-6'>
        <div className='space-y-2'>
          <Skeleton className='h-9 w-40' />
          <Skeleton className='h-4 w-72' />
        </div>
        <div className='grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3'>
          <Skeleton className='h-64 rounded-2xl' />
          <Skeleton className='h-64 rounded-2xl' />
          <Skeleton className='h-64 rounded-2xl' />
        </div>
      </div>
    </div>
  )
}

