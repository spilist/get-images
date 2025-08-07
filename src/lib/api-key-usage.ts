// API Key Usage Monitoring Service
export interface ApiKeyUsage {
  apiKey: string
  planSearchesLeft: number
  thisMonthUsage: number
  totalSearchesLeft: number
  accountRateLimitPerHour: number
  isExhausted: boolean
  lastChecked: Date
  error?: string
}

class ApiKeyUsageCache {
  private cache = new Map<string, ApiKeyUsage>()
  private readonly CACHE_DURATION = 5 * 60 * 1000 // 5 minutes

  async getUsage(apiKey: string): Promise<ApiKeyUsage> {
    const cached = this.cache.get(apiKey)
    if (cached && Date.now() - cached.lastChecked.getTime() < this.CACHE_DURATION) {
      return cached
    }

    try {
      const response = await fetch(`https://serpapi.com/account.json?api_key=${apiKey}`)
      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch account info')
      }

      const usage: ApiKeyUsage = {
        apiKey,
        planSearchesLeft: data.plan_searches_left || 0,
        thisMonthUsage: data.this_month_usage || 0,
        totalSearchesLeft: data.total_searches_left || 0,
        accountRateLimitPerHour: data.account_rate_limit_per_hour || 0,
        isExhausted: (data.plan_searches_left || 0) <= 0,
        lastChecked: new Date()
      }

      this.cache.set(apiKey, usage)
      return usage
    } catch (error) {
      const usage: ApiKeyUsage = {
        apiKey,
        planSearchesLeft: 0,
        thisMonthUsage: 0,
        totalSearchesLeft: 0,
        accountRateLimitPerHour: 0,
        isExhausted: true,
        lastChecked: new Date(),
        error: error instanceof Error ? error.message : 'Unknown error'
      }

      this.cache.set(apiKey, usage)
      return usage
    }
  }

  getAllCachedUsage(): ApiKeyUsage[] {
    return Array.from(this.cache.values())
  }

  clearCache(): void {
    this.cache.clear()
  }
}

export const apiKeyUsageCache = new ApiKeyUsageCache()

// Function to get usage for all environment API keys
export async function getAllApiKeyUsage(): Promise<ApiKeyUsage[]> {
  const usages: ApiKeyUsage[] = []
  
  // Check SERPAPI_KEY
  if (process.env.SERPAPI_KEY) {
    const usage = await apiKeyUsageCache.getUsage(process.env.SERPAPI_KEY)
    usages.push(usage)
  }
  
  // Check SERPAPI_KEY2
  if (process.env.SERPAPI_KEY2) {
    const usage = await apiKeyUsageCache.getUsage(process.env.SERPAPI_KEY2)
    usages.push(usage)
  }
  
  return usages
}

// Function to get a valid API key (non-exhausted)
export async function getValidApiKey(): Promise<string | null> {
  const usages = await getAllApiKeyUsage()
  
  // Find first non-exhausted key
  const validUsage = usages.find(usage => !usage.isExhausted && !usage.error)
  
  return validUsage ? validUsage.apiKey : null
}