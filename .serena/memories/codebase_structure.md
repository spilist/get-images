# Codebase Structure

## Directory Layout
```
├── api/
│   └── scraper.py          # Python serverless API function
├── src/
│   └── app/
│       ├── layout.tsx      # Root layout component
│       ├── page.tsx        # Homepage component
│       ├── globals.css     # Global styles with Tailwind
│       └── favicon.ico     # App icon
├── scripts/
│   └── scraper.py          # Legacy Python script (original implementation)
├── public/                 # Static assets
├── package.json           # Node.js dependencies and scripts
├── requirements.txt       # Python dependencies (ddgs)
├── vercel.json           # Vercel deployment config
├── tsconfig.json         # TypeScript configuration
├── eslint.config.mjs     # ESLint configuration
├── next.config.ts        # Next.js configuration
└── CLAUDE.md            # Project documentation
```

## Key Architecture
- **Hybrid Language**: TypeScript frontend + Python serverless backend
- **Next.js App Router**: Modern app directory structure
- **API Endpoints**: `/api/scraper` (Python serverless function)
- **Serverless Functions**: Configured for Python 3.9 runtime on Vercel