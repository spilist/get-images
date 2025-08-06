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

def handler(request):
    from http import HTTPStatus
    from urllib.parse import parse_qs
    import json as json_module
    
    # Handle CORS preflight requests
    if request.method == 'OPTIONS':
        return {
            'statusCode': 200,
            'headers': {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'POST, OPTIONS',
                'Access-Control-Allow-Headers': 'Content-Type'
            },
            'body': ''
        }
    
    if request.method != 'POST':
        return {
            'statusCode': 405,
            'headers': {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            },
            'body': json_module.dumps({
                'success': False,
                'error': 'Method not allowed'
            }, ensure_ascii=False)
        }
    
    try:
        # Parse request body
        if hasattr(request, 'get_json'):
            request_data = request.get_json()
        elif hasattr(request, 'json'):
            request_data = request.json
        else:
            body = request.body if hasattr(request, 'body') else request.data
            if isinstance(body, bytes):
                body = body.decode('utf-8')
            request_data = json_module.loads(body)
        
        # 단일 쿼리 처리
        if 'query' in request_data:
            query = request_data['query']
            max_results = request_data.get('max_results', 3)
            
            result = find_images_with_ddgs(query, max_results)
            
            return {
                'statusCode': 200,
                'headers': {
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Origin': '*'
                },
                'body': json_module.dumps(result, ensure_ascii=False, indent=2)
            }
            
        # 다중 키워드 처리
        elif 'keywords' in request_data:
            keywords = request_data['keywords']
            max_keywords = request_data.get('max_keywords', 10)
            max_results_per_keyword = request_data.get('max_results_per_keyword', 3)
            
            if not isinstance(keywords, list):
                raise ValueError("keywords must be a list")
            
            result = search_multiple_keywords(keywords, max_keywords, max_results_per_keyword)
            
            return {
                'statusCode': 200,
                'headers': {
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Origin': '*'
                },
                'body': json_module.dumps(result, ensure_ascii=False, indent=2)
            }
            
        else:
            # 잘못된 요청
            error_response = {
                'success': False,
                'error': 'Missing required parameter: query or keywords'
            }
            return {
                'statusCode': 400,
                'headers': {
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Origin': '*'
                },
                'body': json_module.dumps(error_response, ensure_ascii=False, indent=2)
            }
            
    except json_module.JSONDecodeError:
        error_response = {
            'success': False,
            'error': 'Invalid JSON in request body'
        }
        return {
            'statusCode': 400,
            'headers': {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            },
            'body': json_module.dumps(error_response, ensure_ascii=False, indent=2)
        }
        
    except Exception as e:
        error_response = {
            'success': False,
            'error': f'Internal server error: {str(e)}'
        }
        return {
            'statusCode': 500,
            'headers': {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            },
            'body': json_module.dumps(error_response, ensure_ascii=False, indent=2)
        }
            
    except json.JSONDecodeError:
        error_response = {
            'success': False,
            'error': 'Invalid JSON in request body'
        }
        return {
            'statusCode': 400,
            'headers': {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            },
            'body': json.dumps(error_response, ensure_ascii=False, indent=2)
        }
        
    except Exception as e:
        error_response = {
            'success': False,
            'error': f'Internal server error: {str(e)}'
        }
        return {
            'statusCode': 500,
            'headers': {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            },
            'body': json.dumps(error_response, ensure_ascii=False, indent=2)
        }