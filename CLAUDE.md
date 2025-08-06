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
- **API Key Management**: LocalStorage with environment variable fallback
- **Components**: Located in `src/components/ui/`

### API Structure
- `src/app/api/scraper/route.ts` - Next.js API route using SERPAPI
- `scripts/scraper.py` - Standalone Python CLI script using DuckDuckGo
- `requirements.txt` - Python dependencies for CLI usage

### Key Features
- **API Key Flexibility**: Users can provide their own SERPAPI key or use the environment default
- **API Key Rotation**: Automatic rotation between multiple environment keys for load balancing
- **In-Memory Caching**: 24-hour cache for search results to reduce API calls and improve performance
- **Immediate Usability**: Works out-of-the-box with environment SERPAPI_KEY
- **Dual Usage**: Web interface for interactive use, CLI for batch processing
- **Error Handling**: Graceful fallbacks and user feedback

### API Endpoints
- `POST /api/scraper` - Web API endpoint supporting:
  - Single query: `{"query": "keyword", "max_results": 3}`
  - Multiple keywords: `{"keywords": ["keyword1", "keyword2"], "max_keywords": 10}`
  - Optional user API key in request headers or body

### Environment Setup

#### Web Application (SERPAPI)
1. Get API key from https://serpapi.com/manage-api-key
2. Set `SERPAPI_KEY` environment variable for default usage
3. Optionally set `SERPAPI_KEY2` for automatic key rotation and load balancing
4. Users can optionally override with their own key in the UI

#### CLI Script (DuckDuckGo)
1. Install dependencies: `pip install -r requirements.txt`
2. Run: `python scripts/scraper.py`
3. No API key required (uses free DuckDuckGo search)

## API Key Management

The application supports flexible API key configuration:

1. **Environment Default**: Uses `SERPAPI_KEY` from environment variables
2. **User Override**: Users can set their own key in the UI settings
3. **Fallback Logic**: User key takes precedence, falls back to environment key
4. **Persistence**: User keys stored in browser localStorage

This approach allows:
- Immediate functionality for new users
- Personal API key usage for heavy users
- Easy deployment and self-hosting

## Caching System

The application implements an in-memory caching system to reduce redundant API calls and improve performance:

### Cache Implementation
- **Location**: `src/lib/cache.ts` - Generic in-memory cache utility
- **Integration**: Applied in `searchImagesWithSerpAPI` function in API route
- **Type**: In-memory Map with TTL (Time To Live) support

### Cache Configuration
- **Default TTL**: 24 hours (86400000ms) for search results
- **Max Entries**: 1000 cached search results
- **Cleanup**: Automatic cleanup every 1 hour to remove expired entries
- **Key Strategy**: `${normalized_query}:${max_results}:${api_key_hash}`

### Cache Features
- **Automatic Expiration**: Entries automatically expire after 24 hours
- **Memory Management**: LRU-style eviction when max size is reached
- **API Key Awareness**: Different cache entries for different API keys
- **Query Normalization**: Case-insensitive and trimmed query matching
- **Graceful Fallback**: Cache failures don't break API functionality

### Cache Benefits
- **Cost Reduction**: Eliminates duplicate SERPAPI calls for repeated searches
- **Performance**: Cached results return in <10ms vs API call latency
- **User Experience**: Instant results for previously searched queries
- **Rate Limit Protection**: Reduces API usage against rate limits

### Technical Details
- Cache keys include query, max_results, and API key hash for proper isolation
- Successful search results only are cached (errors are not cached)
- Console logging for cache hits/misses and cleanup operations
- Thread-safe operations with automatic cleanup timers

## Deployment

Configured for Vercel deployment with:
- Automatic Next.js detection and deployment
- Environment variable support for SERPAPI_KEY
- Static file serving for CLI scripts and requirements

## UI/UX Guidelines

### Styling Considerations
- Make sure all buttons should have cursor:pointer.