#!/usr/bin/env python3
"""
Simple Batch Translation Generator

This script generates translations for a predefined list of asset codes.
It uses the test-translate endpoint without requiring direct database access.
"""

import asyncio
import aiohttp
import json
from typing import List, Dict, Any
import time


class SimpleBatchTranslationGenerator:
    def __init__(self, base_url: str = "http://localhost:8000"):
        self.base_url = base_url
        self.translate_endpoint = f"{base_url}/test-translate"
        self.session = None
    
    async def __aenter__(self):
        self.session = aiohttp.ClientSession()
        return self
    
    async def __aexit__(self, exc_type, exc_val, exc_tb):
        if self.session:
            await self.session.close()
    
    def get_asset_codes(self) -> List[str]:
        """Get list of asset codes to translate"""
        # Add your asset codes here
        asset_codes = [
            "68bcb59df62246c87151d350",
            "68bc2ea817fa5a8d69dc67fc",
            # Add more asset codes as needed
        ]
        
        print(f"📋 Using {len(asset_codes)} predefined asset codes")
        return asset_codes
    
    async def translate_asset(self, asset_code: str, target_language: str) -> Dict[str, Any]:
        """Translate a single asset using the test-translate endpoint"""
        try:
            data = {
                'asset_code': asset_code,
                'target_language': target_language
            }
            
            async with self.session.post(
                self.translate_endpoint,
                data=data,
                headers={'Content-Type': 'application/x-www-form-urlencoded'}
            ) as response:
                result = await response.json()
                
                if response.status == 200:
                    return {
                        "success": True,
                        "asset_code": asset_code,
                        "target_language": target_language,
                        "translation": result
                    }
                else:
                    return {
                        "success": False,
                        "asset_code": asset_code,
                        "target_language": target_language,
                        "error": result.get("error", f"HTTP {response.status}")
                    }
                    
        except Exception as e:
            return {
                "success": False,
                "asset_code": asset_code,
                "target_language": target_language,
                "error": str(e)
            }
    
    async def generate_all_translations(self, delay_between_requests: float = 2.0):
        """Generate translations for all asset codes in both Hindi and Telugu"""
        print("🚀 Starting simple batch translation generation...")
        print(f"📡 Using endpoint: {self.translate_endpoint}")
        print(f"⏱️  Delay between requests: {delay_between_requests}s")
        print("-" * 60)
        
        # Get asset codes
        asset_codes = self.get_asset_codes()
        
        if not asset_codes:
            print("❌ No asset codes found. Exiting.")
            return
        
        # Target languages
        target_languages = ["hi", "te"]
        
        # Results tracking
        results = {
            "total_assets": len(asset_codes),
            "total_translations": len(asset_codes) * len(target_languages),
            "successful": 0,
            "failed": 0,
            "details": []
        }
        
        # Process each asset
        for i, asset_code in enumerate(asset_codes, 1):
            print(f"\n📝 Processing asset {i}/{len(asset_codes)}: {asset_code}")
            
            # Translate to each target language
            for target_lang in target_languages:
                print(f"  🔄 Translating to {target_lang.upper()}...")
                
                result = await self.translate_asset(asset_code, target_lang)
                results["details"].append(result)
                
                if result["success"]:
                    results["successful"] += 1
                    print(f"    ✅ Success: {target_lang.upper()} translation completed")
                else:
                    results["failed"] += 1
                    print(f"    ❌ Failed: {result['error']}")
                
                # Add delay between requests to avoid rate limiting
                if delay_between_requests > 0:
                    await asyncio.sleep(delay_between_requests)
        
        # Print summary
        print("\n" + "=" * 60)
        print("📊 BATCH TRANSLATION SUMMARY")
        print("=" * 60)
        print(f"Total Assets: {results['total_assets']}")
        print(f"Total Translations: {results['total_translations']}")
        print(f"Successful: {results['successful']} ✅")
        print(f"Failed: {results['failed']} ❌")
        print(f"Success Rate: {(results['successful'] / results['total_translations'] * 100):.1f}%")
        
        # Save detailed results to file
        timestamp = int(time.time())
        results_file = f"translation_results_simple_{timestamp}.json"
        
        with open(results_file, 'w', encoding='utf-8') as f:
            json.dump(results, f, indent=2, ensure_ascii=False)
        
        print(f"\n💾 Detailed results saved to: {results_file}")
        
        return results


async def main():
    """Main function to run the simple batch translation generator"""
    print("🌐 Adaptive Learning - Simple Batch Translation Generator")
    print("=" * 60)
    
    # Configuration
    base_url = "http://localhost:8000"
    delay_between_requests = 2.0  # 2 seconds delay to avoid rate limiting
    
    async with SimpleBatchTranslationGenerator(base_url) as generator:
        try:
            results = await generator.generate_all_translations(delay_between_requests)
            
            if results:
                print("\n🎉 Batch translation completed!")
            else:
                print("\n⚠️  Batch translation completed with issues.")
                
        except KeyboardInterrupt:
            print("\n⏹️  Batch translation interrupted by user.")
        except Exception as e:
            print(f"\n💥 Unexpected error: {e}")


if __name__ == "__main__":
    # Run the simple batch translation generator
    asyncio.run(main())
