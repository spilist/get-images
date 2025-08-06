import time
from ddgs import DDGS

def find_images_with_ddgs(query, max_results=3):
    """
    DDGS(DuckDuckGo Search) 패키지를 사용하여 이미지 검색
    """
    print(f"'{query}' 이미지 검색 시작 (DDGS)...")
    
    try:
        with DDGS() as ddgs:
            # 이미지 검색 (3개 결과)
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
                        image_urls.append(image_url)
                
                print(f"'{query}' - {len(image_urls)}개 URL 추출 성공!")
                return image_urls
            else:
                print(f"'{query}'에 대한 이미지를 찾지 못했습니다.")
                return []
                
    except Exception as e:
        print(f"'{query}' 검색 중 오류 발생: {e}")
        return []

def search_multiple_keywords(keywords, max_keywords=10):
    """
    여러 키워드에 대해 이미지 검색 수행
    """
    if len(keywords) > max_keywords:
        print(f"키워드 개수가 {max_keywords}개를 초과했습니다. 처음 {max_keywords}개만 처리합니다.")
        keywords = keywords[:max_keywords]
    
    results = {}
    for keyword in keywords:
        images = find_images_with_ddgs(keyword)
        if images:
            results[keyword] = images
        time.sleep(1)  # 요청 간격 조절
    
    return results

if __name__ == "__main__":
    # 테스트용 키워드 목록
    test_keywords = [
        "삼계탕",
        "장어구이",
        "추어탕",
        "전복죽",
        "콩국수",
        "민어회",
    ]
    
    print("=== DDGS 이미지 검색 테스트 ===")
    results = search_multiple_keywords(test_keywords)

    print("\n--- 최종 결과 (DDGS 이미지 링크) ---")
    if results:
        for keyword, images in results.items():
            print(f"✅ {keyword}: {len(images)}개 이미지")
            for i, url in enumerate(images, 1):
                print(f"  {i}. {url}")
    else:
        print("결과를 찾지 못했습니다.")
