import { render, screen } from '@testing-library/react'
import { HubWelcomeHeader } from '../index'

describe('HubWelcomeHeader', () => {
  it('renders greeting', () => {
    render(<HubWelcomeHeader greeting="Good morning, Alex" subtitle="Welcome back" />)

    expect(screen.getByText('Good morning, Alex')).toBeInTheDocument()
  })

  it('renders subtitle', () => {
    render(<HubWelcomeHeader greeting="Hello" subtitle="Welcome back" />)

    expect(screen.getByText('Welcome back')).toBeInTheDocument()
  })
})

