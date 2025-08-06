import json
import time
import random
import os
import requests
from ddgs import DDGS
from fake_useragent import UserAgent

def get_realistic_headers():
    """Generate realistic browser headers to mimic human browsing"""
    try:
        # Try to get a random user agent
        ua = UserAgent()
        user_agent = ua.random
    except:
        # Fallback user agents
        user_agents = [
            'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
            'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
            'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
            'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:121.0) Gecko/20100101 Firefox/121.0',
            'Mozilla/5.0 (Macintosh; Intel Mac OS X 10.15; rv:121.0) Gecko/20100101 Firefox/121.0'
        ]
        user_agent = random.choice(user_agents)
    
    headers = {
        'User-Agent': user_agent,
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8',
        'Accept-Language': random.choice(['en-US,en;q=0.9', 'en-US,en;q=0.9,ko;q=0.8', 'en-GB,en;q=0.9']),
        'Accept-Encoding': 'gzip, deflate, br',
        'DNT': '1',
        'Connection': 'keep-alive',
        'Upgrade-Insecure-Requests': '1',
        'Sec-Fetch-Dest': 'document',
        'Sec-Fetch-Mode': 'navigate',
        'Sec-Fetch-Site': 'none',
        'Sec-Fetch-User': '?1',
        'Cache-Control': 'max-age=0'
    }
    
    return headers

def get_scraperapi_config():
    """Get ScraperAPI configuration from environment variables"""
    api_key = os.environ.get('SCRAPERAPI_KEY')
    if api_key:
        return {
            'api_key': api_key,
            'base_url': 'http://api.scraperapi.com'
        }
    return None

def get_proxy_config():
    """Get proxy configuration - first try ScraperAPI, then fallback to regular proxy"""
    # First try ScraperAPI
    scraperapi_config = get_scraperapi_config()
    if scraperapi_config:
        # Convert ScraperAPI to proxy format for DDGS
        proxy_url = f"http://scraperapi:{scraperapi_config['api_key']}@proxy-server.scraperapi.com:8001"
        return {
            'http': proxy_url,
            'https': proxy_url
        }
    
    # Fallback to regular proxy configuration
    proxy_urls = []
    proxy_vars = ['PROXY_URL', 'PROXY_URL_1', 'PROXY_URL_2', 'PROXY_URL_3']
    for var in proxy_vars:
        proxy_url = os.environ.get(var)
        if proxy_url:
            proxy_urls.append(proxy_url)
    
    if proxy_urls:
        selected_proxy = random.choice(proxy_urls)
        return {
            'http': selected_proxy,
            'https': selected_proxy
        }
    
    return None

def add_random_delay():
    """Add random delay to mimic human behavior"""
    delay = random.uniform(2.0, 5.0)
    time.sleep(delay)

def find_images_with_scraperapi(query, max_results=3):
    """Alternative method using ScraperAPI directly to scrape DuckDuckGo"""
    scraperapi_config = get_scraperapi_config()
    if not scraperapi_config:
        return None
    
    try:
        # Construct DuckDuckGo image search URL
        import urllib.parse
        encoded_query = urllib.parse.quote(query)
        ddg_url = f"https://duckduckgo.com/?q={encoded_query}&iar=images&iax=images&ia=images"
        
        # Use ScraperAPI to fetch the page
        payload = {
            'api_key': scraperapi_config['api_key'],
            'url': ddg_url,
            'render': 'true',  # Enable JavaScript rendering
            'country_code': 'us'
        }
        
        response = requests.get('https://api.scraperapi.com/', params=payload, timeout=30)
        
        if response.status_code == 200:
            # This would require HTML parsing to extract image URLs
            # For now, return success indicator
            return {
                'success': True,
                'method': 'scraperapi',
                'status_code': response.status_code,
                'content_length': len(response.text)
            }
        else:
            return None
            
    except Exception as e:
        print(f"ScraperAPI method failed: {str(e)}")
        return None

def find_images_with_ddgs(query, max_results=3):
    """
    DDGS(DuckDuckGo Search) 패키지를 사용하여 이미지 검색 with proxy and retry logic
    """
    # First try ScraperAPI if available
    if get_scraperapi_config():
        try:
            print("Attempting with ScraperAPI...")
            scraperapi_result = find_images_with_scraperapi(query, max_results)
            if scraperapi_result and scraperapi_result.get('success'):
                print("ScraperAPI method successful!")
                # For now, return a placeholder - would need HTML parsing to extract actual images
                return {
                    'success': True,
                    'query': query,
                    'count': 0,
                    'images': [],
                    'method': 'scraperapi',
                    'note': 'ScraperAPI working but HTML parsing needed'
                }
        except Exception as e:
            print(f"ScraperAPI attempt failed: {str(e)}")

    # Multiple attempt strategies with DDGS
    strategies = [
        # Strategy 1: With ScraperAPI proxy if available
        {'use_proxy': True, 'delay': True, 'proxy_type': 'scraperapi'},
        # Strategy 2: With regular proxy if available
        {'use_proxy': True, 'delay': True, 'proxy_type': 'regular'},
        # Strategy 3: Without proxy but with delay
        {'use_proxy': False, 'delay': True},
        # Strategy 4: Quick attempt without delay
        {'use_proxy': False, 'delay': False}
    ]
    
    for attempt, strategy in enumerate(strategies):
        try:
            print(f"Attempt {attempt + 1}: {'with proxy' if strategy['use_proxy'] else 'without proxy'}")
            
            if strategy['delay']:
                add_random_delay()
            
            # Configure DDGS
            ddgs_kwargs = {
                'timeout': 30,
                'verify': True
            }
            
            # Add proxy if strategy requires it and proxy is available
            if strategy['use_proxy']:
                proxy_config = get_proxy_config()
                if proxy_config:
                    proxy_url = proxy_config.get('https') or proxy_config.get('http')
                    if proxy_url:
                        ddgs_kwargs['proxy'] = proxy_url
                        print(f"Using proxy: {proxy_url[:20]}...")
                else:
                    print("No proxy available, skipping proxy strategy")
                    continue
            
            with DDGS(**ddgs_kwargs) as ddgs:
                # 이미지 검색
                results = list(ddgs.images(
                    query=query,
                    region="us-en",
                    safesearch="moderate",
                    max_results=max_results
                ))
            
                if results:
                    image_urls = []
                    for result in results:
                        image_url = result.get('image')
                        if image_url:
                            image_urls.append({
                                'url': image_url,
                                'title': result.get('title', ''),
                                'source': result.get('source', '')
                            })
                    
                    print(f"Success! Found {len(image_urls)} images")
                    return {
                        'success': True,
                        'query': query,
                        'count': len(image_urls),
                        'images': image_urls,
                        'attempt': attempt + 1
                    }
                else:
                    print(f"No results found in attempt {attempt + 1}")
                    # Continue to next strategy
                    continue
                    
        except Exception as e:
            print(f"Attempt {attempt + 1} failed: {str(e)}")
            # Continue to next strategy
            continue
    
    # If all strategies failed
    return {
        'success': False,
        'query': query,
        'count': 0,
        'error': f"'{query}' 검색 실패: 모든 시도가 실패했습니다. (IP 차단 가능성)",
        'images': []
    }

