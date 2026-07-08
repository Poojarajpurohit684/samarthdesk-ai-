# Testing Guide

## Overview

This guide covers testing strategies for Samarthdesk AI.

## Backend Testing

### Setup

```bash
cd backend
npm install
```

### Running Tests

```bash
# Run all tests
npm run test

# Run tests in watch mode
npm run test -- --watch

# Run tests with coverage
npm run test:coverage

# Run specific test file
npm run test auth.service.test.ts
```

### Test Structure

```
backend/src/
├── services/
│   ├── auth.service.ts
│   └── __tests__/
│       └── auth.service.test.ts
├── controllers/
│   └── __tests__/
└── utils/
    └── __tests__/
```

### Writing Tests

#### Unit Tests (Services)

```typescript
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { authService } from '../auth.service';

describe('AuthService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should register a new user', async () => {
    // Arrange
    const userData = {
      email: 'test@example.com',
      password: 'Test@123',
      firstName: 'Test',
      lastName: 'User',
    };

    // Act
    const result = await authService.register(userData);

    // Assert
    expect(result).toHaveProperty('user');
    expect(result).toHaveProperty('accessToken');
    expect(result.user.email).toBe(userData.email);
  });
});
```

#### Integration Tests (API)

```typescript
import { describe, it, expect } from 'vitest';
import request from 'supertest';
import app from '../../app';

describe('Auth API', () => {
  it('POST /api/v1/auth/register should create a user', async () => {
    const response = await request(app)
      .post('/api/v1/auth/register')
      .send({
        email: 'test@example.com',
        password: 'Test@123',
        firstName: 'Test',
        lastName: 'User',
      });

    expect(response.status).toBe(201);
    expect(response.body.success).toBe(true);
    expect(response.body.data).toHaveProperty('accessToken');
  });
});
```

### Test Coverage Goals

- **Services**: 80% coverage minimum
- **Controllers**: 70% coverage minimum
- **Utils**: 90% coverage minimum
- **Overall**: 75% coverage minimum

## Frontend Testing

### Setup

```bash
cd frontend
npm install
```

### Running Tests

```bash
# Run all tests
npm run test

# Run tests in watch mode
npm run test -- --watch

# Run tests with UI
npm run test -- --ui

# Run tests with coverage
npm run test -- --coverage
```

### Test Structure

```
frontend/src/
├── components/
│   ├── Button.tsx
│   └── __tests__/
│       └── Button.test.tsx
├── hooks/
│   ├── useAuth.ts
│   └── __tests__/
│       └── useAuth.test.ts
└── pages/
    └── __tests__/
```

### Writing Tests

#### Component Tests

```typescript
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Login } from '../Login';

describe('Login Component', () => {
  it('should render login form', () => {
    render(<Login />);
    
    expect(screen.getByText(/sign in/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/password/i)).toBeInTheDocument();
  });

  it('should show validation errors', async () => {
    const { user } = renderWithUser(<Login />);
    
    const submitButton = screen.getByRole('button', { name: /sign in/i });
    await user.click(submitButton);
    
    expect(screen.getByText(/invalid email/i)).toBeInTheDocument();
  });
});
```

#### Hook Tests

```typescript
import { describe, it, expect } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { useAuth } from '../useAuth';

describe('useAuth Hook', () => {
  it('should login user', async () => {
    const { result } = renderHook(() => useAuth());

    result.current.login({
      email: 'test@example.com',
      password: 'Test@123',
    });

    await waitFor(() => {
      expect(result.current.isAuthenticated).toBe(true);
    });
  });
});
```

## E2E Testing (Playwright)

### Setup

```bash
cd frontend
npx playwright install
```

### Running E2E Tests

```bash
# Run all E2E tests
npm run test:e2e

# Run in headed mode
npm run test:e2e -- --headed

# Run specific test
npm run test:e2e -- auth.spec.ts

# Debug mode
npm run test:e2e -- --debug
```

### Writing E2E Tests

