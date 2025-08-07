# GetImages Testing Strategy & Implementation Plan

## Project Overview

This document outlines the comprehensive testing strategy for GetImages, a Next.js 15 TypeScript image scraper web application. The testing infrastructure focuses on core user workflows, business logic validation, and API integration reliability.

## Testing Technology Stack

### Core Testing Framework
- **Jest**: Primary testing framework with Next.js 15 support
- **React Testing Library**: Component and hook testing
- **@testing-library/jest-dom**: Extended matchers for DOM testing
- **TypeScript**: Full type safety in test files

### API Mocking & Network Testing
- **MSW (Mock Service Worker)**: SERPAPI response mocking
- **@testing-library/user-event**: User interaction simulation
- **next/jest**: Next.js specific testing configuration

### Testing Utilities
- **Custom render functions**: Provider wrapper testing
- **Mock factories**: Standardized test data generation
- **Test utilities**: Helper functions for common testing patterns

## Test Architecture

### Directory Structure
```
__tests__/
├── __mocks__/                    # Global mocks
│   ├── serpapi-responses.ts      # SERPAPI mock responses
│   └── localStorage.ts           # Browser API mocks
├── components/                   # Component tests
│   ├── image-results-display.test.tsx
│   ├── search-panel.test.tsx
│   └── settings-dialog.test.tsx
├── hooks/                        # Hook tests
│   ├── use-api-key.test.ts
│   ├── use-image-search.test.ts
│   ├── use-image-selection.test.ts
│   └── use-search-history.test.ts
├── lib/                          # Service/utility tests
│   ├── api-key-storage.test.ts
│   ├── api-key-usage.test.ts
│   ├── cache.test.ts
│   └── serpapi.service.test.ts
├── pages/
│   └── api/                      # API route tests
│       ├── scraper.test.ts
│       └── usage.test.ts
├── integration/                  # Integration tests
│   ├── search-workflow.test.tsx
│   └── api-key-management.test.tsx
├── setup/                        # Test configuration
│   ├── jest.setup.ts
│   ├── test-utils.tsx
│   └── msw-handlers.ts
└── fixtures/                     # Test data
    ├── api-responses.ts
    ├── search-results.ts
    └── user-scenarios.ts
```

## Core Testing Priorities

### 1. Critical User Workflows (High Priority)

#### Image Search Flow
- **Multi-keyword search execution**
- **Error handling and user feedback**
- **Result caching and retrieval**
- **Sample search demonstration**

#### API Key Management
- **User key validation and storage**
- **Environment key fallback logic**
- **Key rotation and exhaustion handling**
- **Security warnings and user guidance**

#### Search History Management
- **History persistence and retrieval**
- **Entry addition and removal**
- **History clearing and limits**
- **Relative time formatting**

### 2. Business Logic Validation (High Priority)

#### SERPAPI Service
- **Multi-keyword search processing**
- **Error pattern matching and mapping**
- **Cache key generation and lookup**
- **Rate limiting and request sequencing**

#### API Key Usage Monitoring
- **Usage tracking and validation**
- **Exhausted key detection**
- **Key priority and selection logic**
- **Cache invalidation strategies**

#### Caching System
- **TTL-based cache expiration**
- **Hash-based cache key generation**
- **Memory management and cleanup**
- **Hit/miss ratio optimization**

### 3. API Integration Testing (Medium Priority)

#### Search API Endpoint (`/api/scraper`)
- **Single and multi-keyword requests**
- **Filter parameter handling**
- **Error response formatting**
- **User API key override logic**

#### Usage API Endpoint (`/api/usage`)
- **Usage statistics retrieval**
- **API key header processing**
- **Error handling for invalid keys**
- **Response format validation**

### 4. Component Integration (Medium Priority)

#### Search Components
- **Search panel form validation**
- **Image results display and selection**
- **Loading states and error messages**
- **Settings dialog functionality**

## Test Implementation Strategy

### 1. Hook Testing Approach

```typescript
// Example: useImageSearch hook testing
describe('useImageSearch', () => {
  it('should handle multi-keyword search successfully', async () => {
    const { result } = renderHook(() => useImageSearch())
    const mockApiKeyConfig = { apiKey: 'test-key', source: 'user', isValid: true }
    
    await act(async () => {
      await result.current.search(['삼계탕', '김치찌개'], mockApiKeyConfig)
    })
    
    expect(result.current.results).toBeDefined()
    expect(result.current.error).toBeNull()
  })

  it('should handle API key exhaustion gracefully', async () => {
    // Test exhausted key scenario
  })

  it('should implement proper error mapping', async () => {
    // Test SERPAPI error handling
  })
})
```

