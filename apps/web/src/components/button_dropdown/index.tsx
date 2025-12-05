'use client'

import { MoreVertical } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu'
import type { ButtonDropdownProps } from './types'

function renderDropdownItems(items: ButtonDropdownProps['dropdownItems']) {
  return items.map((item, index) => (
    <DropdownMenuItem key={index} onSelect={item.onSelect}>
      {item.label}
    </DropdownMenuItem>
  ))
}

export function ButtonDropdown({ text, dropdownItems }: ButtonDropdownProps) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant='secondary' className='justify-between rounded-full px-5 sm:w-auto'>
          <span>{text}</span>
          <MoreVertical className='size-4 text-muted-foreground' />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align='start' className='max-w-md'>
        {renderDropdownItems(dropdownItems)}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

