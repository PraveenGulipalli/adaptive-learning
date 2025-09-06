#!/usr/bin/env python3
"""
Test script to verify MongoDB connection
"""
import os
import sys
from pymongo import MongoClient
from pymongo.errors import ConnectionFailure, ServerSelectionTimeoutError

def test_mongodb_connection():
    """Test MongoDB connection"""
    # Get connection string from environment or use default
    connection_string = os.getenv('DATABASE_URL', 'mongodb+srv://admin:admin@cluster0.8sxog.mongodb.net/?retryWrites=true&w=majority')
    
    print(f"Testing MongoDB connection...")
    print(f"Connection string: {connection_string[:50]}...")
    
    try:
        # Create client with timeout
        client = MongoClient(connection_string, serverSelectionTimeoutMS=5000)
        
        # Test the connection
        client.admin.command('ping')
        print("✅ MongoDB connection successful!")
        
        # Get database info
        db = client.adaptive_learning
        collections = db.list_collection_names()
        print(f"📊 Database: adaptive_learning")
        print(f"📁 Collections: {collections}")
        
        # Test a simple operation
        test_collection = db.test_collection
        result = test_collection.insert_one({"test": "connection", "status": "success"})
        print(f"✅ Test document inserted with ID: {result.inserted_id}")
        
        # Clean up test document
        test_collection.delete_one({"_id": result.inserted_id})
        print("✅ Test document cleaned up")
        
        client.close()
        return True
        
    except ServerSelectionTimeoutError:
        print("❌ MongoDB connection failed: Server selection timeout")
        print("   This usually means the server is not reachable or the connection string is incorrect")
        return False
    except ConnectionFailure as e:
        print(f"❌ MongoDB connection failed: {e}")
        return False
    except Exception as e:
        print(f"❌ Unexpected error: {e}")
        return False

if __name__ == "__main__":
    success = test_mongodb_connection()
    sys.exit(0 if success else 1)

