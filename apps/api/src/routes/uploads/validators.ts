import { z } from 'zod'
import { MAX_FILE_SIZE_BYTES, ALLOWED_CONTENT_TYPES } from './constants.js'

export const uploadUrlSchema = z.object({
  fileName: z.string().min(1).trim(),
  contentType: z.enum(ALLOWED_CONTENT_TYPES),
  size: z.number().int().positive().max(MAX_FILE_SIZE_BYTES)
})

export const uploadConfirmSchema = z.object({
  fileUrl: z.string().url(),
  key: z.string().min(1).trim()
})

export type UploadUrlInput = z.infer<typeof uploadUrlSchema>
export type UploadConfirmInput = z.infer<typeof uploadConfirmSchema>
