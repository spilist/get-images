# GetImages - Multi-Source Image Search Tool

A modern, intelligent web application for searching and collecting images from multiple sources. Features advanced capabilities like API key rotation, smart caching, and dual search options for comprehensive image discovery workflows.

🌐 **Live Demo**: [get-images.effectiveai.io](https://get-images.effectiveai.io)  
📚 *[한국어 버전 보기](README.ko.md)*

---

## ✨ Key Features

- **Multi-keyword Search**: Search multiple terms simultaneously
- **Dual API Support**: Web interface (SERPAPI) + CLI tool (DuckDuckGo)  
- **Smart Caching**: 24-hour cache system reduces costs and improves speed
- **Flexible API Keys**: Use default keys or configure your own
- **Responsive Design**: Optimized for desktop and mobile
- **Export Functionality**: Easy copy/export of results

---

## 🚀 Quick Start

### Option 1: Web Application (Recommended)

```bash
# Clone and install
git clone https://github.com/spilist/get-images.git
cd get-images
pnpm install

# Start development server (uses default SERPAPI key)
pnpm dev

# Open http://localhost:3000
```

### Option 2: CLI Script (No API Key Required)

```bash
# Install Python dependencies
pip install -r requirements.txt

# Modify scripts/keywords.txt as you want

# Run CLI script
python scripts/scraper.py
```

> **⚠️ IMPORTANT**: The CLI script will display a disclaimer about image usage rights. It is your responsibility to verify copyright permissions and licensing before using any images found through this tool. Additionally, many image links may not work outside their original websites due to hotlinking protection - always test each link in your target environment.

---

## ⚙️ Configuration

### SERPAPI Setup (Web Interface)

1. **Get API Key**: Sign up at [serpapi.com/manage-api-key](https://serpapi.com/manage-api-key)
2. **Configure in App**: Use settings UI to enter your key
3. **Or Set Environment Variables**:
   ```bash
   SERPAPI_KEY=your_primary_key_here
   SERPAPI_KEY2=your_secondary_key_here  # Optional: enables auto-rotation
   ```

**API Key Rotation**: Configure multiple keys for automatic load balancing and rate limit distribution.

---

## ⚡ Performance Features

### Intelligent Caching System

Our advanced caching system delivers significant performance improvements:

| Feature | Benefit |
|---------|---------|
| **Instant Results** | Cached searches return in <10ms |
| **Cost Savings** | Eliminates duplicate API calls |
| **Rate Limit Protection** | Reduces API usage |
| **Smart Keys** | Considers query + result count + API key |

**Example**: Popular searches like "김치찌개" load instantly after first search!

---

## 🛠️ Development

```bash
# Development with hot reload
pnpm dev

# Production build
pnpm build

# Production server
pnpm start

# Code linting
pnpm lint
```

### Project Structure

```
get-images/
├── src/
│   ├── app/                 # Next.js App Router
│   │   ├── api/scraper/     # API endpoint (SERPAPI)
│   │   └── page.tsx         # Main application
│   ├── components/ui/       # shadcn/ui components
│   ├── lib/                 # Utilities & caching
│   └── hooks/               # React hooks
├── scripts/
│   └── scraper.py          # CLI script (DuckDuckGo)
└── requirements.txt        # Python dependencies
```

---

## 🔧 API Usage

### Web API Endpoint: `/api/scraper`

**Single keyword search:**
```javascript
const response = await fetch('/api/scraper', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    query: "삼계탕",
    max_results: 5
  })
});
```

**Multiple keywords search:**
```javascript
const response = await fetch('/api/scraper', {
  method: 'POST',
  headers: { 
    'Content-Type': 'application/json',
    'X-API-Key': 'your_serpapi_key' // Optional override
  },
  body: JSON.stringify({
    keywords: ["삼계탕", "김치찌개", "된장찌개"],
    max_keywords: 10,
    max_results_per_keyword: 3
  })
});
```

---

## 🚀 Deployment

### Vercel (Recommended)

1. Connect repository to Vercel
2. Set environment variables:
   - `SERPAPI_KEY`: Your default SERPAPI key
   - `SERPAPI_KEY2`: Optional secondary key
3. Deploy automatically on push

### Other Platforms

Standard Next.js application - compatible with any Node.js hosting platform.

---

## 🤖 AI Development

This project leverages advanced AI coding agents with semantic analysis:

- **[ShadCN UI v4 MCP](https://github.com/Jpisnice/shadcn-ui-mcp-server)** - Rapid UI development with consistent design patterns
- **[Serena MCP](https://github.com/oraios/serena)** - Advanced semantic code analysis for TypeScript/JavaScript

**Learn More**: [Serena MCP Guide](https://hansdev.kr/tech/serena-mcp/) - Comprehensive blog post on maximizing productivity with semantic analysis.

---

## ⚠️ Image Usage Disclaimer

**IMPORTANT**: This tool provides image links for reference purposes only. Users are responsible for:

- ✅ **Copyright Verification**: Check image licensing and permissions
- ✅ **Source Terms**: Review terms of use from original websites  
- ✅ **Usage Rights**: Verify if images can be used outside their original context
- ✅ **Commercial Use**: Ensure proper licensing for commercial applications

### 🔗 Technical Limitations

**Image Link Accessibility**: Many image links may NOT work when used outside their original websites due to:
- **Hotlinking Protection**: Websites block direct image access from external domains
- **Referrer Checks**: Images may only load when accessed from the source website
- **Authentication Requirements**: Some images require login or special access

**Solution**: Always test each image link in your target environment. For reliable usage, download and host images yourself rather than using direct links.

**Best Practices**:
- Always contact image owners when in doubt
- Consider using Creative Commons or royalty-free images
- Attribute sources when required
- Keep records of usage permissions

This tool does not grant any rights to use the images found. All copyright and intellectual property rights remain with their respective owners.

---

## 🤝 Contributing

1. Fork the repository
2. Create feature branch: `git checkout -b feature-name`  
3. Make changes and test thoroughly
4. Submit pull request

---

## 📄 License

Open source under the [MIT License](LICENSE).

---

## 💝 Support

Find this project helpful? Consider supporting its development:

**[☕ Buy me a coffee](https://coff.ee/steady.study.dev)**

Created by [배휘동](https://stdy.blog)

---

## 📚 Resources

- **Issues & Features**: [GitHub Issues](https://github.com/spilist/get-images/issues)
- **Development Guide**: Check `CLAUDE.md` for guidelines  
- **API Documentation**: [SERPAPI Docs](https://serpapi.com/search-api)