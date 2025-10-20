import { signIn, signUp } from '@/lib/auth_client'
import type { SignInFormData, SignUpFormData } from './types'

export async function handleSignIn(data: SignInFormData) {
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
          : 'An error occurred during sign in'
    }
  }
}

export async function handleSignUp(data: SignUpFormData) {
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
          : 'An error occurred during sign up'
    }
  }
}
