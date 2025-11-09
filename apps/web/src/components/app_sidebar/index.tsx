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

const navMainItems = [
  {
    title: 'Home',
    url: '/',
    icon: Home
  },
  {
    title: 'Dashboard',
    url: '/dashboard',
    icon: LayoutDashboard
  }
]

const navSecondaryItems = [
  {
    title: 'Settings',
    url: '/settings',
    icon: Activity
  }
]

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  return (
    <Sidebar collapsible="offcanvas" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              asChild
              className="data-[slot=sidebar-menu-button]:!p-1.5"
            >
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

