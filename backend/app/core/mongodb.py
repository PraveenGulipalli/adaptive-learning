from motor.motor_asyncio import AsyncIOMotorClient
from pymongo import MongoClient
from urllib.parse import urlparse, parse_qs
from .config import settings
import logging
import os

logger = logging.getLogger(__name__)

class MongoDB:
    client: AsyncIOMotorClient = None
    database = None

mongodb = MongoDB()

def get_database_name_from_url(connection_string):
    """Extract database name from MongoDB connection string"""
    try:
        # Handle different MongoDB URI formats
        if 'mongodb+srv://' in connection_string or 'mongodb://' in connection_string:
            # Parse the connection string
            parsed = urlparse(connection_string)
            # Get database name from path (remove leading slash)
            db_name = parsed.path[1:] if parsed.path else 'adaptive_learning'
            # If no database in path, check query parameters (common in Railway)
            if not db_name and parsed.query:
                query = parse_qs(parsed.query)
                db_name = query.get('authSource', ['adaptive_learning'])[0]
            return db_name or 'adaptive_learning'
        return 'adaptive_learning'
    except Exception as e:
        logger.warning(f"Could not parse database name from URL, using default: {e}")
        return 'adaptive_learning'

async def connect_to_mongo():
    """Create database connection with enhanced error handling"""
    try:
        # Get connection string from environment or settings
        connection_string = os.getenv('DATABASE_URL', settings.database_url)
        
        # Log the connection attempt (without credentials)
        safe_url = connection_string.split('@')[-1] if '@' in connection_string else connection_string
        logger.info(f"Attempting to connect to MongoDB at {safe_url}")
        
        # Connect to MongoDB
        mongodb.client = AsyncIOMotorClient(
            connection_string,
            serverSelectionTimeoutMS=5000,  # 5 second timeout
            connectTimeoutMS=10000,         # 10 second connect timeout
            socketTimeoutMS=45000,           # 45 second socket timeout
            maxPoolSize=10,                 # Maximum number of connections
            minPoolSize=1                   # Minimum number of connections
        )
        
        # Test the connection with a ping
        await mongodb.client.admin.command('ping')
        
        # Get database name
        db_name = get_database_name_from_url(connection_string)
        mongodb.database = mongodb.client[db_name]
        
        logger.info(f"✅ Successfully connected to MongoDB database: {db_name}")
        return mongodb.database
        
    except Exception as e:
        error_msg = f"❌ Failed to connect to MongoDB: {str(e)}"
        logger.error(error_msg)
        # Don't raise the exception, allow the app to start in degraded mode
        return None

async def close_mongo_connection():
    """Close database connection"""
    if mongodb.client:
        mongodb.client.close()
        logger.info("Disconnected from MongoDB")

def get_database():
    """Get database instance"""
    return mongodb.database

# Synchronous client for testing
def get_sync_client():
    """Get synchronous MongoDB client for testing"""
    return MongoClient(settings.database_url)

def test_mongodb_connection():
    """Test MongoDB connection synchronously"""
    try:
        client = get_sync_client()
        # Test the connection
        client.admin.command('ping')
        logger.info("MongoDB connection test successful")
        client.close()
        return True
    except Exception as e:
        logger.error(f"MongoDB connection test failed: {e}")
        return False

