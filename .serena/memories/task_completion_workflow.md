# Task Completion Workflow

## Required Steps After Code Changes
1. **Lint Check**: Run `npm run lint` to ensure code quality
2. **Build Test**: Run `npm run build` to verify the application builds successfully
3. **Type Check**: TypeScript compilation happens during build process

## Testing Workflow
1. **API Testing**: Run Python test scripts to verify API functionality
   - `python test_api_structure.py` - Test API structure
   - `python test_logic.py` - Test core logic
   - `node test-api.js` - Test API endpoints

2. **Development Testing**: Use `pnpm dev` to test changes locally

## Deployment Preparation
1. Ensure all tests pass
2. Verify build completes without errors
3. Check both Node.js and Python dependencies are up to date
4. Confirm `vercel.json` configuration is correct for serverless functions

## Code Quality Checklist
- [ ] ESLint passes without errors
- [ ] TypeScript compilation succeeds
- [ ] Python API functions work correctly
- [ ] Frontend-backend integration functions properly
- [ ] CORS configuration allows proper API access

## Notes
- No specific test framework is configured beyond the custom test scripts
- The project uses pnpm as the primary package manager
- Python serverless functions are deployed automatically via Vercel