#!/usr/bin/env python3
"""
Simple test script to verify the core scraper logic works
Run: python test_logic.py
"""

import sys
import os

# Add the scripts directory to path to import the original functions
sys.path.append(os.path.join(os.path.dirname(__file__), 'scripts'))

try:
    from scraper import find_images_with_ddgs, search_multiple_keywords
    
    print("Testing single query...")
    result = find_images_with_ddgs("삼계탕", max_results=2)
    print(f"Single query result: {len(result) if result else 0} images found")
    
    print("\nTesting multiple keywords...")
    results = search_multiple_keywords(["삼계탕", "장어구이"], max_keywords=2)
    print(f"Multiple keywords result: {len(results)} keywords processed")
    
    print("\n✅ Core logic test completed successfully!")
    
except ImportError as e:
    print(f"❌ Import error: {e}")
    print("Make sure you have 'ddgs' package installed: pip install ddgs")
except Exception as e:
    print(f"❌ Test failed: {e}")