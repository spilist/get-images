# Task Completion Workflow

## Required Steps After Code Changes
1. **Lint Check**: Run `pnpm lint` to ensure code quality
2. **Build Test**: Run `pnpm build` to verify the application builds successfully  
3. **Type Check**: TypeScript compilation happens during build process
4. **Development Test**: Use `pnpm dev` to test changes locally

## Code Quality Checklist
- [ ] ESLint passes without errors or warnings
- [ ] TypeScript compilation succeeds
- [ ] API endpoints (`/api/scraper`, `/api/usage`) respond correctly
- [ ] Frontend-backend integration functions properly
- [ ] SERPAPI integration works with proper error handling
- [ ] API key management (environment and user keys) functions correctly
- [ ] Caching system operates as expected

## Testing Approach
**No formal test framework is configured.** Testing is done through:
1. **Manual API Testing**: Test endpoints directly or through frontend
2. **Browser Testing**: Use development server to verify UI functionality
3. **API Key Testing**: Verify both environment and user-provided keys work
4. **Error Handling**: Test various error scenarios (invalid keys, quota exceeded, etc.)

## Deployment Preparation
1. Ensure all lint and build checks pass
2. Verify SERPAPI_KEY environment variables are configured on Vercel
3. Test API key rotation if multiple keys are configured
4. Confirm caching system works correctly
5. Validate error handling for various API failure scenarios

## Architecture Validation
- [ ] `ApiKeyConfig` interface used consistently across components
- [ ] `useImageSearch` hook centralizes search logic properly
- [ ] `SERPAPI_ERROR_MAP` handles all error scenarios
- [ ] Cache system (`src/lib/cache.ts`) functions correctly
- [ ] API usage monitoring works for quota tracking

## Security Checklist
- [ ] XSS warnings displayed for localStorage API key usage
- [ ] API keys masked in UI displays
- [ ] Environment variables used for production deployments
- [ ] No API keys logged or exposed in client-side code