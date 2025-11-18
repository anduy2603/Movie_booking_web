/**
 * Vitest setup file
 * Chạy trước mỗi test file
 */
import { expect, afterEach } from 'vitest'
import { cleanup } from '@testing-library/react'
import * as matchers from '@testing-library/jest-dom/matchers'

// Extend Vitest's expect với jest-dom matchers
expect.extend(matchers)

// Cleanup sau mỗi test
afterEach(() => {
  cleanup()
})

