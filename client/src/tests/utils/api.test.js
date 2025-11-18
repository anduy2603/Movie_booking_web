/**
 * Test cho API utilities
 */
import { describe, it, expect, vi, beforeEach } from 'vitest'
import api from '../../lib/api'

describe('API Configuration', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('has correct base URL', () => {
    expect(api.defaults.baseURL).toBeDefined()
  })

  it('has correct timeout', () => {
    expect(api.defaults.timeout).toBe(10000)
  })

  it('has correct headers', () => {
    expect(api.defaults.headers['Content-Type']).toBe('application/json')
  })
})

