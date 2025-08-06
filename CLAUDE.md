# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is an image scraper web application built with Next.js 15 and TypeScript. The project combines a Next.js frontend with a Python serverless API for image scraping functionality using DuckDuckGo Search.

## Development Commands

```bash
# Development server with Turbopack
pnpm dev
# or npm run dev / yarn dev / bun dev

# Build for production
npm run build

# Start production server
npm run start

# Lint the codebase
npm run lint
```

## Architecture

### Hybrid Language Setup
The project uses a dual-language architecture:
- **Frontend**: TypeScript/React with Next.js 15 App Router
- **Backend API**: Python serverless functions deployed on Vercel

### API Structure
- `api/scraper.py` - Python serverless function that handles image scraping requests
- `requirements.txt` - Python dependencies (specifically `ddgs` for DuckDuckGo Search)
- `scripts/scraper.py` - Original Python script (legacy, converted to serverless)

### Key Components
- **Image Scraping**: Uses DuckDuckGo Search API via the `ddgs` Python package
- **Serverless Deployment**: Configured for Vercel with `vercel.json` specifying Python runtime
- **API Endpoints**: 
  - `POST /api/scraper` - Accepts single query or multiple keywords for image search
  - Supports CORS for frontend integration

### Frontend Structure
- Uses Next.js App Router (`src/app/`)
- Tailwind CSS for styling
- Geist font family optimization

## Python API Details

The Python API handler (`api/scraper.py`) provides two main functions:
- `find_images_with_ddgs()` - Single keyword image search
- `search_multiple_keywords()` - Batch processing of multiple keywords

Request formats:
- Single: `{"query": "keyword", "max_results": 3}`
- Multiple: `{"keywords": ["keyword1", "keyword2"], "max_keywords": 10}`

## Deployment

The project is configured for Vercel deployment with automatic detection of both Next.js and Python serverless functions. The `vercel.json` specifies Python 3.9 runtime for the API functions.