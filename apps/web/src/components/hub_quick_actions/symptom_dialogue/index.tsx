'use client'

import { useState, useEffect } from 'react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Field, FieldContent, FieldLabel, FieldSet } from '@/components/ui/field'
import { Textarea } from '@/components/ui/textarea'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu'
import { ChevronDownIcon } from 'lucide-react'
import { API_BASE_URL } from '@/constants/api'
import { EventType } from '@packages/types'
import type { SymptomDialogueProps } from './types'
import { SYMPTOM_TYPES, SEVERITY_LABELS } from './constants'
import { getDefaultTrack } from './helpers'

export function SymptomDialogue({
  open,
  onOpenChange,
  tracks,
  userId,
  onSuccess
}: SymptomDialogueProps) {
  const [selectedTrack, setSelectedTrack] = useState<string>('')
  const [selectedSymptomType, setSelectedSymptomType] = useState<string>('')
  const [selectedSeverity, setSelectedSeverity] = useState<number | null>(null)
  const [notes, setNotes] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (open) {
      const defaultTrack = getDefaultTrack(tracks)
      setSelectedTrack(defaultTrack || tracks[0]?.slug || '')
      setSelectedSymptomType('')
      setSelectedSeverity(null)
      setNotes('')
      setError(null)
    }
  }, [open, tracks])

  const selectedTrackData = tracks.find((t) => t.slug === selectedTrack)
  const selectedSymptomTypeData = SYMPTOM_TYPES.find((st) => st.value === selectedSymptomType)

  async function handleSubmit() {
    if (!selectedTrack || !selectedSymptomType || selectedSeverity === null) {
      setError('Please fill in all required fields')
      return
    }

    setIsSubmitting(true)
    setError(null)

    try {
      const response = await fetch(
        `${API_BASE_URL}/api/users/${userId}/tracks/${selectedTrack}/events`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          credentials: 'include',
          body: JSON.stringify({
            type: EventType.SYMPTOM,
            title: selectedSymptomTypeData?.label || '',
            symptomType: selectedSymptomType,
            severity: selectedSeverity,
            notes: notes.trim() || null
          })
        }
      )

      const data = await response.json()

      if (!response.ok || !data.success) {
        throw new Error(data.error || 'Failed to create symptom event')
      }

      onSuccess?.()
      onOpenChange(false)
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to create symptom event'
      setError(errorMessage)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className='sm:max-w-[500px]'>
        <DialogHeader>
          <DialogTitle>Log symptom</DialogTitle>
          <DialogDescription>
            Record a symptom to track how you're feeling over time.
          </DialogDescription>
        </DialogHeader>

        <FieldSet>
          <Field>
            <FieldLabel htmlFor='track-select'>Track</FieldLabel>
            <FieldContent>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    id='track-select'
                    variant='outline'
                    className='w-full justify-between'
                    role='combobox'
                    aria-label='Select track'
                  >
                    {selectedTrackData?.title || 'Select track'}
                    <ChevronDownIcon className='ml-2 size-4 shrink-0 opacity-50' />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className='w-[var(--radix-dropdown-menu-trigger-width)]'>
                  {tracks.map((track) => (
                    <DropdownMenuItem key={track.slug} onClick={() => setSelectedTrack(track.slug)}>
                      {track.title}
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
            </FieldContent>
          </Field>

          <Field>
            <FieldLabel htmlFor='symptom-type-select'>Symptom type</FieldLabel>
            <FieldContent>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    id='symptom-type-select'
                    variant='outline'
                    className='w-full justify-between'
                    role='combobox'
                    aria-label='Select symptom type'
                  >
                    {selectedSymptomTypeData?.label || 'Select symptom type'}
                    <ChevronDownIcon className='ml-2 size-4 shrink-0 opacity-50' />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className='w-[var(--radix-dropdown-menu-trigger-width)]'>
                  {SYMPTOM_TYPES.map((symptomType) => (
                    <DropdownMenuItem
                      key={symptomType.value}
                      onClick={() => setSelectedSymptomType(symptomType.value)}
                    >
                      {symptomType.label}
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
            </FieldContent>
          </Field>

          <Field>
            <FieldLabel>Severity</FieldLabel>
            <FieldContent>
              <div className='flex gap-2'>
                {[1, 2, 3, 4, 5].map((level) => (
                  <Button
                    key={level}
                    type='button'
                    variant={selectedSeverity === level ? 'default' : 'outline'}
                    onClick={() => setSelectedSeverity(level)}
                    className='flex-1'
                    data-state={selectedSeverity === level ? 'on' : 'off'}
                    aria-label={`Severity ${level}: ${SEVERITY_LABELS[level as keyof typeof SEVERITY_LABELS]}`}
                  >
                    {level}
                  </Button>
                ))}
              </div>
              {selectedSeverity && (
                <p className='mt-1 text-xs text-muted-foreground'>
                  {SEVERITY_LABELS[selectedSeverity as keyof typeof SEVERITY_LABELS]}
                </p>
              )}
            </FieldContent>
          </Field>

          <Field>
            <FieldLabel htmlFor='notes-textarea'>Notes</FieldLabel>
            <FieldContent>
              <Textarea
                id='notes-textarea'
                placeholder='Add any additional details...'
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={3}
              />
            </FieldContent>
          </Field>

          {error && (
            <div className='rounded-md bg-destructive/10 p-3 text-sm text-destructive' role='alert'>
              {error}
            </div>
          )}
        </FieldSet>

        <DialogFooter>
          <Button type='button' variant='outline' onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button type='button' onClick={handleSubmit} disabled={isSubmitting}>
            {isSubmitting ? 'Logging...' : 'Log symptom'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
