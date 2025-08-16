# GetImages - Multi-Source Image Search Tool

A modern, intelligent web application for searching and collecting images from multiple sources. Features advanced capabilities like API key rotation, smart caching, and dual search options for comprehensive image discovery workflows.

🌐 **Live Demo**: [get-images.effectiveai.io](https://get-images.effectiveai.io)  
📚 *[한국어 버전 보기](README.ko.md)*

---

## ✨ Key Features

- **Multi-keyword Search**: Search multiple terms simultaneously
- **Dual API Support**: Web interface (SERPAPI) + CLI tool (DuckDuckGo)  
- **Smart Caching**: 24-hour cache system reduces costs and improves speed
- **API Usage Monitoring**: Real-time tracking with automatic exhausted key exclusion
- **Flexible API Keys**: Use default keys or configure your own
- **Responsive Design**: Optimized for desktop and mobile
- **Export Functionality**: Easy copy/export of results
- **Internationalization**: Full support for Korean and English languages

## 🚀 Quick Start

### Web Application (Recommended)

```bash
# Clone and install
git clone https://github.com/spilist/get-images.git
cd get-images
pnpm install

# Start development server (uses default SERPAPI key)
pnpm dev

# Open http://localhost:3000
```

### CLI Script (No API Key Required)

```bash
# Install Python dependencies
pip install -r requirements.txt

# Modify scripts/keywords.txt as you want

# Run CLI script
python scripts/scraper.py
```

> **⚠️ IMPORTANT**: The CLI script will display a disclaimer about image usage rights. It is your responsibility to verify copyright permissions and licensing before using any images found through this tool. Additionally, many image links may not work outside their original websites due to hotlinking protection - always test each link in your target environment.

## ⚙️ Configuration

### SERPAPI Setup

1. **Get API Key**: Sign up at [serpapi.com/manage-api-key](https://serpapi.com/manage-api-key)
2. **Configure in App**: Use settings UI to enter your key
3. **Or Set Environment Variables**:
   ```bash
   SERPAPI_KEY=your_primary_key_here
   SERPAPI_KEY2=your_secondary_key_here  # Optional: enables auto-rotation
   ```

**API Key Rotation**: Configure multiple keys for automatic load balancing and rate limit distribution.

#### 🔐 API Key Security

**Browser Storage**: When configuring your API key through Settings:
- Keys stored in browser `localStorage` for convenience
- ⚠️ **Security Notice**: Vulnerable to XSS attacks on compromised websites
- **Recommendations**: Use environment variables for production deployments
- **Best Practice**: Avoid using on untrusted computers or shared sessions

### API Key Usage Monitoring

GetImages automatically monitors your API key usage and intelligently manages key rotation:

| Feature | Benefit |
|---------|---------|
| **Real-time Usage Tracking** | Monitor monthly searches left, usage, and limits |
| **Automatic Key Exclusion** | Exhausted keys are automatically skipped |
| **Smart Rotation** | Only uses keys with remaining credits |
| **Usage Dashboard** | View detailed usage statistics in Settings |

**How it works**:
- Checks SERPAPI account status every 5 minutes
- Automatically excludes keys with 0 searches remaining
- Displays usage information in Settings → API Key Usage
- Prevents failed requests from exhausted keys

### Search Engine Options

GetImages supports two search engine modes, each optimized for different use cases:

| Engine | Speed | Image Quality | Use Case |
|--------|-------|---------------|----------|
| **Google Images Light** | ⚡ Fast | 📱 Thumbnails | Quick preview, content discovery |
| **Google Images Full** (Default) | 🐌 Slower | 🖼️ Full Resolution | Production use, high-quality needs |

**Configuration**: Change engine in Settings → Search Options → Search Engine

### Analytics Configuration (Optional)

GetImages supports web analytics integration for user behavior tracking:

```bash
# Google Analytics
NEXT_PUBLIC_GA_ID=G-XXXXXXXXXX  # Your Google Analytics 4 Measurement ID

# Microsoft Clarity
NEXT_PUBLIC_CLARITY_PROJECT_ID=xxxxxxxxx  # Your Clarity Project ID
```

**Analytics Features**:
- **Google Analytics 4**: Page views, user engagement, and conversion tracking
- **Microsoft Clarity**: Heatmaps, session recordings, and user behavior insights
- **Privacy-Friendly**: Only loads when environment variables are configured
- **Production-Ready**: Optimized loading strategies using Next.js Script component

**Setup Instructions**:
1. **Google Analytics**: Get your Measurement ID from [Google Analytics](https://analytics.google.com/)
2. **Microsoft Clarity**: Get your Project ID from [Clarity Dashboard](https://clarity.microsoft.com/)
3. Add the respective environment variables to your `.env.local` file
4. Analytics will automatically start tracking once configured

### Internationalization (i18n)

GetImages provides full internationalization support with seamless language switching:

| Feature | Description |
|---------|-------------|
| **Supported Languages** | English, Korean (한국어) |
| **Language Switcher** | Available in Settings → Interface → Display Language |
| **Preference Persistence** | Language preference saved (localStorage + cookie) |
| **Complete Coverage** | All UI elements, messages, and content translated |

**Implementation Details**:
- **Framework**: Built with [react-i18next](https://react.i18next.com/) following [Next.js App Router best practices](https://www.locize.com/blog/i18n-next-app-router)
- **Architecture**: Namespace-based organization for maintainable translations
- **Persistence**: Language preference stored in cookies across sessions
- **Extensible**: Easy to add new languages - simply add locale files and update configuration

**Adding New Languages**:
1. Create translation files in `src/i18n/locales/[lang]/`
2. Add language code to `languages` array in `src/i18n/settings.ts`
3. Update language switcher options in `src/components/language-switcher.tsx`

### Advanced Filter Options

For detailed information about image filters (licenses, sizes, types, etc.), visit:
[SERPAPI Google Images API Documentation](https://serpapi.com/google-images-api)

## 🛡️ Architecture

### Project Structure

```
get-images/
├── src/
│   ├── app/                 # Next.js App Router
│   │   ├── api/scraper/     # API endpoint (SERPAPI)
│   │   └── page.tsx         # Main application
│   ├── components/ui/       # shadcn/ui components
│   ├── lib/                 # Core utilities
│   │   ├── serpapi.service.ts  # Data-driven error handling & API management
│   │   ├── cache.ts         # Intelligent caching system
│   │   └── api-key-storage.ts  # Secure API key management
│   ├── hooks/               # React hooks with centralized logic
│   │   └── use-image-search.ts # Centralized API key handling
│   └── types/               # TypeScript definitions
├── __tests__/               # Comprehensive test suite
│   ├── hooks/              # Hook unit tests
│   ├── lib/                # Service layer tests  
│   ├── pages/api/          # API route tests
│   └── setup/              # Test utilities and configuration
├── scripts/
│   └── scraper.py          # CLI script (DuckDuckGo)
└── requirements.txt        # Python dependencies
```

### Core Features

**⚡ Intelligent Caching System**

Our advanced caching system delivers significant performance improvements:

| Feature | Benefit |
|---------|---------|
| **Instant Results** | Cached searches return in <10ms |
| **Cost Savings** | Eliminates duplicate API calls |
| **Rate Limit Protection** | Reduces API usage |
| **Smart Keys** | Considers query + result count + API key |

**Example**: Popular searches like "김치찌개" load instantly after first search!

**🔧 Type-Safe API Key Management**:
- Consistent key handling through `ApiKeyConfig` interface
- Centralized logic in `useImageSearch` hook
- Support for both environment and user-provided keys

**🛠️ Intelligent Error Handling**:
- Pattern-based error mapping in `SERPAPI_ERROR_MAP`
- Context-aware error messages for different scenarios
- Graceful fallback for various API failure conditions

**📊 Smart Key Selection**:
- Usage-based validation prioritizes functional keys
- Automatic exclusion of exhausted keys
- Real-time monitoring of key status and quotas

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

# Testing
pnpm test          # Run all tests
pnpm test:watch    # Run tests in watch mode
pnpm test:coverage # Run tests with coverage report
pnpm test:ci       # Run tests for CI
```

### Testing Infrastructure

GetImages includes a comprehensive testing infrastructure built with **Jest**, **React Testing Library**, and **MSW** for reliable code quality and user workflow validation.

**Testing Framework**:
- **Jest 30+** with Next.js 15 and TypeScript support
- **React Testing Library** for component and hook testing
- **MSW (Mock Service Worker)** for SERPAPI response mocking
- **140+ test cases** covering critical user workflows

**Test Coverage**:

| Component | Coverage Focus |
|-----------|----------------|
| **Hook Tests** | Image search, API key management, search history |
| **Service Tests** | SERPAPI integration, caching, error handling |
| **API Tests** | Search endpoints, usage monitoring |
| **Integration Tests** | End-to-end user workflows |

**Running Tests**:

```bash
# Run all tests
pnpm test

# Run tests in watch mode (development)
pnpm test:watch

# Generate coverage report
pnpm test:coverage

# Run tests for CI/CD
pnpm test:ci
```

**Test Architecture**:

```
__tests__/
├── hooks/          # Core functionality testing
├── lib/            # Service layer validation  
├── pages/api/      # API endpoint testing
├── setup/          # Test utilities and MSW configuration
└── fixtures/       # Mock data and realistic test scenarios
```

**Key Testing Features**:
- **Realistic Data**: Uses Korean food keywords (삼계탕, 김치찌개) for authentic testing
- **API Mocking**: Complete SERPAPI response simulation with MSW
- **Error Scenarios**: Tests API exhaustion, rate limiting, and invalid keys
- **TypeScript Safety**: Full type checking in all test files
- **CI Integration**: Automated testing with coverage reporting

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

## 🚀 Deployment

### Vercel (Recommended)

1. Connect repository to Vercel
2. Set environment variables:
   - `SERPAPI_KEY`: Your default SERPAPI key
   - `SERPAPI_KEY2`: Optional secondary key
   - `NEXT_PUBLIC_GA_ID`: Optional Google Analytics tracking ID
   - `NEXT_PUBLIC_CLARITY_PROJECT_ID`: Optional Microsoft Clarity project ID
3. Deploy automatically on push

### Other Platforms

Standard Next.js application - compatible with any Node.js hosting platform.

## 🤖 AI Development

This project leverages advanced AI coding agents with semantic analysis:

- **[ShadCN UI v4 MCP](https://github.com/Jpisnice/shadcn-ui-mcp-server)** - Rapid UI development with consistent design patterns
- **[Serena MCP](https://github.com/oraios/serena)** - Advanced semantic code analysis for TypeScript/JavaScript

**Learn More**: [Serena MCP Guide](https://hansdev.kr/tech/serena-mcp/) - Comprehensive blog post on maximizing productivity with semantic analysis.

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

## 🤝 Contributing

1. Fork the repository
2. Create feature branch: `git checkout -b feature-name`  
3. Make changes and test thoroughly
4. Submit pull request

## 💝 Support

Find this project helpful? Consider supporting its development:

**[☕ Buy me a coffee](https://coff.ee/steady.study.dev)**

Created by [배휘동](https://stdy.blog)

## 📄 License

Open source under the [MIT License](LICENSE).