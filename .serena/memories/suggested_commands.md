# Suggested Commands

## Development Commands
**Note: This project uses pnpm as the preferred package manager.**

```bash
# Install dependencies
pnpm install

# Start development server with Turbopack
pnpm dev

# Build for production
pnpm build

# Start production server
pnpm start

# Lint the codebase
pnpm lint
```

## Testing Commands
```bash
# No specific test framework configured
# Manual testing via development server and API endpoints

# Test API endpoints manually
curl -X POST http://localhost:3000/api/scraper \
  -H "Content-Type: application/json" \
  -d '{"query": "test", "max_results": 5}'

curl http://localhost:3000/api/usage
```

## CLI Script (Alternative)
```bash
# Install Python dependencies
pip install -r requirements.txt

# Run CLI script (uses DuckDuckGo, no API key needed)
python scripts/scraper.py
```

## Environment Setup
```bash
# Set SERPAPI keys (get from https://serpapi.com/manage-api-key)
export SERPAPI_KEY=your_primary_key_here
export SERPAPI_KEY2=your_secondary_key_here  # Optional for rotation

# Create .env.local for development
echo "SERPAPI_KEY=your_key_here" > .env.local
```

## System Commands
```bash
# File operations
ls -la                    # List files with details
find . -name "*.ts"       # Find TypeScript files
grep -r "pattern" src/    # Search in source directory

# Git operations
git status               # Check repository status
git add .                # Stage all changes
git commit -m "message"  # Commit changes
git push                 # Push to remote
```