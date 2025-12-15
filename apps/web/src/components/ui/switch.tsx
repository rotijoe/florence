'use client'

import * as React from 'react'

import { cn } from '@/lib/utils'

type SwitchProps = {
  checked?: boolean
  defaultChecked?: boolean
  disabled?: boolean
  onCheckedChange?: (checked: boolean) => void
  'aria-label'?: string
  'aria-describedby'?: string
  id?: string
  name?: string
}

function Switch({
  checked,
  defaultChecked,
  disabled,
  onCheckedChange,
  className,
  ...props
}: SwitchProps & Omit<React.ComponentProps<'button'>, keyof SwitchProps>) {
  const isControlled = typeof checked === 'boolean'
  const [uncontrolled, setUncontrolled] = React.useState(Boolean(defaultChecked))

  const currentChecked = isControlled ? Boolean(checked) : uncontrolled

  function handleClick() {
    if (disabled) return
    const next = !currentChecked
    if (!isControlled) setUncontrolled(next)
    onCheckedChange?.(next)
  }

  return (
    <button
      type='button'
      role='switch'
      aria-checked={currentChecked}
      data-state={currentChecked ? 'checked' : 'unchecked'}
      disabled={disabled}
      onClick={handleClick}
      className={cn(
        'inline-flex h-5 w-9 shrink-0 cursor-pointer items-center rounded-full border border-transparent transition-colors',
        'focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-ring/50 focus-visible:ring-offset-2',
        'disabled:cursor-not-allowed disabled:opacity-50',
        currentChecked ? 'bg-primary' : 'bg-muted',
        className
      )}
      {...props}
    >
      <span
        aria-hidden='true'
        className={cn(
          'pointer-events-none block size-4 rounded-full bg-background shadow-sm ring-0 transition-transform',
          currentChecked ? 'translate-x-4' : 'translate-x-1'
        )}
      />
    </button>
  )
}

export { Switch }


