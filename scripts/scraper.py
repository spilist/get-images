import time
import os
from ddgs import DDGS

def find_images_with_ddgs(query, max_results=5):
    """
    Search for images using DDGS (DuckDuckGo Search) package
    """
    print(f"Starting image search for '{query}' (DDGS)...")
    
    try:
        with DDGS() as ddgs:
            # Image search
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
                
                print(f"'{query}' - Successfully extracted {len(image_urls)} URLs!")
                return image_urls
            else:
                print(f"No images found for '{query}'.")
                return []
                
    except Exception as e:
        print(f"Error occurred while searching '{query}': {e}")
        return []

def search_multiple_keywords(keywords, max_keywords=10):
    """
    Perform image search for multiple keywords
    """
    if len(keywords) > max_keywords:
        print(f"Number of keywords exceeds {max_keywords}. Processing only the first {max_keywords}.")
        keywords = keywords[:max_keywords]
    
    results = {}
    for keyword in keywords:
        images = find_images_with_ddgs(keyword)
        if images:
            results[keyword] = images
        time.sleep(1)  # Rate limiting
    
    return results

def read_keywords_from_file(file_path="keywords.txt"):
    """
    Read keywords list from keywords.txt file
    """
    # Get path to keywords.txt in the same directory as this script
    script_dir = os.path.dirname(os.path.abspath(__file__))
    keywords_file = os.path.join(script_dir, file_path)
    
    try:
        with open(keywords_file, 'r', encoding='utf-8') as f:
            keywords = [line.strip() for line in f if line.strip()]
        print(f"Read {len(keywords)} keywords from file: {keywords_file}")
        return keywords
    except FileNotFoundError:
        print(f"Error: Keywords file not found: {keywords_file}")
        print("Please create keywords.txt file with keywords (one per line)")
        return None
    except Exception as e:
        print(f"Error: Failed to read keywords file: {e}")
        return None

def print_disclaimer():
    """
    Print image usage disclaimer
    """
    print("=" * 80)
    print("IMPORTANT DISCLAIMER - IMAGE USAGE RESPONSIBILITY")
    print("=" * 80)
    print("⚠️  The image links provided by this tool are for reference purposes only.")
    print("⚠️  It is YOUR RESPONSIBILITY to verify:")
    print("   • Copyright permissions and licensing")
    print("   • Terms of use of the source websites")
    print("   • Whether images can be used outside their original context")
    print("   • Commercial usage rights (if applicable)")
    print()
    print("🔗 TECHNICAL LIMITATION - IMAGE LINK ACCESSIBILITY:")
    print("   • Many image links may NOT work outside the original website")
    print("   • Hotlinking protection may block external usage")
    print("   • ALWAYS TEST each link in your target environment")
    print("   • Download and host images yourself for reliable usage")
    print()
    print("📝 ALWAYS check with the original source before using any images!")
    print("📝 Consider using royalty-free or Creative Commons licensed images.")
    print("📝 When in doubt, contact the image owner for permission.")
    print("=" * 80)
    print()

if __name__ == "__main__":
    print("GetImages CLI - DuckDuckGo Image Search Tool")
    print("-" * 50)
    
    # Print disclaimer first
    print_disclaimer()
    
    # Read keywords from keywords.txt file
    keywords = read_keywords_from_file()
    
    if keywords is None:
        exit(1)
    
    if not keywords:
        print("Keywords file is empty. Please add keywords to keywords.txt.")
        exit(1)
    
    print(f"Starting image search for {len(keywords)} keywords.")
    print("Keywords:", keywords)
    print()
    
    results = search_multiple_keywords(keywords)

    print("\n--- FINAL RESULTS (DDGS Image Links) ---")
    if results:
        for keyword, images in results.items():
            print(f"✅ {keyword}: {len(images)} images")
            for i, url in enumerate(images, 1):
                print(f"  {i}. {url}")
        
        print(f"\n📊 Total: {sum(len(images) for images in results.values())} image links found")
        print("\n⚠️  REMINDER: Check image usage rights before using any of these links!")
        print("🔗 REMINDER: Test each link - many may not work outside their original website!")
    else:
        print("No results found.")