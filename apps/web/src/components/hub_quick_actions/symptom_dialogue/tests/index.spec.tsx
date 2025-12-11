import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { SymptomDialogue } from '../index'
import { SYMPTOM_TYPES, SEVERITY_LABELS } from '../constants'

const mockTracks = [
  {
    id: 'sleep-track',
    slug: 'sleep-track',
    title: 'Sleep',
    lastUpdatedAt: new Date('2024-01-15T10:00:00Z')
  },
  {
    id: 'pain-track',
    slug: 'pain-track',
    title: 'Pain',
    lastUpdatedAt: new Date('2024-01-14T08:00:00Z')
  }
]

const mockOnClose = jest.fn()
const mockOnSuccess = jest.fn()

global.fetch = jest.fn()

describe('SymptomDialogue', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    ;(global.fetch as jest.Mock).mockResolvedValue({
      ok: true,
      json: async () => ({
        success: true,
        data: {
          id: 'event-1',
          trackId: 'track-1',
          date: new Date().toISOString(),
          type: 'SYMPTOM',
          title: 'Headache',
          notes: 'Test notes',
          symptomType: 'headache',
          severity: 3,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        }
      })
    })
  })

  it('renders dialog when open', () => {
    render(
      <SymptomDialogue
        open={true}
        onOpenChange={mockOnClose}
        tracks={mockTracks}
        userId='user-1'
        onSuccess={mockOnSuccess}
      />
    )

    expect(screen.getByRole('heading', { name: 'Log symptom' })).toBeInTheDocument()
  })

  it('does not render dialog when closed', () => {
    render(
      <SymptomDialogue
        open={false}
        onOpenChange={mockOnClose}
        tracks={mockTracks}
        userId='user-1'
        onSuccess={mockOnSuccess}
      />
    )

    expect(screen.queryByText('Log symptom')).not.toBeInTheDocument()
  })

  it('defaults to the most recently updated track', () => {
    render(
      <SymptomDialogue
        open={true}
        onOpenChange={mockOnClose}
        tracks={mockTracks}
        userId='user-1'
        onSuccess={mockOnSuccess}
      />
    )

    const trackSelect = screen.getByRole('combobox', { name: /track/i })
    expect(trackSelect).toHaveTextContent('Sleep')
  })

  it('renders symptom type dropdown with correct label', () => {
    render(
      <SymptomDialogue
        open={true}
        onOpenChange={mockOnClose}
        tracks={mockTracks}
        userId='user-1'
        onSuccess={mockOnSuccess}
      />
    )

    expect(screen.getByRole('combobox', { name: /symptom type/i })).toBeInTheDocument()
  })

  it('renders severity buttons 1-5', () => {
    render(
      <SymptomDialogue
        open={true}
        onOpenChange={mockOnClose}
        tracks={mockTracks}
        userId='user-1'
        onSuccess={mockOnSuccess}
      />
    )

    for (let i = 1; i <= 5; i++) {
      const severityLabel = SEVERITY_LABELS[i as keyof typeof SEVERITY_LABELS]
      expect(
        screen.getByRole('button', { name: `Severity ${i}: ${severityLabel}` })
      ).toBeInTheDocument()
    }
  })

  it('allows selecting a severity', async () => {
    const user = userEvent.setup()
    render(
      <SymptomDialogue
        open={true}
        onOpenChange={mockOnClose}
        tracks={mockTracks}
        userId='user-1'
        onSuccess={mockOnSuccess}
      />
    )

    const severityButton = screen.getByRole('button', { name: /Severity 3: Moderate/i })
    await user.click(severityButton)

    expect(severityButton).toHaveAttribute('data-state', 'on')
  })

  it('submits form with correct payload', async () => {
    const user = userEvent.setup()
    render(
      <SymptomDialogue
        open={true}
        onOpenChange={mockOnClose}
        tracks={mockTracks}
        userId='user-1'
        onSuccess={mockOnSuccess}
      />
    )

    // Open symptom type dropdown and select first option
    const symptomTypeCombobox = screen.getByRole('combobox', { name: /symptom type/i })
    await user.click(symptomTypeCombobox)

    // Wait for dropdown to open and click the first symptom type
    const symptomTypeOption = await screen.findByRole('menuitem', {
      name: SYMPTOM_TYPES[0].label
    })
    await user.click(symptomTypeOption)

    // Select severity
    const severityButton = screen.getByRole('button', { name: /Severity 3: Moderate/i })
    await user.click(severityButton)

    // Enter notes
    const notesTextarea = screen.getByRole('textbox', { name: /notes/i })
    await user.type(notesTextarea, 'Test symptom notes')

    // Submit
    const submitButton = screen.getByRole('button', { name: /log symptom/i })
    await user.click(submitButton)

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining('/api/users/user-1/tracks/sleep-track/events'),
        expect.objectContaining({
          method: 'POST',
          headers: expect.objectContaining({
            'Content-Type': 'application/json'
          }),
          body: JSON.stringify({
            type: 'SYMPTOM',
            title: SYMPTOM_TYPES[0].label,
            symptomType: SYMPTOM_TYPES[0].value,
            severity: 3,
            notes: 'Test symptom notes'
          })
        })
      )
    })
  })

  it('disables submit button while submitting', async () => {
    ;(global.fetch as jest.Mock).mockImplementation(
      () =>
        new Promise((resolve) => {
          setTimeout(() => {
            resolve({
              ok: true,
              json: async () => ({
                success: true,
                data: {
                  id: 'event-1',
                  trackId: 'track-1',
                  date: new Date().toISOString(),
                  type: 'SYMPTOM',
                  title: 'Headache',
                  notes: 'Test notes',
                  symptomType: 'headache',
                  severity: 3,
                  createdAt: new Date().toISOString(),
                  updatedAt: new Date().toISOString()
                }
              })
            })
          }, 100)
        })
    )

    const user = userEvent.setup()
    render(
      <SymptomDialogue
        open={true}
        onOpenChange={mockOnClose}
        tracks={mockTracks}
        userId='user-1'
        onSuccess={mockOnSuccess}
      />
    )

    // Fill required fields first
    const symptomTypeCombobox = screen.getByRole('combobox', { name: /symptom type/i })
    await user.click(symptomTypeCombobox)
    const symptomTypeOption = await screen.findByRole('menuitem', {
      name: SYMPTOM_TYPES[0].label
    })
    await user.click(symptomTypeOption)

    const severityButton = screen.getByRole('button', { name: /Severity 3: Moderate/i })
    await user.click(severityButton)

    const submitButton = screen.getByRole('button', { name: /log symptom/i })
    await user.click(submitButton)

    expect(submitButton).toBeDisabled()
  })

  it('displays error message on API failure', async () => {
    ;(global.fetch as jest.Mock).mockResolvedValue({
      ok: false,
      json: async () => ({
        success: false,
        error: 'Failed to create event'
      })
    })

    const user = userEvent.setup()
    render(
      <SymptomDialogue
        open={true}
        onOpenChange={mockOnClose}
        tracks={mockTracks}
        userId='user-1'
        onSuccess={mockOnSuccess}
      />
    )

    // Fill required fields first
    const symptomTypeCombobox = screen.getByRole('combobox', { name: /symptom type/i })
    await user.click(symptomTypeCombobox)
    const symptomTypeOption = await screen.findByRole('menuitem', {
      name: SYMPTOM_TYPES[0].label
    })
    await user.click(symptomTypeOption)

    const severityButton = screen.getByRole('button', { name: /Severity 3: Moderate/i })
    await user.click(severityButton)

    const submitButton = screen.getByRole('button', { name: /log symptom/i })
    await user.click(submitButton)

    await waitFor(() => {
      expect(screen.getByText(/failed to create event/i)).toBeInTheDocument()
    })
  })

  it('calls onSuccess callback on successful submission', async () => {
    const user = userEvent.setup()
    render(
      <SymptomDialogue
        open={true}
        onOpenChange={mockOnClose}
        tracks={mockTracks}
        userId='user-1'
        onSuccess={mockOnSuccess}
      />
    )

    // Fill required fields first
    const symptomTypeCombobox = screen.getByRole('combobox', { name: /symptom type/i })
    await user.click(symptomTypeCombobox)
    const symptomTypeOption = await screen.findByRole('menuitem', {
      name: SYMPTOM_TYPES[0].label
    })
    await user.click(symptomTypeOption)

    const severityButton = screen.getByRole('button', { name: /Severity 3: Moderate/i })
    await user.click(severityButton)

    const submitButton = screen.getByRole('button', { name: /log symptom/i })
    await user.click(submitButton)

    await waitFor(() => {
      expect(mockOnSuccess).toHaveBeenCalled()
    })
  })

  it('calls onOpenChange when dialog is closed', async () => {
    const user = userEvent.setup()
    render(
      <SymptomDialogue
        open={true}
        onOpenChange={mockOnClose}
        tracks={mockTracks}
        userId='user-1'
        onSuccess={mockOnSuccess}
      />
    )

    const closeButton = screen.getByRole('button', { name: /close/i })
    await user.click(closeButton)

    expect(mockOnClose).toHaveBeenCalledWith(false)
  })

  it('shows validation error when submitting without required fields', async () => {
    const user = userEvent.setup()
    render(
      <SymptomDialogue
        open={true}
        onOpenChange={mockOnClose}
        tracks={mockTracks}
        userId='user-1'
        onSuccess={mockOnSuccess}
      />
    )

    const submitButton = screen.getByRole('button', { name: /log symptom/i })
    await user.click(submitButton)

    await waitFor(() => {
      expect(screen.getByText(/please fill in all required fields/i)).toBeInTheDocument()
    })
  })
})
