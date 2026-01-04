import { render } from '@testing-library/react'
import { FileIcon } from '../index'

describe('FileIcon', () => {
  it('renders PDF icon with correct styling', () => {
    const { container } = render(<FileIcon fileType='pdf' />)

    const iconContainer = container.querySelector('.bg-destructive\\/10')
    expect(iconContainer).toBeInTheDocument()
    expect(iconContainer).toHaveClass('size-8')
  })

  it('renders Word icon with correct styling', () => {
    const { container } = render(<FileIcon fileType='word' />)

    const iconContainer = container.querySelector('.bg-blue-500\\/10')
    expect(iconContainer).toBeInTheDocument()
  })

  it('renders image icon with correct styling', () => {
    const { container } = render(<FileIcon fileType='image' />)

    const iconContainer = container.querySelector('.bg-muted')
    expect(iconContainer).toBeInTheDocument()
  })

  it('renders text icon with correct styling', () => {
    const { container } = render(<FileIcon fileType='text' />)

    const iconContainer = container.querySelector('.bg-muted')
    expect(iconContainer).toBeInTheDocument()
  })

  it('renders other file type icon with correct styling', () => {
    const { container } = render(<FileIcon fileType='other' />)

    const iconContainer = container.querySelector('.bg-muted')
    expect(iconContainer).toBeInTheDocument()
  })

  it('renders with sm size by default', () => {
    const { container } = render(<FileIcon fileType='pdf' />)

    const iconContainer = container.querySelector('.size-8')
    expect(iconContainer).toBeInTheDocument()
  })

  it('renders with md size when specified', () => {
    const { container } = render(<FileIcon fileType='pdf' size='md' />)

    const iconContainer = container.querySelector('.size-12')
    expect(iconContainer).toBeInTheDocument()
  })

  it('renders correct icon size for sm', () => {
    const { container } = render(<FileIcon fileType='pdf' size='sm' />)

    const icon = container.querySelector('.size-4')
    expect(icon).toBeInTheDocument()
  })

  it('renders correct icon size for md', () => {
    const { container } = render(<FileIcon fileType='pdf' size='md' />)

    const icon = container.querySelector('.size-6')
    expect(icon).toBeInTheDocument()
  })
})

