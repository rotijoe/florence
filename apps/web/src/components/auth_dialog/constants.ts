export const AUTH_DIALOG_CONSTANTS = {
  FORM_DEFAULTS: {
    SIGN_IN: {
      email: '',
      password: ''
    },
    SIGN_UP: {
      name: '',
      email: '',
      password: '',
      confirmPassword: ''
    }
  },
  VALIDATION: {
    MIN_PASSWORD_LENGTH: 6,
    MIN_NAME_LENGTH: 2
  },
  UI: {
    DIALOG_MAX_WIDTH: 'sm:max-w-md',
    LOADING_STATES: {
      SIGN_IN: 'Signing in...',
      SIGN_UP: 'Creating account...'
    },
    BUTTON_TEXT: {
      SIGN_IN: 'Sign In',
      SIGN_UP: 'Sign Up'
    }
  },
  ERROR_MESSAGES: {
    GENERIC_SIGN_IN: 'An error occurred during sign in',
    GENERIC_SIGN_UP: 'An error occurred during sign up'
  }
} as const
