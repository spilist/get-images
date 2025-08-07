# Code Style and Conventions

## TypeScript/React Conventions
- **File Extensions**: `.tsx` for React components, `.ts` for utilities and services
- **Component Style**: Function components with TypeScript interfaces
- **Naming**: PascalCase for components (e.g., `SettingsDialog`, `SearchPanel`)
- **Hooks**: Custom hooks prefixed with `use` (e.g., `useImageSearch`, `useApiKey`)
- **Imports**: ES modules with path aliases (`@/*` maps to `./src/*`)
- **TypeScript**: Strict mode enabled, proper typing required

## Code Architecture Patterns
- **API Key Management**: Use `ApiKeyConfig` interface consistently
- **Hook Design**: Centralize business logic in hooks, keep UI components presentational
- **Error Handling**: Add patterns to `SERPAPI_ERROR_MAP` in `serpapi.service.ts`
- **State Management**: Use custom hooks for complex state (no external state management)

## API Design Conventions
- **Next.js API Routes**: Located in `src/app/api/` directory
- **Response Format**: Consistent JSON with `success`, `error`, and data fields
- **Error Handling**: Context-aware messages for user vs environment API keys
- **Caching**: Implement through `src/lib/cache.ts` utility

## Security Practices
- **API Keys**: Never log or expose keys in client-side code
- **Masking**: Show only last 8 characters of API keys in UI
- **Warnings**: Display XSS warnings for localStorage usage
- **Validation**: Validate API key formats before storage

## CSS/Styling Conventions
- **Framework**: shadcn/ui components with Tailwind CSS
- **Button Styling**: All buttons must have `cursor: pointer`
- **Component Library**: Use shadcn/ui components for consistency
- **Dark Mode**: Automatic support via Tailwind dark mode classes

## File Organization
```
src/
├── app/                    # Next.js App Router pages and API routes
├── components/             # React components (UI-focused)
├── hooks/                  # Custom hooks (business logic)
├── lib/                    # Utilities and services
└── types/                  # TypeScript type definitions
```

## Code Quality
- **ESLint**: Use Next.js recommended configuration
- **TypeScript**: Maintain strict typing, avoid `any` types
- **Comments**: Minimal comments, prefer self-documenting code
- **Error Messages**: User-friendly messages with actionable guidance