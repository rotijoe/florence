'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle
} from '@/components/ui/dialog'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage
} from '@/components/ui/form'
import {
  signInSchema,
  signUpSchema,
  type SignInFormData,
  type SignUpFormData,
  type AuthDialogProps
} from './types'
import { handleSignIn, handleSignUp } from './helpers'
import { AUTH_DIALOG_CONSTANTS } from './constants'

export function AuthDialog({ open, onOpenChange }: AuthDialogProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const signInForm = useForm<SignInFormData>({
    resolver: zodResolver(signInSchema),
    defaultValues: AUTH_DIALOG_CONSTANTS.FORM_DEFAULTS.SIGN_IN,
    mode: 'onChange'
  })

  const signUpForm = useForm<SignUpFormData>({
    resolver: zodResolver(signUpSchema),
    defaultValues: AUTH_DIALOG_CONSTANTS.FORM_DEFAULTS.SIGN_UP
  })

  const onSignInSubmit = async (data: SignInFormData) => {
    setIsLoading(true)
    setError(null)

    const result = await handleSignIn(data)

    if (result.success) {
      onOpenChange(false)
      signInForm.reset()
    } else {
      setError(result.error)
    }

    setIsLoading(false)
  }

  const onSignUpSubmit = async (data: SignUpFormData) => {
    setIsLoading(true)
    setError(null)

    const result = await handleSignUp(data)

    if (result.success) {
      onOpenChange(false)
      signUpForm.reset()
    } else {
      setError(result.error)
    }

    setIsLoading(false)
  }

  const handleOpenChange = (open: boolean) => {
    if (!open) {
      setError(null)
      signInForm.reset()
      signUpForm.reset()
    }
    onOpenChange(open)
  }

  const renderError = () => {
    if (!error) return null

    return (
      <div className='text-sm text-red-600 bg-red-50 p-3 rounded-md'>
        {error}
      </div>
    )
  }

  const renderSignInForm = () => (
    <Form {...signInForm}>
      <form
        onSubmit={signInForm.handleSubmit(onSignInSubmit)}
        className='space-y-4'
      >
        <FormField
          control={signInForm.control}
          name='email'
          render={({ field }) => (
            <FormItem>
              <FormLabel>Email</FormLabel>
              <FormControl>
                <Input type='email' placeholder='Enter your email' {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={signInForm.control}
          name='password'
          render={({ field }) => (
            <FormItem>
              <FormLabel>Password</FormLabel>
              <FormControl>
                <Input
                  type='password'
                  placeholder='Enter your password'
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        {renderError()}
        <Button type='submit' className='w-full' disabled={isLoading}>
          {isLoading
            ? AUTH_DIALOG_CONSTANTS.UI.LOADING_STATES.SIGN_IN
            : AUTH_DIALOG_CONSTANTS.UI.BUTTON_TEXT.SIGN_IN}
        </Button>
      </form>
    </Form>
  )

  const renderSignUpForm = () => (
    <Form {...signUpForm}>
      <form
        onSubmit={signUpForm.handleSubmit(onSignUpSubmit)}
        className='space-y-4'
      >
        <FormField
          control={signUpForm.control}
          name='name'
          render={({ field }) => (
            <FormItem>
              <FormLabel>Name</FormLabel>
              <FormControl>
                <Input type='text' placeholder='Enter your name' {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={signUpForm.control}
          name='email'
          render={({ field }) => (
            <FormItem>
              <FormLabel>Email</FormLabel>
              <FormControl>
                <Input type='email' placeholder='Enter your email' {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={signUpForm.control}
          name='password'
          render={({ field }) => (
            <FormItem>
              <FormLabel>Password</FormLabel>
              <FormControl>
                <Input
                  type='password'
                  placeholder='Create a password'
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={signUpForm.control}
          name='confirmPassword'
          render={({ field }) => (
            <FormItem>
              <FormLabel>Confirm Password</FormLabel>
              <FormControl>
                <Input
                  type='password'
                  placeholder='Confirm your password'
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        {renderError()}
        <Button type='submit' className='w-full' disabled={isLoading}>
          {isLoading
            ? AUTH_DIALOG_CONSTANTS.UI.LOADING_STATES.SIGN_UP
            : AUTH_DIALOG_CONSTANTS.UI.BUTTON_TEXT.SIGN_UP}
        </Button>
      </form>
    </Form>
  )

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className={AUTH_DIALOG_CONSTANTS.UI.DIALOG_MAX_WIDTH}>
        <DialogHeader>
          <DialogTitle>Welcome to Florence</DialogTitle>
          <DialogDescription>
            Sign in to your account or create a new one to get started.
          </DialogDescription>
        </DialogHeader>

        <Tabs defaultValue='signin' className='w-full'>
          <TabsList className='grid w-full grid-cols-2'>
            <TabsTrigger value='signin'>Sign In</TabsTrigger>
            <TabsTrigger value='signup'>Sign Up</TabsTrigger>
          </TabsList>

          <TabsContent value='signin' className='space-y-4'>
            {renderSignInForm()}
          </TabsContent>

          <TabsContent value='signup' className='space-y-4'>
            {renderSignUpForm()}
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  )
}
