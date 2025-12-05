'use client'

import { Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { ButtonDropdown } from '@/components/button_dropdown'
import type { HubQuickActionsProps } from './types'
import { convertOptionsToDropdownItems } from './helpers'

export function HubQuickActions({
  symptomOptions,
  eventOptions,
  appointmentOptions,
  onSelectOption
}: HubQuickActionsProps) {
  return (
    <div className="flex flex-col gap-3 rounded-2xl bg-muted/40 px-4 py-4 sm:px-6 sm:py-5">
      <div>
        <p className="text-sm font-medium">Quick log</p>
        <p className="text-sm text-muted-foreground">
          Capture what is happening in just a few taps.
        </p>
      </div>
      <div className="-mx-4 overflow-x-auto pb-1 sm:mx-0 sm:overflow-visible">
        <div className="flex w-max gap-3 px-4 sm:w-auto sm:px-0">
          <ButtonDropdown
            text="Log symptom"
            dropdownItems={convertOptionsToDropdownItems(
              'logSymptom',
              symptomOptions,
              onSelectOption
            )}
          />

          <ButtonDropdown
            text="Create event"
            dropdownItems={convertOptionsToDropdownItems(
              'createEvent',
              eventOptions,
              onSelectOption
            )}
          />

          <ButtonDropdown
            text="Add appointment"
            dropdownItems={convertOptionsToDropdownItems(
              'addAppointment',
              appointmentOptions,
              onSelectOption
            )}
          />

          <Button
            variant="outline"
            className="justify-between rounded-full px-5 sm:w-auto"
            type="button"
          >
            <span>Add health track</span>
            <Plus className="size-4 text-muted-foreground" />
          </Button>
        </div>
      </div>
    </div>
  )
}
