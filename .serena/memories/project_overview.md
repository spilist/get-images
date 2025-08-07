# Project Overview

## Purpose
GetImages is a **multi-source image scraper web application** that provides both web interface and CLI tools for image searching. The project uses SERPAPI (Google Images) for the web application and DuckDuckGo for the CLI script.

**Live Application**: https://get-images.effectiveai.io  
**Repository**: https://github.com/spilist/get-images

## Tech Stack
- **Frontend**: Next.js 15 with React, TypeScript, shadcn/ui components, Tailwind CSS
- **Backend**: Next.js API routes (`/api/scraper`, `/api/usage`)
- **Image Search**: SERPAPI (Google Images) for web app, DuckDuckGo for CLI
- **Caching**: Custom in-memory cache system with TTL support
- **Package Manager**: pnpm (preferred)
- **Deployment**: Vercel with automatic Next.js detection

## Key Features
- **Dual API Support**: Web interface (SERPAPI) + CLI tool (DuckDuckGo)
- **API Key Management**: Environment and user-provided SERPAPI keys with type safety
- **Intelligent Caching**: 24-hour cache reduces API calls and improves performance
- **Usage Monitoring**: Real-time API key quota tracking and exhausted key exclusion
- **Multi-keyword Search**: Supports searching multiple terms simultaneously
- **Search History**: Persistent search history with rerun capabilities
- **Advanced Filters**: License types, image sizes, aspect ratios, date ranges
- **Security Warnings**: XSS risk notifications for localStorage usage

## Architecture Highlights
- **Type-Safe API Key Handling**: `ApiKeyConfig` interface ensures consistent key management
- **Centralized Logic**: `useImageSearch` hook handles all search and key selection logic
- **Pattern-Based Error Handling**: `SERPAPI_ERROR_MAP` provides maintainable error management
- **Smart Key Selection**: Usage-based validation prioritizes functional keys automatically