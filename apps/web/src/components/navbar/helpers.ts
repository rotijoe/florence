import { signOut } from '@/lib/auth_client'

export async function handleSignOut() {
  try {
    await signOut()
    return { success: true, error: null }
  } catch (error) {
    return {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : 'An error occurred during sign out'
    }
  }
}
