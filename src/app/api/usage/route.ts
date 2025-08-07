import { NextRequest, NextResponse } from 'next/server'
import { getAllApiKeyUsage, apiKeyUsageCache } from '@/lib/api-key-usage'
import { getStoredApiKey } from '@/lib/api-key-storage'

export async function GET(request: NextRequest) {
  try {
    // Get user API key if available
    const userApiKey = request.headers.get('X-API-Key') || getStoredApiKey()
    
    const usages = []
    
    // Check environment keys
    const envUsages = await getAllApiKeyUsage()
    for (const usage of envUsages) {
      // Mask the API key for security (show only last 4 characters)
      const maskedKey = `****${usage.apiKey.slice(-4)}`
      usages.push({
        ...usage,
        apiKey: maskedKey,
        keyType: 'environment'
      })
    }
    
    // Check user key if provided
    if (userApiKey && userApiKey !== process.env.SERPAPI_KEY && userApiKey !== process.env.SERPAPI_KEY2) {
      const userUsage = await apiKeyUsageCache.getUsage(userApiKey)
      const maskedUserKey = `****${userApiKey.slice(-4)}`
      usages.push({
        ...userUsage,
        apiKey: maskedUserKey,
        keyType: 'user'
      })
    }
    
    return NextResponse.json({
      success: true,
      usages
    })
  } catch (error) {
    console.error('API usage check error:', error)
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to check API usage'
    }, { status: 500 })
  }
}