### 2. Service Layer Testing

```typescript
// Example: SERPAPI service testing with MSW
describe('searchMultipleKeywords', () => {
  beforeEach(() => {
    server.use(
      rest.get('https://serpapi.com/search', (req, res, ctx) => {
        return res(ctx.json(mockSerpAPIResponse))
      })
    )
  })

  it('should process multiple keywords sequentially', async () => {
    const result = await searchMultipleKeywords(['keyword1', 'keyword2'])
    expect(result.success).toBe(true)
    expect(Object.keys(result.results)).toHaveLength(2)
  })
})
```

### 3. API Route Testing

```typescript
// Example: API route testing
describe('/api/scraper', () => {
  it('should handle POST requests with multiple keywords', async () => {
    const req = createMocks({
      method: 'POST',
      body: {
        keywords: ['삼계탕', '김치찌개'],
        max_results_per_keyword: 5
      }
    })

    const res = await scraperHandler(req, res)
    
    expect(res._getStatusCode()).toBe(200)
    const data = JSON.parse(res._getData())
    expect(data.success).toBe(true)
  })
})
```

### 4. Integration Testing Strategy

Focus on complete user workflows:
- **End-to-end search process** with API key management
- **Error recovery scenarios** with fallback mechanisms
- **Cross-component state management** validation
- **localStorage integration** with security considerations

## Mock Strategy

### SERPAPI Response Mocking
```typescript
// Comprehensive SERPAPI response mocking
export const mockSerpAPIResponses = {
  success: {
    images_results: [
      {
        position: 1,
        thumbnail: "https://example.com/thumb.jpg",
        source: "example.com",
        title: "Sample Image",
        link: "https://example.com/full.jpg"
      }
    ],
    search_metadata: {
      status: "Success",
      processed_at: "2024-01-01T00:00:00.000Z"
    }
  },
  exhausted: {
    error: "You have reached your monthly search limit"
  },
  invalidKey: {
    error: "Invalid API key"
  }
}
```

### LocalStorage Mocking
```typescript
// Browser API mocking for consistent testing
const localStorageMock = (() => {
  let store: Record<string, string> = {}
  return {
    getItem: (key: string) => store[key] || null,
    setItem: (key: string, value: string) => store[key] = value,
    removeItem: (key: string) => delete store[key],
    clear: () => store = {}
  }
})()

Object.defineProperty(window, 'localStorage', { value: localStorageMock })
```

## Coverage Goals

### Target Coverage Metrics
- **Statements**: 90%+
- **Branches**: 85%+
- **Functions**: 95%+
- **Lines**: 90%+

### Critical Path Coverage (100% Required)
- API key validation and fallback logic
- SERPAPI error handling and mapping
- Search result caching and retrieval
- User workflow state management

### Coverage Exclusions
- Next.js generated files
- Third-party library integrations
- Development-only utilities
- Static configuration files

## Testing Commands

### Development Testing
```bash
# Run all tests with watch mode
pnpm test:watch

# Run specific test file
pnpm test -- use-image-search.test.ts

# Run tests with coverage
pnpm test:coverage
```

### CI/CD Integration
```bash
# Full test suite for CI
pnpm test:ci

# Coverage report generation
pnpm test:coverage:ci

# Performance and snapshot testing
pnpm test:snapshot
```

## Quality Gates

### Pre-commit Requirements
- All new code must have corresponding tests
- Minimum 85% coverage for modified files
- No failing tests in CI pipeline
- TypeScript compilation without errors

### Review Criteria
- Tests follow AAA pattern (Arrange, Act, Assert)
- Mock usage is appropriate and not overused
- Edge cases and error scenarios are covered
- Tests are readable and maintainable

## Implementation Timeline

### Phase 1: Infrastructure (Week 1)
- Jest and RTL setup with Next.js 15
- MSW configuration for API mocking
- Test utilities and helper creation
- CI/CD integration setup

### Phase 2: Core Testing (Week 2)
- Hook testing implementation
- Service layer test coverage
- API route testing setup
- Error handling validation

### Phase 3: Integration & Polish (Week 3)
- End-to-end workflow testing
- Component integration tests
- Performance and snapshot testing
- Documentation and review

## Maintenance Strategy

### Regular Testing Practices
- **Weekly**: Review test coverage reports
- **Monthly**: Update mock data and scenarios
- **Quarterly**: Audit test performance and relevance
- **Release**: Full regression testing suite

### Test Data Management
- Maintain realistic mock responses
- Update test fixtures with API changes
- Version control test data changes
- Document mock scenario purposes

This comprehensive testing strategy ensures robust validation of GetImages' critical functionality while maintaining high code quality and user experience standards.