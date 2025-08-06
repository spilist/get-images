# Project Overview

## Purpose
This is an **image scraper web application** that allows users to search for images using DuckDuckGo Search. The project combines a Next.js frontend with Python serverless API functions to provide image scraping functionality.

## Tech Stack
- **Frontend**: Next.js 15 with React 19, TypeScript, Tailwind CSS v4
- **Backend**: Python serverless functions (via Vercel)
- **Image Search**: DuckDuckGo Search API via `ddgs` Python package
- **Deployment**: Vercel with automatic Next.js and Python serverless function detection
- **Package Manager**: pnpm (based on pnpm-lock.yaml)

## Key Features
- Image search using DuckDuckGo Search API
- Single keyword and bulk keyword search support
- CORS-enabled API endpoints
- Modern Next.js 15 App Router architecture
- Tailwind CSS v4 with custom CSS variables for theming
- TypeScript with strict mode enabled