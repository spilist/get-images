# Image Scraper API Documentation

## Overview
This API provides image search functionality using DuckDuckGo Search, converted from the original Python scraper script into a Vercel serverless function.

## Endpoint
```
POST /api/scraper
```

## Request Format

### Single Query Search
```json
{
  "query": "삼계탕",
  "max_results": 3
}
```

### Multiple Keywords Search
```json
{
  "keywords": ["삼계탕", "장어구이", "추어탕"],
  "max_keywords": 10,
  "max_results_per_keyword": 3
}
```

## Response Format

### Single Query Response
```json
{
  "success": true,
  "query": "삼계탕",
  "count": 3,
  "images": [
    {
      "url": "https://example.com/image1.jpg",
      "title": "Image Title",
      "source": "example.com"
    },
    ...
  ]
}
```

### Multiple Keywords Response
```json
{
  "success": true,
  "total_keywords": 3,
  "results": {
    "삼계탕": {
      "success": true,
      "query": "삼계탕",
      "count": 2,
      "images": [...]
    },
    "장어구이": {
      "success": true,
      "query": "장어구이",
      "count": 3,
      "images": [...]
    }
  }
}
```

### Error Response
```json
{
  "success": false,
  "error": "Error message description"
}
```

## Usage Examples

### Using fetch() in JavaScript
```javascript
// Single query
const response = await fetch('/api/scraper', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    query: '삼계탕',
    max_results: 3
  })
});
const result = await response.json();
```

### Using curl
```bash
# Single query
curl -X POST https://your-vercel-domain.vercel.app/api/scraper \
  -H "Content-Type: application/json" \
  -d '{"query": "삼계탕", "max_results": 3}'

# Multiple keywords
curl -X POST https://your-vercel-domain.vercel.app/api/scraper \
  -H "Content-Type: application/json" \
  -d '{"keywords": ["삼계탕", "장어구이"], "max_results_per_keyword": 2}'
```

## Deployment

1. Install Vercel CLI: `npm install -g vercel`
2. Deploy: `vercel --prod`
3. The API will be available at `https://your-project.vercel.app/api/scraper`

## Rate Limiting
The API includes a 1-second delay between requests when processing multiple keywords to respect DuckDuckGo's rate limits.