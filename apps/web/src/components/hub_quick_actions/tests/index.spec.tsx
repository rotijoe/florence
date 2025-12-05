import { render, screen } from '@testing-library/react'
import { HubQuickActions } from '../index'
import {
  HUB_SYMPTOM_QUICK_ACTIONS,
  HUB_EVENT_QUICK_ACTIONS,
  HUB_APPOINTMENT_QUICK_ACTIONS
} from '../constants'

describe('HubQuickActions', () => {
  it('renders quick log section', () => {
    render(
      <HubQuickActions
        symptomOptions={HUB_SYMPTOM_QUICK_ACTIONS}
        eventOptions={HUB_EVENT_QUICK_ACTIONS}
        appointmentOptions={HUB_APPOINTMENT_QUICK_ACTIONS}
      />
    )

    expect(screen.getByText('Quick log')).toBeInTheDocument()
    expect(screen.getByText('Capture what is happening in just a few taps.')).toBeInTheDocument()
  })

  it('renders action buttons', () => {
    render(
      <HubQuickActions
        symptomOptions={HUB_SYMPTOM_QUICK_ACTIONS}
        eventOptions={HUB_EVENT_QUICK_ACTIONS}
        appointmentOptions={HUB_APPOINTMENT_QUICK_ACTIONS}
      />
    )

    expect(screen.getByText('Log symptom')).toBeInTheDocument()
    expect(screen.getByText('Create event')).toBeInTheDocument()
    expect(screen.getByText('Add appointment')).toBeInTheDocument()
    expect(screen.getByText('Add health track')).toBeInTheDocument()
  })
})
