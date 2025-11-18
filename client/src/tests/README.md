# Frontend Testing Guide

## Cấu trúc Tests

```
src/tests/
├── setup.js                    # Vitest setup file
├── components/                 # Component tests
│   └── MovieCard.test.jsx
├── utils/                      # Utility tests
│   └── api.test.js
└── README.md                   # File này
```

## Chạy Tests

### Chạy tất cả tests
```bash
cd client
npm test
```

### Chạy tests với watch mode
```bash
npm test -- --watch
```

### Chạy tests với UI
```bash
npm run test:ui
```

### Chạy tests với coverage
```bash
npm run test:coverage
```

### Chạy test cụ thể
```bash
npm test -- MovieCard
```

## Test Coverage

Xem coverage report:
```bash
npm run test:coverage

# Coverage report sẽ được tạo trong coverage/ folder
```

## Viết Tests Mới

### Component Test Example
```jsx
import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import MyComponent from '../components/MyComponent'

describe('MyComponent', () => {
  it('renders correctly', () => {
    render(<MyComponent />)
    expect(screen.getByText('Hello')).toBeInTheDocument()
  })
})
```

### Utility Test Example
```js
import { describe, it, expect } from 'vitest'
import { myFunction } from '../utils/myUtils'

describe('myFunction', () => {
  it('returns expected value', () => {
    expect(myFunction('input')).toBe('expected')
  })
})
```

## Testing Library Matchers

Các matchers từ `@testing-library/jest-dom`:

- `toBeInTheDocument()`
- `toHaveTextContent()`
- `toHaveAttribute()`
- `toBeVisible()`
- `toBeDisabled()`
- etc.

## Best Practices

1. **Test user behavior**: Test những gì user thấy và làm
2. **Avoid testing implementation**: Không test internal implementation
3. **Use data-testid sparingly**: Chỉ khi cần thiết
4. **Mock external dependencies**: Mock API calls, router, etc.
5. **Keep tests simple**: Mỗi test chỉ test một thing

## Mocking

### Mock API calls
```js
import { vi } from 'vitest'

vi.mock('../services/movieService', () => ({
  getMoviesRequest: vi.fn(() => Promise.resolve({ data: [] }))
}))
```

### Mock React Router
```js
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom')
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  }
})
```

