import json
import time
from ddgs import DDGS

def find_images_with_ddgs(query, max_results=3):
    """
    DDGS(DuckDuckGo Search) 패키지를 사용하여 이미지 검색
    """
    try:
        with DDGS() as ddgs:
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
                
                return {
                    'success': True,
                    'query': query,
                    'count': len(image_urls),
                    'images': image_urls
                }
            else:
                return {
                    'success': False,
                    'query': query,
                    'count': 0,
                    'error': f"'{query}'에 대한 이미지를 찾지 못했습니다.",
                    'images': []
                }
                
    except Exception as e:
        return {
            'success': False,
            'query': query,
            'count': 0,
            'error': f"'{query}' 검색 중 오류 발생: {str(e)}",
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
        time.sleep(1)  # 요청 간격 조절
    
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