#!/usr/bin/env python3
"""
Database-based Batch Translation Generator

This script directly queries the database for English assets and generates translations.
"""

import asyncio
import aiohttp
import json
import sys
import os
from typing import List, Dict, Any
import time

# Add the app directory to the Python path
sys.path.append(os.path.join(os.path.dirname(__file__), 'app'))

from app.core.mongodb import get_database


class DatabaseBatchTranslationGenerator:
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
        
        # Close database connection
        try:
            from app.core.mongodb import close_mongo_connection
            await close_mongo_connection()
        except:
            pass
    
    async def get_all_english_assets_from_db(self) -> List[Dict[str, Any]]:
        """Get all assets with language 'en' directly from the database"""
        try:
            print("📋 Fetching all English assets from database...")
            
            # Initialize database connection
            from app.core.mongodb import connect_to_mongo
            db = await connect_to_mongo()
            
            if db is None:
                print("❌ Database connection failed")
                return []
            
            # Query for all English assets
            cursor = db.assets.find({"language": "en"})
            assets = await cursor.to_list(length=None)
            
            # Also check for legacy assets without language field
            cursor_legacy = db.assets.find({
                "$or": [
                    {"language": {"$exists": False}},
                    {"language": None}
                ]
            })
            legacy_assets = await cursor_legacy.to_list(length=None)
            
            # Combine both results
            all_assets = assets + legacy_assets
            
            # Remove duplicates based on code
            unique_assets = {}
            for asset in all_assets:
                code = str(asset.get("code", ""))
                if code and code not in unique_assets:
                    unique_assets[code] = {
                        "code": code,
                        "name": asset.get("name", "Unknown"),
                        "content": asset.get("content", ""),
                        "language": asset.get("language", "en")
                    }
            
            assets_list = list(unique_assets.values())
            print(f"✅ Found {len(assets_list)} unique English assets")
            
            return assets_list
            
        except Exception as e:
            print(f"❌ Error fetching English assets from database: {e}")
            return []
    
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
        """Generate translations for all English assets in both Hindi and Telugu"""
        print("🚀 Starting database-based batch translation generation...")
        print(f"📡 Using endpoint: {self.translate_endpoint}")
        print(f"⏱️  Delay between requests: {delay_between_requests}s")
        print("-" * 60)
        
        # Get all English assets from database
        assets = await self.get_all_english_assets_from_db()
        
        if not assets:
            print("❌ No English assets found in database. Exiting.")
            return
        
        # Target languages
        target_languages = ["hi", "te"]
        
        # Results tracking
        results = {
            "total_assets": len(assets),
            "total_translations": len(assets) * len(target_languages),
            "successful": 0,
            "failed": 0,
            "details": []
        }
        
        # Process each asset
        for i, asset in enumerate(assets, 1):
            asset_code = asset["code"]
            asset_name = asset.get("name", "Unknown")
            content_preview = asset.get("content", "")[:50] + "..." if len(asset.get("content", "")) > 50 else asset.get("content", "")
            
            print(f"\n📝 Processing asset {i}/{len(assets)}: {asset_name}")
            print(f"   Code: {asset_code}")
            print(f"   Content: {content_preview}")
            
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
        results_file = f"translation_results_db_{timestamp}.json"
        
        with open(results_file, 'w', encoding='utf-8') as f:
            json.dump(results, f, indent=2, ensure_ascii=False)
        
        print(f"\n💾 Detailed results saved to: {results_file}")
        
        return results


async def main():
    """Main function to run the database-based batch translation generator"""
    print("🌐 Adaptive Learning - Database Batch Translation Generator")
    print("=" * 60)
    
    # Configuration
    base_url = "http://localhost:8000"
    delay_between_requests = 2.0  # 2 seconds delay to avoid rate limiting
    
    async with DatabaseBatchTranslationGenerator(base_url) as generator:
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
    # Run the database-based batch translation generator
    asyncio.run(main())
