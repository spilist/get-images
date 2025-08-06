# Image Scraper Web

A modern web application for searching and collecting images from multiple sources. Built with Next.js 15, TypeScript, and shadcn/ui components.

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
# Optional: Set your own default SERPAPI key
SERPAPI_KEY=your_serpapi_key_here
```

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

## 🆘 Support

- **Issues**: Report bugs or request features via GitHub Issues
- **Documentation**: Check `CLAUDE.md` for development guidelines
- **API Documentation**: Visit [SERPAPI docs](https://serpapi.com/search-api) for API details
