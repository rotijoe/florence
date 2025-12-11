import { z } from 'zod'

export const createTrackSchema = z.object({
  title: z.string().min(1).trim(),
  description: z.string().nullable().optional()
})

export type CreateTrackInput = z.infer<typeof createTrackSchema>

