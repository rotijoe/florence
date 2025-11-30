'use client'

import * as React from 'react'
import Link from 'next/link'
import { LayoutDashboard, Home, Activity } from 'lucide-react'
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem
} from '@/components/ui/sidebar'
import { NavMain } from '@/components/nav_main'
import { NavSecondary } from '@/components/nav_secondary'
import { NavUser } from '@/components/nav_user'
import { useSession } from '@/lib/auth_client'

const navSecondaryItems = [
  {
    title: 'Settings',
    url: '/settings',
    icon: Activity
  }
]

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const { data: session } = useSession()
  const userId = session?.user?.id

  const navMainItems = React.useMemo(() => {
    const items = [
      {
        title: 'Home',
        url: '/',
        icon: Home
      }
    ]

    if (userId) {
      items.push({
        title: 'Tracks',
        url: `/${userId}/tracks`,
        icon: LayoutDashboard
      })
    }

    return items
  }, [userId])

  return (
    <Sidebar collapsible="offcanvas" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton asChild className="data-[slot=sidebar-menu-button]:!p-1.5">
              <Link href="/">
                <div className="flex items-center gap-2">
                  <div className="h-5 w-5 rounded bg-primary" />
                  <span className="text-base font-semibold">Florence</span>
                </div>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={navMainItems} />
        <NavSecondary items={navSecondaryItems} className="mt-auto" />
      </SidebarContent>
      <SidebarFooter>
        <NavUser />
      </SidebarFooter>
    </Sidebar>
  )
}