def search_multiple_keywords(keywords, max_keywords=10, max_results_per_keyword=3):
    """
    여러 키워드에 대해 이미지 검색 수행
    """
    if len(keywords) > max_keywords:
        keywords = keywords[:max_keywords]
    
    results = {}
    for keyword in keywords:
        result = find_images_with_ddgs(keyword, max_results_per_keyword)
        results[keyword] = result
        # No need for additional delay here since find_images_with_ddgs already includes delay
    
    return {
        'success': True,
        'total_keywords': len(keywords),
        'results': results
    }

from http.server import BaseHTTPRequestHandler

class handler(BaseHTTPRequestHandler):
    def do_POST(self):
        try:
            # Get request body
            content_length = int(self.headers.get('Content-Length', 0))
            if content_length > 0:
                post_data = self.rfile.read(content_length)
                request_data = json.loads(post_data.decode('utf-8'))
            else:
                request_data = {}
            
            # Handle single query
            if 'query' in request_data:
                query = request_data['query']
                max_results = request_data.get('max_results', 3)
                
                result = find_images_with_ddgs(query, max_results)
                
                self.send_response(200)
                self.send_header('Content-Type', 'application/json')
                self.send_header('Access-Control-Allow-Origin', '*')
                self.end_headers()
                
                response = json.dumps(result, ensure_ascii=False, indent=2)
                self.wfile.write(response.encode('utf-8'))
                
            # Handle multiple keywords
            elif 'keywords' in request_data:
                keywords = request_data['keywords']
                max_keywords = request_data.get('max_keywords', 10)
                max_results_per_keyword = request_data.get('max_results_per_keyword', 3)
                
                if not isinstance(keywords, list):
                    raise ValueError("keywords must be a list")
                
                result = search_multiple_keywords(keywords, max_keywords, max_results_per_keyword)
                
                self.send_response(200)
                self.send_header('Content-Type', 'application/json')
                self.send_header('Access-Control-Allow-Origin', '*')
                self.end_headers()
                
                response = json.dumps(result, ensure_ascii=False, indent=2)
                self.wfile.write(response.encode('utf-8'))
                
            else:
                # Bad request
                self.send_response(400)
                self.send_header('Content-Type', 'application/json')
                self.send_header('Access-Control-Allow-Origin', '*')
                self.end_headers()
                
                error_response = {
                    'success': False,
                    'error': 'Missing required parameter: query or keywords'
                }
                response = json.dumps(error_response, ensure_ascii=False, indent=2)
                self.wfile.write(response.encode('utf-8'))
                
        except json.JSONDecodeError:
            self.send_response(400)
            self.send_header('Content-Type', 'application/json')
            self.send_header('Access-Control-Allow-Origin', '*')
            self.end_headers()
            
            error_response = {
                'success': False,
                'error': 'Invalid JSON in request body'
            }
            response = json.dumps(error_response, ensure_ascii=False, indent=2)
            self.wfile.write(response.encode('utf-8'))
            
        except Exception as e:
            self.send_response(500)
            self.send_header('Content-Type', 'application/json')
            self.send_header('Access-Control-Allow-Origin', '*')
            self.end_headers()
            
            error_response = {
                'success': False,
                'error': f'Internal server error: {str(e)}'
            }
            response = json.dumps(error_response, ensure_ascii=False, indent=2)
            self.wfile.write(response.encode('utf-8'))

    def do_OPTIONS(self):
        # CORS preflight handling
        self.send_response(200)
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'POST, OPTIONS')
        self.send_header('Access-Control-Allow-Headers', 'Content-Type')
        self.end_headers()

if __name__ == "__main__":
    # 테스트용 키워드 목록
    test_keywords = [
        "삼계탕",
    ]
    
    print("=== DDGS 이미지 검색 테스트 ===")
    results = search_multiple_keywords(test_keywords)

    print("\n--- 최종 결과 (DDGS 이미지 링크) ---")
    if results:
        print(json.dumps(results, ensure_ascii=False, indent=2))
    else:
        print("결과를 찾지 못했습니다.")