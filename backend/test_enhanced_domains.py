#!/usr/bin/env python3
"""
Test enhanced domain contexts and keywords functionality
"""
import requests
import json

def test_enhanced_domains():
    base_url = "http://localhost:8000/api/v1/content-transformer/transform"
    
    test_cases = [
        {
            "name": "engineering-student with gaming hobby",
            "data": {
                "assetCode": "ENG_GAMING_001",
                "style": "visual_cue", 
                "content": "Database normalization reduces data redundancy",
                "domain": "engineering-student",
                "hobby": "gaming",
                "keywords": "beginner-friendly, code-examples"
            }
        },
        {
            "name": "medical-student with movies hobby",
            "data": {
                "assetCode": "MED_MOVIES_001",
                "style": "storytelling",
                "content": "Blood pressure regulation in the cardiovascular system", 
                "domain": "medical-student",
                "hobby": "movies",
                "keywords": "case-study, patient-scenario"
            }
        },
        {
            "name": "business-student with cricket hobby",
            "data": {
                "assetCode": "BUS_CRICKET_001", 
                "style": "summary",
                "content": "Market segmentation strategies for target audience identification",
                "domain": "business-student", 
                "hobby": "cricket",
                "keywords": "practical-examples, real-world"
            }
        },
        {
            "name": "teacher-trainer with music hobby",
            "data": {
                "assetCode": "TEACH_MUSIC_001", 
                "style": "visual_cue",
                "content": "Active learning techniques in classroom management",
                "domain": "teacher-trainer",
                "hobby": "music",
                "keywords": "pedagogy-methods, interactive-learning"
            }
        },
        {
            "name": "working-professional with sports hobby",
            "data": {
                "assetCode": "WORK_SPORTS_001", 
                "style": "storytelling",
                "content": "Agile project management methodologies",
                "domain": "working-professional",
                "hobby": "sports",
                "keywords": "workplace-scenarios, team-management"
            }
        }
    ]
    
    print("🧪 Testing Enhanced Domain Contexts & Keywords")
    print("=" * 60)
    
    for i, test_case in enumerate(test_cases, 1):
        print(f"\n{i}️⃣ {test_case['name']}:")
        
        try:
            response = requests.post(base_url, json=test_case['data'], timeout=30)
            
            if response.status_code == 200:
                result = response.json()
                print(f"   ✅ Success!")
                print(f"   📊 Asset Code: {result['assetCode']}")
                print(f"   🎨 Style: {result['style']}")
                print(f"   🎯 Domain: {test_case['data']['domain']}")
                print(f"   🎮 Hobby: {test_case['data']['hobby']}")
                print(f"   🔑 Keywords: {test_case['data']['keywords']}")
                print(f"   📝 Output Preview: {result['output'][:100]}...")
            else:
                print(f"   ❌ Error: {response.status_code}")
                try:
                    error_detail = response.json()
                    print(f"   💬 Detail: {error_detail.get('detail', 'Unknown error')}")
                except:
                    print(f"   💬 Response: {response.text[:200]}...")
                    
        except requests.exceptions.Timeout:
            print(f"   ⏱️ Request timed out (30s)")
        except Exception as e:
            print(f"   ❌ Exception: {str(e)}")
    
    print("\n" + "=" * 60)
    print("🎯 Enhanced domain context testing completed!")

if __name__ == "__main__":
    test_enhanced_domains()
