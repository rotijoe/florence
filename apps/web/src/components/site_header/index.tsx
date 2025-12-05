'use client'

import * as React from 'react'
import { usePathname } from 'next/navigation'
import { useMemo } from 'react'
import Link from 'next/link'
import { Separator } from '@/components/ui/separator'
import { SidebarTrigger } from '@/components/ui/sidebar'
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator
} from '@/components/ui/breadcrumb'
import { generateBreadcrumbs } from './helpers'
import { cn } from '@/lib/utils'

export function SiteHeader({ className }: { className?: string }) {
  const pathname = usePathname()

  const breadcrumbs = useMemo(() => {
    return generateBreadcrumbs(pathname)
  }, [pathname])

  const renderBreadcrumbs = () => {
    if (breadcrumbs.length === 0) {
      return <h1 className='text-base font-medium'>Home</h1>
    }

    if (breadcrumbs.length === 1) {
      return <h1 className='text-base font-medium'>{breadcrumbs[0].label}</h1>
    }

    return (
      <Breadcrumb>
        <BreadcrumbList>
          {breadcrumbs.map((item, index) => {
            const isLast = index === breadcrumbs.length - 1
            return (
              <React.Fragment key={item.href}>
                <BreadcrumbItem>
                  {isLast ? (
                    <BreadcrumbPage>{item.label}</BreadcrumbPage>
                  ) : (
                    <BreadcrumbLink asChild>
                      <Link href={item.href}>{item.label}</Link>
                    </BreadcrumbLink>
                  )}
                </BreadcrumbItem>
                {!isLast && <BreadcrumbSeparator />}
              </React.Fragment>
            )
          })}
        </BreadcrumbList>
      </Breadcrumb>
    )
  }

  return (
    <header
      className={cn(
        'flex h-[--header-height] bg-background shrink-0 items-center gap-2 border-b transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-[--header-height]',
        className
      )}
    >
      <div className='flex w-full items-center gap-1 px-4 lg:gap-2 lg:px-6'>
        <SidebarTrigger className='-ml-1' />
        <Separator orientation='vertical' className='mx-2 data-[orientation=vertical]:h-4' />
        {renderBreadcrumbs()}
      </div>
    </header>
  )
}
