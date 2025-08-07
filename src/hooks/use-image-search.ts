import { useState, useCallback } from "react";
import { MultipleKeywordsResponse, ApiKeyConfig } from "@/types/api";
import { SearchFilters } from "@/lib/serpapi.service";

interface UseImageSearchState {
  isLoading: boolean;
  error: string | null;
  results: MultipleKeywordsResponse | null;
}

interface UseImageSearchReturn extends UseImageSearchState {
  search: (keywords: string[], apiKeyConfig: ApiKeyConfig | null, searchFilters?: SearchFilters) => Promise<void>;
  runSampleSearch: () => Promise<void>;
  clearResults: () => void;
  currentSearchFilters: SearchFilters | null;
}

export function useImageSearch(): UseImageSearchReturn {
  const [state, setState] = useState<UseImageSearchState>({
    isLoading: false,
    error: null,
    results: null
  });
  const [currentSearchFilters, setCurrentSearchFilters] = useState<SearchFilters | null>(null);


  const generateSampleData = (): MultipleKeywordsResponse => {
    const sampleImages = {
      "삼계탕": [
        "https://broken-url-1.example.com/fake.jpg",
        "https://broken-url-2.example.com/fake.jpg", 
        "https://semie.cooking/image/post/recipe/vw/jh/oijlktse/html/110908259jiko.jpg",
        "https://recipe1.ezmember.co.kr/cache/recipe/2019/03/15/c8f9e0f2f1a2b3c4d5e6f7g8h9i0j1k2.jpg",
        "https://static.wtable.co.kr/image/production/service/recipe/1234/samgyetang.jpg"
      ],
      "추어탕": [
        "https://upload.wikimedia.org/wikipedia/commons/d/d8/Chueo-tang.jpg",
        "https://broken-url-3.example.com/fake.jpg",
        "https://recipe1.ezmember.co.kr/cache/recipe/2018/08/12/chueo_tang_recipe.jpg",
        "https://static.wtable.co.kr/image/production/service/recipe/5678/chueo-tang.jpg",
        "https://img.danawa.com/prod_img/500000/789/012/img/chueo_tang_bowl.jpg"
      ],
      "장어": [
        "https://broken-url-4.example.com/fake.jpg",
        "http://www.foodnmed.com/news/photo/202107/20316_6039_621.jpg",
        "https://recipe1.ezmember.co.kr/cache/recipe/2020/06/15/grilled_eel_dish.jpg",
        "https://static.wtable.co.kr/image/production/service/recipe/9012/jangeo-gui.jpg",
        "https://img.danawa.com/prod_img/500000/345/678/img/eel_kabayaki.jpg"
      ],
      "전복죽": [
        "https://recipe1.ezmember.co.kr/cache/recipe/2018/07/10/4258a33b05b7f1db4440cae38585fc851.jpg",
        "https://broken-url-5.example.com/fake.jpg",
        "https://static.wtable.co.kr/image/production/service/recipe/3456/jeonbok-juk.jpg",
        "https://img.danawa.com/prod_img/500000/901/234/img/abalone_porridge.jpg",
        "https://recipe.zenandcook.com/wp-content/uploads/2020/11/jeonbok-juk-abalone-porridge.jpg"
      ],
      "콩국수": [
        "https://broken-url-6.example.com/fake.jpg",
        "https://broken-url-7.example.com/fake.jpg",
        "https://broken-url-8.example.com/fake.jpg",
        "https://recipe1.ezmember.co.kr/cache/recipe/2020/07/07/282827708657fd643745ce78da6e3bd31.png",
        "https://static.wtable.co.kr/image/production/service/recipe/7890/kongguksu.jpg"
      ]
    };

    const results: Record<string, { success: boolean; query: string; count: number; images: { url: string; title: string; source: string; }[]; error?: string; }> = {};
    Object.entries(sampleImages).forEach(([keyword, urls]) => {
      results[keyword] = {
        success: true,
        query: keyword,
        count: urls.length,
        images: urls.map((url, index) => ({
          url,
          title: `${keyword} 요리법 ${index + 1}`,
          source: new URL(url).hostname
        })),
        error: undefined
      };
    });

    return {
      success: true,
      total_keywords: Object.keys(sampleImages).length,
      results
    };
  };

  const search = useCallback(async (keywords: string[], apiKeyConfig: ApiKeyConfig | null, searchFilters?: SearchFilters) => {
    if (keywords.length === 0) {
      setState(prev => ({ ...prev, error: "Please enter at least one keyword" }));
      return;
    }
    
    if (keywords.length > 10) {
      setState(prev => ({ ...prev, error: "Maximum 10 keywords allowed" }));
      return;
    }

    setState(prev => ({ ...prev, isLoading: true, error: null }));
    setCurrentSearchFilters(searchFilters || null);

    try {
      const requestBody: {
        keywords: string[];
        max_results_per_keyword: number;
        api_key?: string;
        filters?: SearchFilters;
      } = {
        keywords,
        max_results_per_keyword: 5
      };

      // Determine which API key to use based on config
      const apiKey = apiKeyConfig?.source === 'user' && apiKeyConfig.isValid ? apiKeyConfig.apiKey : undefined;
      if (apiKey) {
        requestBody.api_key = apiKey;
      }

      if (searchFilters) {
        requestBody.filters = searchFilters;
      }

      const response = await fetch("/api/scraper", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(requestBody)
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data: MultipleKeywordsResponse = await response.json();
      
      if (!data.success) {
        // Extract error message from API response if available
        const errorMessage = 'error' in data ? data.error : "Search failed";
        throw new Error(errorMessage || "Search failed");
      }

      setState({
        isLoading: false,
        error: null,
        results: data
      });
    } catch (err) {
      setState(prev => ({
        ...prev,
        isLoading: false,
        error: err instanceof Error ? err.message : "Search failed"
      }));
    }
  }, []);

  const runSampleSearch = useCallback(async () => {
    setState(prev => ({ ...prev, isLoading: true, error: null }));
    setCurrentSearchFilters(null);

    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1000));

    try {
      const data = generateSampleData();
      
      setState({
        isLoading: false,
        error: null,
        results: data
      });
    } catch (err) {
      setState(prev => ({
        ...prev,
        isLoading: false,
        error: err instanceof Error ? err.message : "Demo failed"
      }));
    }
  }, []);

  const clearResults = useCallback(() => {
    setState({
      isLoading: false,
      error: null,
      results: null
    });
    setCurrentSearchFilters(null);
  }, []);

  return {
    ...state,
    search,
    runSampleSearch,
    clearResults,
    currentSearchFilters
  };
}