import type { EventLayoutProps } from './types'

export default function EventLayout({ children }: EventLayoutProps) {
  return (
    <section className='mx-auto flex w-full max-w-7xl flex-col gap-6 px-4 lg:min-h-[calc(100vh-8rem)]'>
      <div className='p-4 lg:h-full'>{children}</div>
    </section>
  )
}
