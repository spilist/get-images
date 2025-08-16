# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

GetImages is an image scraper web application built with Next.js 15 and TypeScript. The project provides both a web interface and CLI tools for image scraping, using different APIs for different use cases.

**Live Application**: https://get-images.effectiveai.io  
**Repository**: https://github.com/spilist/get-images

## Development Commands

**Note: This project uses pnpm as the preferred package manager.**

```bash
# Install dependencies
pnpm install

# Development server with Turbopack
pnpm dev

# Build for production
pnpm build

# Start production server
pnpm start

# Lint the codebase
pnpm lint

# Test commands
pnpm test          # Run all tests
pnpm test:watch    # Run tests in watch mode
pnpm test:coverage # Run tests with coverage report
pnpm test:ci       # Run tests for CI (no watch, coverage)
```

Alternative package managers can be used, but pnpm is recommended for consistency.

## Architecture

### Project Structure

The project follows a clean architecture with separation of concerns:

```
get-images/
├── src/
│   ├── app/                 # Next.js App Router
│   │   ├── api/scraper/     # API endpoint (SERPAPI)
│   │   ├── api/usage/       # API key usage monitoring
│   │   └── page.tsx         # Main application
│   ├── components/ui/       # shadcn/ui components
│   ├── lib/                 # Core utilities
│   │   ├── serpapi.service.ts  # SERPAPI integration and error handling
│   │   ├── cache.ts         # Intelligent caching system
│   │   └── api-key-storage.ts  # Secure API key management
│   ├── hooks/               # React hooks with centralized logic
│   │   └── use-image-search.ts # Search functionality and API key management
│   └── types/               # TypeScript definitions
├── __tests__/               # Comprehensive test suite
├── scripts/
│   └── scraper.py          # CLI script (DuckDuckGo)
└── requirements.txt        # Python dependencies
```

### Dual API Approach

The project uses different image search APIs for different contexts:
- **Web Application**: SERPAPI (Google Images) via Next.js API routes
- **CLI Script**: DuckDuckGo Search via Python `ddgs` package

### Frontend Architecture

- **Framework**: TypeScript/React with Next.js 15 App Router
- **UI**: shadcn/ui components with Tailwind CSS
- **API Key Management**: Type-safe handling via `ApiKeyConfig` interface
- **Components**: Located in `src/components/ui/`
- **Hooks**: Business logic abstracted in `src/hooks/`

### Key Features

- **API Key Management**: Support for environment and user-provided SERPAPI keys
- **Intelligent Caching**: In-memory cache reduces API calls and improves performance
- **Error Handling**: Pattern-based error mapping with user-friendly messages
- **Usage Monitoring**: Real-time API key quota tracking

## API Endpoints

- `POST /api/scraper` - Main image search API
  - Supports single/multiple keyword searches
  - Optional user API key via headers or body
- `GET /api/usage` - API key usage monitoring
  - Returns quota and usage statistics
  - Supports `X-API-Key` header for user keys

## Configuration

### Environment Setup

1. Set `SERPAPI_KEY` environment variable
2. Optionally set `SERPAPI_KEY2` for automatic key rotation  
3. Users can override with personal keys via Settings UI

### API Key Management

**Type Safety**: Uses `ApiKeyConfig` interface for consistent key handling:
```typescript
interface ApiKeyConfig {
  apiKey: string;
  source: 'environment' | 'user';
  isValid: boolean;
}
```

**Key Selection**:
- User keys (via Settings UI) take precedence over environment keys
- `useImageSearch` hook handles key selection logic
- Automatic fallback from user → environment keys
- Keys stored in localStorage with XSS security warnings

### Caching System

In-memory caching implemented in `src/lib/cache.ts`:
- **TTL**: 24-hour cache for search results
- **Key Strategy**: `${query}:${max_results}:${api_key_hash}`
- **Benefits**: Eliminates duplicate API calls, improves performance

### Error Handling System

Pattern-based error mapping in `src/lib/serpapi.service.ts` using `SERPAPI_ERROR_MAP`:
- Context-aware messages (different for user vs environment keys)  
- Handles API key issues, quota limits, service errors
- Uses `getValidApiKey()` to find non-exhausted keys automatically

### API Usage Monitoring

`GET /api/usage` endpoint provides key usage statistics:
- Returns remaining quotas and current usage
- Used by Settings dialog and `getValidApiKey()` function  
- Supports `X-API-Key` header for user-specific checks

## Development Guidelines

### Code Architecture

**API Key Management**:
- Use `ApiKeyConfig` interface for all key handling operations
- Pass configuration objects rather than string keys between components
- Implement key decision logic in hooks (`useImageSearch`), not UI components
- Handle user and environment keys consistently through the same interface

**Error Handling**:
- Add new error patterns to `SERPAPI_ERROR_MAP` array in `serpapi.service.ts`
- Use pattern-based matching for flexible error detection
- Provide context-aware messages (different for user vs environment keys)
- Keep error handling logic separate from UI components

