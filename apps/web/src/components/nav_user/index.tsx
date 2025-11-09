'use client'

import { useState } from 'react'
import { useSession } from '@/lib/auth_client'
import { MoreVertical, LogOut, User, LogIn } from 'lucide-react'
import {
  Avatar,
  AvatarFallback,
  AvatarImage
} from '@/components/ui/avatar'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu'
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar
} from '@/components/ui/sidebar'
import { Button } from '@/components/ui/button'
import { AuthDialog } from '@/components/auth_dialog'
import { handleSignOut } from './helpers'

export function NavUser() {
  const { data: session, isPending } = useSession()
  const { isMobile } = useSidebar()
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

  const getUserInitials = (name: string | null | undefined): string => {
    if (!name) return 'U'
    const parts = name.trim().split(' ')
    if (parts.length === 1) return parts[0][0].toUpperCase()
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase()
  }

  // Loading state
  if (isPending) {
    return (
      <SidebarMenu>
        <SidebarMenuItem>
          <SidebarMenuButton size="lg" disabled>
            <div className="h-8 w-8 rounded-lg bg-muted animate-pulse" />
            <div className="grid flex-1 text-left text-sm leading-tight">
              <div className="h-4 w-24 bg-muted animate-pulse rounded" />
              <div className="h-3 w-32 bg-muted animate-pulse rounded mt-1" />
            </div>
          </SidebarMenuButton>
        </SidebarMenuItem>
      </SidebarMenu>
    )
  }

  // Unauthenticated state
  if (!session?.user) {
    return (
      <>
        <SidebarMenu>
          <SidebarMenuItem>
            <Button
              variant="ghost"
              className="w-full justify-start h-auto py-2 px-2"
              onClick={() => setAuthDialogOpen(true)}
            >
              <div className="flex items-center gap-2 w-full">
                <div className="h-8 w-8 rounded-lg bg-muted flex items-center justify-center">
                  <User className="h-4 w-4" />
                </div>
                <div className="grid flex-1 text-left text-sm leading-tight">
                  <span className="truncate font-medium">Sign In</span>
                  <span className="text-muted-foreground truncate text-xs">
                    Access your account
                  </span>
                </div>
                <LogIn className="ml-auto h-4 w-4" />
              </div>
            </Button>
          </SidebarMenuItem>
        </SidebarMenu>
        <AuthDialog open={authDialogOpen} onOpenChange={setAuthDialogOpen} />
      </>
    )
  }

  // Authenticated state
  const user = session.user
  const initials = getUserInitials(user.name)

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <SidebarMenuButton
              size="lg"
              className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
            >
              <Avatar className="h-8 w-8 rounded-lg">
                <AvatarImage src={undefined} alt={user.name || 'User'} />
                <AvatarFallback className="rounded-lg">{initials}</AvatarFallback>
              </Avatar>
              <div className="grid flex-1 text-left text-sm leading-tight">
                <span className="truncate font-medium">{user.name || 'User'}</span>
                <span className="text-muted-foreground truncate text-xs">
                  {user.email || ''}
                </span>
              </div>
              <MoreVertical className="ml-auto h-4 w-4" />
            </SidebarMenuButton>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            className="w-[--radix-dropdown-menu-trigger-width] min-w-56 rounded-lg"
            side={isMobile ? 'bottom' : 'right'}
            align="end"
            sideOffset={4}
          >
            <DropdownMenuLabel className="p-0 font-normal">
              <div className="flex items-center gap-2 px-1 py-1.5 text-left text-sm">
                <Avatar className="h-8 w-8 rounded-lg">
                  <AvatarImage src={undefined} alt={user.name || 'User'} />
                  <AvatarFallback className="rounded-lg">{initials}</AvatarFallback>
                </Avatar>
                <div className="grid flex-1 text-left text-sm leading-tight">
                  <span className="truncate font-medium">{user.name || 'User'}</span>
                  <span className="text-muted-foreground truncate text-xs">
                    {user.email || ''}
                  </span>
                </div>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={onSignOut} disabled={isSigningOut}>
              <LogOut className="mr-2 h-4 w-4" />
              {isSigningOut ? 'Signing out...' : 'Sign Out'}
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarMenuItem>
    </SidebarMenu>
  )
}

