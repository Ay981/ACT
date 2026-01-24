import { render, screen, fireEvent } from '@testing-library/react'
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import AdminDashboard from './AdminDashboard'
import { MemoryRouter } from 'react-router-dom'

describe('AdminDashboard', () => {
  beforeEach(() => {
    vi.spyOn(window, 'alert').mockImplementation(() => {})
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('renders the dashboard title', () => {
    render(
      <MemoryRouter>
        <AdminDashboard />
      </MemoryRouter>
    )
    expect(screen.getByText(/Admin Overview/i)).toBeInTheDocument()
  })

  it('opens the Invite Instructor modal when clicked', () => {
    // Mock isAdmin to return true
    vi.mock('../data/user.js', () => ({
      isAdmin: () => true,
      isInstructor: () => false
    }))
    
    render(
      <MemoryRouter>
        <AdminDashboard />
      </MemoryRouter>
    )
    
    // Find the invitation button (updated text from previous turn)
    const inviteBtn = screen.getByText(/Invite New Instructor/i)
    fireEvent.click(inviteBtn)
    
    // Check if modal title appears
    expect(screen.getByRole('heading', { name: 'Invite New Instructor' })).toBeInTheDocument()
  })
})