**Hook Design Patterns**:
- Abstract business logic in custom hooks
- Return consistent state objects with `isLoading`, `error`, and `results`
- Use TypeScript interfaces for all hook return types
- Handle async operations and error states within hooks

### Security Best Practices

**API Key Handling**:
- Display XSS warnings when users store keys in localStorage
- Mask API keys in UI (show only last 8 characters)
- Recommend environment variables for production deployments
- Validate API key formats before storage

**Type Safety**:
- Use strict TypeScript types for all API key configurations
- Define union types for key sources: `'user' | 'environment'`
- Validate API responses match expected TypeScript interfaces
- Handle undefined/null states explicitly in key management logic

### Component Organization

**UI Components**: Focus on presentation and user interaction
**Hooks**: Handle state management, API calls, and business logic  
**Services**: Provide utility functions and external API integration
**Types**: Define interfaces for consistent data structures across the app

## Testing Infrastructure

### Testing Framework
- **Jest 30+**: Primary testing framework with Next.js 15 support
- **React Testing Library**: Component and hook testing
- **MSW (Mock Service Worker)**: SERPAPI response mocking
- **TypeScript**: Full type safety in all test files

### Test Structure
```
__tests__/
├── __mocks__/          # Global mocks (localStorage, SERPAPI responses)
├── setup/              # Test utilities, MSW handlers, configuration
├── fixtures/           # Mock data and test scenarios
├── hooks/              # Hook unit tests (useImageSearch, useApiKey, etc.)
├── lib/                # Service layer tests (cache, SERPAPI, API key management)
└── pages/api/          # API route tests (/api/scraper, /api/usage)
```

### Testing Guidelines

**Hook Testing**:
- Test core user workflows: image search, API key management, search history
- Use `renderHook` from React Testing Library for isolated hook testing
- Mock external dependencies (SERPAPI, localStorage) appropriately
- Test both success and error scenarios with realistic Korean food keywords

**Service Testing**:
- Test business logic in isolation from UI components
- Use MSW to mock SERPAPI responses with realistic data
- Test caching behavior, TTL expiration, and memory management
- Validate error handling and pattern matching in `SERPAPI_ERROR_MAP`

**API Route Testing**:
- Test `/api/scraper` endpoint with multi-keyword requests
- Test `/api/usage` endpoint for API key monitoring
- Mock Next.js request/response objects appropriately
- Validate error responses and status codes

**Integration Testing**:
- Test complete user workflows end-to-end
- Test API key fallback scenarios (user → environment keys)
- Test search history persistence and retrieval
- Test image selection and result caching

### Test Data Strategy
- Use realistic Korean food keywords (삼계탕, 김치찌개, 된장찌개) in test scenarios
- Mock SERPAPI responses with authentic image URLs and metadata
- Test with various API key states: valid, exhausted, invalid, missing
- Include edge cases: rate limiting, network errors, malformed responses

### Coverage Requirements
- **Critical Paths**: 100% coverage required for API key management and search functionality
- **Overall Target**: 90%+ statements, 85%+ branches, 95%+ functions
- **Focus Areas**: Core user workflows, error handling, caching system
- **Exclusions**: Next.js generated files, third-party integrations

### Running Tests
```bash
# Development testing
pnpm test:watch         # Watch mode for development
pnpm test -- hooks/     # Run specific test directory
pnpm test:coverage      # Generate coverage report

# CI/CD testing
pnpm test:ci           # Full test suite for CI
pnpm test:coverage:ci  # Coverage for CI reporting
```

### Mock Strategy
- **SERPAPI Mocking**: Use MSW to intercept and mock API requests with realistic responses
- **LocalStorage Mocking**: Mock browser APIs for consistent testing across environments
- **Time Mocking**: Mock Date and setTimeout for cache TTL testing
- **Error Simulation**: Mock various SERPAPI error scenarios (quota exceeded, invalid keys)

### Quality Gates
- All new features must include corresponding unit tests
- No failing tests allowed in main branch
- Minimum 85% coverage for modified files
- Tests must be readable and follow AAA pattern (Arrange, Act, Assert)

## Deployment

Vercel deployment ready with environment variable support for `SERPAPI_KEY`.

## UI/UX Guidelines

- All buttons should have `cursor: pointer`

## Documentation Maintenance

This project maintains documentation in both English and Korean:
- **English**: `README.md` - Primary documentation
- **Korean**: `README.ko.md` - Korean translation

**Important**: When updating documentation, you MUST update BOTH files to maintain consistency:
1. Update the English `README.md` first
2. Apply equivalent changes to the Korean `README.ko.md`
3. Ensure section structure and content parity between both versions
4. Maintain consistent formatting and styling across languages

**Translation Guidelines**:
- Technical terms may remain in English when commonly used (e.g., API, CLI, TypeScript)
- Code examples and commands should remain identical in both versions
- Links to external resources should use the same URLs unless Korean-specific alternatives exist
- Environment variable names and configuration examples must be identical