import { render, screen } from '@testing-library/react'
import { HubFooter } from '../index'

describe('HubFooter', () => {
  it('renders default app name', () => {
    render(<HubFooter />)

    expect(screen.getByText(/Florence/)).toBeInTheDocument()
  })

  it('renders custom app name', () => {
    render(<HubFooter appName='Custom App' />)

    expect(screen.getByText(/Custom App/)).toBeInTheDocument()
  })

  it('renders footer text', () => {
    render(<HubFooter />)

    expect(screen.getByText('Made for quieter health admin moments.')).toBeInTheDocument()
  })
})
