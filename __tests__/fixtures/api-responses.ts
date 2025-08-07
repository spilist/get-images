// Mock API response fixtures for consistent testing

export const mockSerpAPIResponse = {
  success: {
    images_results: [
      {
        position: 1,
        thumbnail: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQsamgyetang1",
        source: "koreanfood.com",
        title: "삼계탕 - Traditional Korean Ginseng Chicken Soup",
        link: "https://koreanfood.com/samgyetang-1.jpg",
        original: "https://koreanfood.com/original/samgyetang-1.jpg",
        original_width: 1200,
        original_height: 800,
      },
      {
        position: 2,
        thumbnail: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQsamgyetang2",
        source: "recipe.co.kr",
        title: "집에서 만드는 삼계탕",
        link: "https://recipe.co.kr/samgyetang-2.jpg",
        original: "https://recipe.co.kr/original/samgyetang-2.jpg",
        original_width: 1024,
        original_height: 768,
      },
    ],
    search_metadata: {
      status: "Success",
      processed_at: "2024-01-15T10:30:00.000Z",
    },
  },
}

export const mockKoreanFoodKeywords = [
  '삼계탕', // Samgyetang (Ginseng Chicken Soup)
  '김치찌개', // Kimchi Jjigae (Kimchi Stew)
  '비빔밥', // Bibimbap (Mixed Rice)
  '불고기', // Bulgogi (Marinated Beef)
  '떡볶이', // Tteokbokki (Spicy Rice Cakes)
]

export const mockMultiKeywordResponse = {
  success: true,
  results: {
    '삼계탕': {
      keyword: '삼계탕',
      success: true,
      results: [
        {
          position: 1,
          thumbnail: "https://example.com/samgyetang-thumb1.jpg",
          source: "koreanfood.com",
          title: "삼계탕 - Traditional Korean Soup",
          link: "https://example.com/samgyetang1.jpg",
        },
      ],
      error: null,
      timestamp: "2024-01-15T10:30:00.000Z",
    },
    '김치찌개': {
      keyword: '김치찌개',
      success: true,
      results: [
        {
          position: 1,
          thumbnail: "https://example.com/kimchi-jjigae-thumb1.jpg",
          source: "koreanrecipe.com",
          title: "김치찌개 - Spicy Kimchi Stew",
          link: "https://example.com/kimchi-jjigae1.jpg",
        },
      ],
      error: null,
      timestamp: "2024-01-15T10:30:00.000Z",
    },
  },
  message: "Successfully searched for 2 keyword(s)",
}

export const mockErrorResponses = {
  exhaustedApiKey: {
    error: "You have reached your monthly search limit. Upgrade your plan or wait until next month.",
  },
  invalidApiKey: {
    error: "Invalid API key provided. Please check your API key and try again.",
  },
  rateLimited: {
    error: "Rate limit exceeded. Please wait before making another request.",
  },
  serverError: {
    error: "Internal server error. Please try again later.",
  },
  networkError: {
    error: "Network error. Please check your internet connection.",
  },
}

export const mockUsageResponses = {
  validKey: {
    success: true,
    data: {
      plan: "Free",
      searches_limit: 100,
      searches_used: 45,
      searches_remaining: 55,
      account_rate_limit_per_hour: 100,
    },
  },
  exhaustedKey: {
    success: true,
    data: {
      plan: "Free",
      searches_limit: 100,
      searches_used: 100,
      searches_remaining: 0,
      account_rate_limit_per_hour: 100,
    },
  },
  invalidKey: {
    success: false,
    error: "Invalid API key",
  },
}

export const mockApiKeyConfigs = {
  validUserKey: {
    apiKey: 'user-api-key-12345678',
    source: 'user' as const,
    isValid: true,
  },
  validEnvironmentKey: {
    apiKey: 'env-api-key-87654321',
    source: 'environment' as const,
    isValid: true,
  },
  invalidKey: {
    apiKey: 'invalid-key',
    source: 'user' as const,
    isValid: false,
  },
  exhaustedKey: {
    apiKey: 'exhausted-key-11111111',
    source: 'user' as const,
    isValid: false,
  },
}