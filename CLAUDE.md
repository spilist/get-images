# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is an image scraper web application built with Next.js 15 and TypeScript. The project provides both a web interface and CLI tools for image scraping, using different APIs for different use cases.

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
3. Users can optionally override with their own key in the UI

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

## Deployment

Configured for Vercel deployment with:
- Automatic Next.js detection and deployment
- Environment variable support for SERPAPI_KEY
- Static file serving for CLI scripts and requirements