import { z } from 'zod'
import { AUTH_DIALOG_CONSTANTS } from './constants'

export const signInSchema = z.object({
  email: z.email('Please enter a valid email address'),
  password: z
    .string()
    .min(1, 'Password is required')
    .min(
      AUTH_DIALOG_CONSTANTS.VALIDATION.MIN_PASSWORD_LENGTH,
      `Password must be at least ${AUTH_DIALOG_CONSTANTS.VALIDATION.MIN_PASSWORD_LENGTH} characters`
    )
})

export const signUpSchema = z
  .object({
    name: z
      .string()
      .min(1, 'Name is required')
      .min(
        AUTH_DIALOG_CONSTANTS.VALIDATION.MIN_NAME_LENGTH,
        `Name must be at least ${AUTH_DIALOG_CONSTANTS.VALIDATION.MIN_NAME_LENGTH} characters`
      ),
    email: z.email('Please enter a valid email address'),
    password: z
      .string()
      .min(1, 'Password is required')
      .min(
        AUTH_DIALOG_CONSTANTS.VALIDATION.MIN_PASSWORD_LENGTH,
        `Password must be at least ${AUTH_DIALOG_CONSTANTS.VALIDATION.MIN_PASSWORD_LENGTH} characters`
      ),
    confirmPassword: z
      .string()
      .min(1, 'Please confirm your password')
      .min(
        AUTH_DIALOG_CONSTANTS.VALIDATION.MIN_PASSWORD_LENGTH,
        `Password must be at least ${AUTH_DIALOG_CONSTANTS.VALIDATION.MIN_PASSWORD_LENGTH} characters`
      )
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ['confirmPassword']
  })

export type SignInFormData = z.infer<typeof signInSchema>
export type SignUpFormData = z.infer<typeof signUpSchema>

export interface AuthDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export interface AuthResult {
  success: boolean
  error: string | null
}
