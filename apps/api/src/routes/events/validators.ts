import { z } from 'zod'
import { EventType } from '@packages/types'
import { DEFAULT_LIMIT, MAX_LIMIT, MIN_LIMIT } from './constants.js'

export const listEventsQuerySchema = z.object({
  limit: z
    .string()
    .optional()
    .transform((val) => {
      if (!val) return DEFAULT_LIMIT
      const parsed = parseInt(val, 10)
      if (isNaN(parsed)) return DEFAULT_LIMIT
      return Math.max(MIN_LIMIT, Math.min(parsed, MAX_LIMIT))
    })
})

export const createEventSchema = z
  .object({
    title: z.string().min(1).trim().default('Untitled event'),
    type: z.nativeEnum(EventType).default(EventType.NOTE),
    date: z
      .union([z.string().datetime(), z.date()])
      .optional()
      .transform((val) => {
        if (!val) return new Date()
        return val instanceof Date ? val : new Date(val)
      }),
    notes: z.string().nullable().optional(),
    symptomType: z.string().nullable().optional(),
    severity: z.number().int().min(1).max(5).nullable().optional()
  })
  .refine(
    (data) => {
      if (data.type === EventType.APPOINTMENT) {
        return data.date !== undefined && data.date !== null
      }
      return true
    },
    {
      message: 'Date is required when type is APPOINTMENT',
      path: ['date']
    }
  )

export const updateEventSchema = z.object({
  title: z.string().min(1).trim().optional(),
  notes: z.string().nullable().optional()
})

export type ListEventsQuery = z.infer<typeof listEventsQuerySchema>
export type CreateEventInput = z.infer<typeof createEventSchema>
export type UpdateEventInput = z.infer<typeof updateEventSchema>
