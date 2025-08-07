# Codebase Structure

## Directory Layout
```
├── src/
│   ├── app/
│   │   ├── api/
│   │   │   ├── scraper/route.ts    # Main SERPAPI image search endpoint
│   │   │   └── usage/route.ts      # API key usage monitoring endpoint
│   │   ├── layout.tsx              # Root layout component
│   │   ├── page.tsx                # Main application page
│   │   └── globals.css             # Global styles with Tailwind
│   ├── components/
│   │   ├── ui/                     # shadcn/ui components
│   │   ├── settings-dialog.tsx     # API key configuration dialog
│   │   ├── search-panel.tsx        # Search interface
│   │   ├── image-results-display.tsx # Results display
│   │   └── search-history-trigger.tsx # Search history
│   ├── hooks/
│   │   ├── use-image-search.ts     # Centralized search logic & API key handling
│   │   ├── use-api-key.ts          # API key configuration management
│   │   ├── use-image-selection.ts  # Image selection state
│   │   └── use-search-history.ts   # Search history management
│   ├── lib/
│   │   ├── serpapi.service.ts      # SERPAPI integration & error handling
│   │   ├── cache.ts                # In-memory caching system
│   │   ├── api-key-storage.ts      # API key localStorage management
│   │   └── api-key-usage.ts        # Usage monitoring integration
│   └── types/
│       └── api.ts                  # TypeScript interfaces
├── scripts/
│   └── scraper.py                  # CLI script using DuckDuckGo (alternative)
├── requirements.txt                # Python dependencies for CLI
└── CLAUDE.md                      # Development documentation
```

## Key Architecture
- **Frontend**: Next.js 15 with TypeScript and shadcn/ui components
- **API Routes**: Next.js API routes (`/api/scraper`, `/api/usage`)
- **Image Search**: SERPAPI (Google Images) for web app, DuckDuckGo for CLI
- **Caching**: In-memory cache system for performance optimization
- **API Key Management**: Type-safe handling with environment and user keys
- **State Management**: Custom hooks for centralized business logic