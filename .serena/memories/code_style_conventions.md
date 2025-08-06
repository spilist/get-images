# Code Style and Conventions

## TypeScript/React Conventions
- **File Extensions**: `.tsx` for React components, `.ts` for utilities
- **Component Style**: Function components with TypeScript
- **Naming**: PascalCase for components (e.g., `RootLayout`, `Home`)
- **Imports**: ES modules with explicit imports
- **TypeScript**: Strict mode enabled, proper typing required

## Code Formatting
- **ESLint**: Uses Next.js core-web-vitals and TypeScript configs
- **Style**: Standard Next.js/React formatting patterns
- **Imports**: Path aliases configured (`@/*` maps to `./src/*`)

## CSS/Styling
- **Framework**: Tailwind CSS v4 with inline theme configuration
- **CSS Variables**: Custom properties for colors and fonts
- **Dark Mode**: Automatic dark mode support via media queries
- **Fonts**: Geist Sans and Geist Mono (optimized loading)

## Python Conventions
- **API Functions**: Serverless function handlers
- **Error Handling**: Try-catch with descriptive error messages
- **Docstrings**: Korean language documentation in functions
- **Dependencies**: Minimal dependencies (only `ddgs` required)

## Project Patterns
- **API Design**: RESTful endpoints with JSON responses
- **Error Responses**: Consistent structure with `success`, `error` fields
- **CORS**: Enabled for frontend integration
- **Rate Limiting**: 1-second delays for bulk operations