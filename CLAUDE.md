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
```

Alternative package managers can be used, but pnpm is recommended for consistency.

## Architecture

### Dual API Approach
The project uses different image search APIs for different contexts:
- **Web Application**: SERPAPI (Google Images) via Next.js API routes
- **CLI Script**: DuckDuckGo Search via Python `ddgs` package

### Frontend Structure
- **Framework**: TypeScript/React with Next.js 15 App Router
- **UI**: shadcn/ui components with Tailwind CSS
- **API Key Management**: Type-safe handling via `ApiKeyConfig` interface
- **Components**: Located in `src/components/ui/`
- **Hooks**: Business logic abstracted in `src/hooks/`

### API Structure
- `src/app/api/scraper/route.ts` - Main image search API endpoint
- `src/app/api/usage/route.ts` - API key usage monitoring endpoint
- `src/lib/serpapi.service.ts` - SERPAPI integration and error handling
- `src/hooks/use-image-search.ts` - Search functionality and API key management
- `scripts/scraper.py` - Standalone Python CLI script using DuckDuckGo
- `requirements.txt` - Python dependencies for CLI usage

### Key Features
- **API Key Management**: Support for environment and user-provided SERPAPI keys
- **Intelligent Caching**: In-memory cache reduces API calls and improves performance
- **Error Handling**: Pattern-based error mapping with user-friendly messages
- **Usage Monitoring**: Real-time API key quota tracking

### API Endpoints
- `POST /api/scraper` - Main image search API
  - Supports single/multiple keyword searches
  - Optional user API key via headers or body
- `GET /api/usage` - API key usage monitoring
  - Returns quota and usage statistics
  - Supports `X-API-Key` header for user keys

### Environment Setup
1. Set `SERPAPI_KEY` environment variable
2. Optionally set `SERPAPI_KEY2` for automatic key rotation  
3. Users can override with personal keys via Settings UI

## API Key Management

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

## Caching System

In-memory caching implemented in `src/lib/cache.ts`:
- **TTL**: 24-hour cache for search results
- **Key Strategy**: `${query}:${max_results}:${api_key_hash}`
- **Benefits**: Eliminates duplicate API calls, improves performance

## Error Handling System

Pattern-based error mapping in `src/lib/serpapi.service.ts` using `SERPAPI_ERROR_MAP`:
- Context-aware messages (different for user vs environment keys)  
- Handles API key issues, quota limits, service errors
- Uses `getValidApiKey()` to find non-exhausted keys automatically

## API Usage Monitoring

`GET /api/usage` endpoint provides key usage statistics:
- Returns remaining quotas and current usage
- Used by Settings dialog and `getValidApiKey()` function  
- Supports `X-API-Key` header for user-specific checks

## Deployment

Vercel deployment ready with environment variable support for `SERPAPI_KEY`.

## UI/UX Guidelines

- All buttons should have `cursor: pointer`

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