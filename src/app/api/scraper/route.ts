import { NextRequest, NextResponse } from 'next/server'
import { searchMultipleKeywords, searchSingleKeyword } from '@/lib/serpapi.service'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    // Extract user API key from headers or body
    const userApiKey = request.headers.get('X-API-Key') || body.api_key || undefined
    
    // Handle single query
    if ('query' in body) {
      const { query, max_results = 3 } = body
      
      if (!query || typeof query !== 'string') {
        return NextResponse.json({
          success: false,
          error: 'Missing or invalid query parameter'
        }, { status: 400 })
      }

      const result = await searchSingleKeyword(query, max_results, userApiKey)
      
      return NextResponse.json(result, {
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'POST, OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type',
        },
      })
    }
    
    // Handle multiple keywords
    else if ('keywords' in body) {
      const { 
        keywords, 
        max_keywords = 10, 
        max_results_per_keyword = 3 
      } = body
      
      if (!Array.isArray(keywords) || keywords.length === 0) {
        return NextResponse.json({
          success: false,
          error: 'Keywords must be a non-empty array'
        }, { status: 400 })
      }

      const result = await searchMultipleKeywords(keywords, max_keywords, max_results_per_keyword, userApiKey)
      
      return NextResponse.json(result, {
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'POST, OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type',
        },
      })
    }
    
    else {
      return NextResponse.json({
        success: false,
        error: 'Missing required parameter: query or keywords'
      }, { status: 400 })
    }
    
  } catch (error) {
    console.error('API route error:', error)
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Internal server error'
    }, { status: 500 })
  }
}

export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  })
}