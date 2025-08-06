# Image Scraper - Quick Multi-Source Image Search

A modern, intelligent web application that enables users to search and collect images from multiple sources with advanced features like automatic API key rotation, smart image validation, and dual search capabilities. Built with Next.js 15, TypeScript, and shadcn/ui components, featuring both web interface and CLI tools for comprehensive image discovery workflows.

*[한국어 버전 보기](README.ko.md)*

## 🤖 About This Project

This project was developed using AI coding agents with advanced semantic analysis capabilities. The implementation leverages two powerful Model Context Protocol (MCP) servers for enhanced development productivity:

- **[ShadCN UI v4 MCP](https://github.com/Jpisnice/shadcn-ui-mcp-server)** - Provides seamless integration with shadcn/ui component library, enabling rapid UI development with consistent design patterns. If you use Claude Code, you can use `@agent-shadcn-ui-builder` to modify the UI components.
- **[Serena MCP](https://github.com/oraios/serena)** - Advanced semantic code analysis and intelligent editing capabilities for TypeScript/JavaScript projects

### Learning More About These Tools

For developers interested in using Serena MCP effectively, we recommend this comprehensive guide: [Serena MCP 개요와 설치, Claude Code 통합](https://hansdev.kr/tech/serena-mcp/) - A detailed blog post explaining how to maximize productivity with Serena's semantic analysis features.

## ✨ Features

- **Multi-keyword Image Search**: Search for multiple keywords simultaneously
- **Dual API Support**: Web interface (SERPAPI) + CLI tool (DuckDuckGo)
- **Flexible API Key Management**: Use provided key or configure your own
- **Smart Image Validation**: Automatic fallback for broken images
- **Responsive Design**: Works on desktop and mobile devices
- **Export Functionality**: Copy results for external use

## 🚀 Quick Start

### Web Application

1. **Clone the repository**:
   ```bash
   git clone https://github.com/spilist/image-scraper.git
   cd image-scraper
   ```

2. **Install dependencies**:
   ```bash
   pnpm install
   ```

3. **Start immediately** (uses default SERPAPI key):
   ```bash
   pnpm dev
   ```

4. **Open your browser**: Visit [http://localhost:3000](http://localhost:3000)

Configure SERPAPI key for testing.

### CLI Script

For batch processing or offline usage:

1. **Install Python dependencies**:
   ```bash
   pip install -r requirements.txt
   ```

2. **Run the CLI script**:
   ```bash
   python scripts/scraper.py
   ```

The CLI uses DuckDuckGo search (no API key required).

## ⚙️ Configuration

### Using Your Own SERPAPI Key

Here's how to get your own API key:

1. **Sign up at SERPAPI**: Visit [https://serpapi.com/manage-api-key](https://serpapi.com/manage-api-key)
2. **Copy your API key**
3. **Configure in the app**: Use the settings UI to enter your key
4. **Or set environment variable**:
   ```bash
   SERPAPI_KEY=your_api_key_here pnpm dev
   ```

### Environment Variables

```bash
# Primary SERPAPI key (required for default functionality)
SERPAPI_KEY=your_primary_serpapi_key_here

# Secondary SERPAPI key (optional, enables automatic rotation)
SERPAPI_KEY2=your_secondary_serpapi_key_here
```

**API Key Rotation**: When both `SERPAPI_KEY` and `SERPAPI_KEY2` are configured, the application automatically rotates between them for load balancing and rate limit distribution. This helps prevent hitting API limits on a single key during heavy usage.

## 🛠️ Development

```bash
# Development server with hot reload
pnpm dev

# Build for production
pnpm build

# Start production server
pnpm start

# Lint code
pnpm lint
```

## 📁 Project Structure

```
image-scraper-web/
├── src/
│   ├── app/                 # Next.js App Router
│   │   ├── api/scraper/     # API endpoint (SERPAPI)
│   │   ├── page.tsx         # Main application page
│   │   └── layout.tsx       # Root layout
│   ├── components/ui/       # shadcn/ui components
│   ├── lib/                 # Utilities
│   └── types/               # TypeScript definitions
├── scripts/
│   └── scraper.py          # CLI script (DuckDuckGo)
├── requirements.txt        # Python dependencies
└── package.json           # Node.js dependencies
```

## 🔧 API Usage

### Web API Endpoint: `/api/scraper`

**Single keyword search**:
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

**Multiple keywords search**:
```javascript
const response = await fetch('/api/scraper', {
  method: 'POST',
  headers: { 
    'Content-Type': 'application/json',
    'X-API-Key': 'your_serpapi_key' // Optional: override default key
  },
  body: JSON.stringify({
    keywords: ["삼계탕", "김치찌개", "된장찌개"],
    max_keywords: 10,
    max_results_per_keyword: 3
  })
});
```

## 🚀 Deployment

### Vercel (Recommended)

1. **Connect your repository** to Vercel
2. **Set environment variable**:
   - `SERPAPI_KEY`: Your default SERPAPI key
3. **Deploy**: Automatic deployment on push

### Other Platforms

The app is a standard Next.js application and can be deployed on any platform supporting Node.js.

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature-name`
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📄 License

This project is open source and available under the [MIT License](LICENSE).

## ☕ Support This Project

If you find this project helpful, consider supporting its development:

**[☕ Buy me a coffee](https://coff.ee/steady.study.dev)**

Created by [배휘동](https://stdy.blog)

## 🆘 Help & Documentation

- **Issues**: Report bugs or request features via GitHub Issues
- **Documentation**: Check `CLAUDE.md` for development guidelines
- **API Documentation**: Visit [SERPAPI docs](https://serpapi.com/search-api) for API details
