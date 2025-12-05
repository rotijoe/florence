import { signOut } from '@/lib/auth_client'

export async function handleSignOut(): Promise<{ success: boolean; error?: string }> {
  try {
    await signOut()
    return { success: true }
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to sign out'
    }
  }
}