```typescript
import { test, expect } from '@playwright/test';

test.describe('Authentication Flow', () => {
  test('should login successfully', async ({ page }) => {
    await page.goto('http://localhost:5173/login');
    
    await page.fill('[name="email"]', 'admin@samarthdesk.com');
    await page.fill('[name="password"]', 'Admin@123');
    await page.click('button[type="submit"]');
    
    await expect(page).toHaveURL(/.*dashboard/);
    await expect(page.locator('text=Welcome')).toBeVisible();
  });

  test('should register new user', async ({ page }) => {
    await page.goto('http://localhost:5173/register');
    
    await page.fill('[name="firstName"]', 'John');
    await page.fill('[name="lastName"]', 'Doe');
    await page.fill('[name="email"]', 'john@example.com');
    await page.fill('[name="password"]', 'Test@123');
    await page.fill('[name="confirmPassword"]', 'Test@123');
    await page.click('button[type="submit"]');
    
    await expect(page).toHaveURL(/.*dashboard/);
  });
});
```

## Test Database

### Setup Test Database

```bash
# Create test database
createdb samarthdesk_test

# Set test environment
export DATABASE_URL="postgresql://user:pass@localhost:5432/samarthdesk_test"

# Run migrations
npx prisma migrate deploy

# Seed test data
npm run db:seed
```

### Clean Database Between Tests

```typescript
import { beforeEach, afterAll } from 'vitest';
import prisma from '../../utils/prisma';

beforeEach(async () => {
  // Clean database
  await prisma.session.deleteMany();
  await prisma.ticket.deleteMany();
  await prisma.user.deleteMany();
});

afterAll(async () => {
  await prisma.$disconnect();
});
```

## Mocking

### Mock Prisma

```typescript
import { vi } from 'vitest';

vi.mock('../../utils/prisma', () => ({
  default: {
    user: {
      findUnique: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
    },
  },
}));
```

### Mock API Calls

```typescript
import { vi } from 'vitest';
import axios from 'axios';

vi.mock('axios');

const mockedAxios = axios as jest.Mocked<typeof axios>;

mockedAxios.post.mockResolvedValue({
  data: { success: true },
});
```

## Testing Checklist

Before pushing code:

- [ ] All unit tests pass
- [ ] All integration tests pass
- [ ] E2E tests pass for critical flows
- [ ] Coverage meets minimum requirements
- [ ] No console errors in tests
- [ ] Tests are deterministic (no flaky tests)
- [ ] Test data is cleaned up

## CI/CD Testing

Tests run automatically on:
- Pull requests
- Push to main/develop
- Before deployment

GitHub Actions will:
1. Install dependencies
2. Run linting
3. Run unit tests
4. Run integration tests
5. Generate coverage report
6. Build project

## Best Practices

1. **Test Naming**: Use descriptive names
   ```typescript
   it('should return 401 when invalid credentials provided')
   ```

2. **Arrange-Act-Assert**: Structure tests clearly
   ```typescript
   // Arrange
   const input = { email: 'test@example.com' };
   
   // Act
   const result = await service.function(input);
   
   // Assert
   expect(result).toBe(expected);
   ```

3. **One Assertion Per Test**: Keep tests focused
   ```typescript
   it('should create user') // Test creation
   it('should hash password') // Test password separately
   ```

4. **Mock External Dependencies**: Don't test external services
   ```typescript
   vi.mock('./emailService');
   ```

5. **Test Edge Cases**: Not just happy paths
   ```typescript
   it('should handle empty email')
   it('should handle special characters in name')
   it('should handle concurrent requests')
   ```

## Debugging Tests

```bash
# Run single test
npm run test -- -t "should login user"

# Debug with inspector
node --inspect-brk node_modules/.bin/vitest

# View test output
npm run test -- --reporter=verbose
```

## Performance Testing

### Load Testing (Backend)

```bash
# Install k6
brew install k6  # macOS
# or download from https://k6.io

# Run load test
k6 run loadtest.js
```

Example load test:
```javascript
import http from 'k6/http';
import { check } from 'k6';

export let options = {
  vus: 100, // 100 virtual users
  duration: '30s',
};

export default function () {
  let res = http.post('http://localhost:5000/api/v1/auth/login', {
    email: 'test@example.com',
    password: 'Test@123',
  });
  
  check(res, {
    'status is 200': (r) => r.status === 200,
    'response time < 500ms': (r) => r.timings.duration < 500,
  });
}
```

## Coverage Reports

View coverage:
```bash
# Backend
cd backend
npm run test:coverage
open coverage/index.html

# Frontend
cd frontend
npm run test -- --coverage
open coverage/index.html
```

## Continuous Testing

```bash
# Watch mode for development
npm run test -- --watch

# Run on file change
npm run test -- --watchAll
```

---

**Remember**: Tests are not just about coverage, they're about confidence. Write tests that give you confidence to deploy!
