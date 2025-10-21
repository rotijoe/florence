import { signIn, signUp } from '@/lib/auth_client'
import type { SignInFormData, SignUpFormData, AuthResult } from './types'
import { AUTH_DIALOG_CONSTANTS } from './constants'

export async function handleSignIn(data: SignInFormData): Promise<AuthResult> {
  try {
    const result = await signIn.email({
      email: data.email,
      password: data.password
    })

    if (result.error) {
      throw new Error(result.error.message)
    }

    return { success: true, error: null }
  } catch (error) {
    return {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : AUTH_DIALOG_CONSTANTS.ERROR_MESSAGES.GENERIC_SIGN_IN
    }
  }
}

export async function handleSignUp(data: SignUpFormData): Promise<AuthResult> {
  try {
    const result = await signUp.email({
      email: data.email,
      password: data.password,
      name: data.name
    })

    if (result.error) {
      throw new Error(result.error.message)
    }

    return { success: true, error: null }
  } catch (error) {
    return {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : AUTH_DIALOG_CONSTANTS.ERROR_MESSAGES.GENERIC_SIGN_UP
    }
  }
}
