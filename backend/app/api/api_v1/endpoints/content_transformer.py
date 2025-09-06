from fastapi import APIRouter, HTTPException, Depends, status
import logging
import google.generativeai as genai
from datetime import datetime
from app.core.config import settings
from app.core.mongodb import get_database
# Visual cues are text-based, no service needed
from app.schemas.content_transformer import (
    ContentTransformerRequest,
    ContentTransformerResponse,
    ContentTransformerError
)

logger = logging.getLogger(__name__)

router = APIRouter()

# Configure Google Generative AI
if settings.google_api_key:
    genai.configure(api_key=settings.google_api_key)
    model = genai.GenerativeModel('gemini-1.5-flash')
else:
    model = None
    logger.warning("Google API key not configured")

@router.post(
    "/transform",
    response_model=ContentTransformerResponse,
    status_code=status.HTTP_200_OK,
    summary="Transform Content",
    description="Transform content into storytelling, visual_cue, and summary modes based on domain and hobby.",
    responses={
        200: {
            "description": "Content transformed successfully",
            "model": ContentTransformerResponse
        },
        400: {
            "description": "Bad request - invalid input",
            "model": ContentTransformerError
        },
        500: {
            "description": "Internal server error"
        }
    }
)
async def transform_content(request: ContentTransformerRequest, db=Depends(get_database)):
    """
    Transform content based on the selected style, domain, and hobby, then save to database.
    
    - **assetCode**: Asset code identifier
    - **style**: Transformation style (storytelling, visual_cue, or summary)
    - **content**: Raw content to transform (lecture, case study, or concept)
    - **domain**: Domain context (e.g., Business, Engineering, Medicine, Education)
    - **hobby**: Hobby context (e.g., Movies, Cricket, Gaming, Music)
    
    Returns transformed content and saves it to the transformed-assets collection.
    """
    try:
        logger.info(f"Transforming content for assetCode: {request.assetCode}, style: {request.style}, domain: {request.domain}, hobby: {request.hobby}")
        
        if not model:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Google Generative AI not configured. Please check API key."
            )
        
        # Create style-specific prompts
        style_prompts = {
            "storytelling": """
### Storytelling Mode:
- Convert the given content into a short storytelling analogy.
- Make it relevant to the given domain and hobby.
- Use simple, engaging language.
- Create a narrative that helps explain the concept through a relatable story.
""",
          "visual_cue": """
### Visual Cue Mode:
- Convert the content into simple, symbolic visual representations (emoji flows, ASCII diagrams, metaphors).
- Focus on clarity, simplicity, and instant understanding at a glance.
- Provide 3–4 different cues for the same concept.
- Each visual cue must connect the concept to the user’s domain and hobby.
- Use emojis, arrows, or short symbolic flows instead of long text.
- Keep it fun, relatable, and visually intuitive.

Format your response as:
VISUAL CUE 1: [Emoji flow or diagram]
VISUAL CUE 2: [Emoji flow or diagram]
VISUAL CUE 3: [Emoji flow or diagram]
VISUAL CUE 4: [Optional extra if needed]
""",
            "summary": """
### Summary Mode:
- Generate a concise summary of the content.
- Keep it framed in the context of the given domain and hobby.
- Make it clear, informative, and easy to understand.
- Use analogies from the hobby to explain domain concepts.
"""
        }
        
        # Create the AI prompt based on selected style
        prompt = f"""You are an AI content transformer. 
You will receive four inputs:
1. Style (storytelling, visual_cue, or summary)
2. Content (raw lecture, case study, or concept)
3. Domain (e.g., Business, Engineering, Medicine, Education, etc.)
4. Hobby (e.g., Movies, Cricket, Gaming, Music, etc.)

Your task is to generate content in the specified style:

{style_prompts[request.style]}

### Examples for {request.style.title()} Mode:

**Content:** "Neural networks learn patterns from data."
**Domain:** Business
**Hobby:** Cricket

**Storytelling Mode Example:** 
"Imagine a cricket coach who studies thousands of player stats (data) to predict the best batting order. That's how neural networks learn patterns to make predictions."

**Visual Cue Mode Example:** 
VISUAL CUE 1: 🏏📊➡️🧠➡️🎯 (Cricket data → Neural Network → Target prediction)
VISUAL CUE 2: 📈📋➡️🤖➡️💼 (Business charts → AI brain → Better decisions)  
VISUAL CUE 3: Data ➡️ NN ➡️ Pattern ➡️ 🏆 (Linear flow to success)
VISUAL CUE 4: 🧠=🏏coach (Neural Network equals cricket coach analogy)

**Summary Mode Example:** 
"Neural networks are like a cricket coach for business — analyzing tons of data to spot patterns and make smarter predictions."

---

Now transform this content in {request.style} style:

**Style:** {request.style}
**Content:** "{request.content}"
**Domain:** {request.domain}
**Hobby:** {request.hobby}

Please provide ONLY the {request.style} output without any formatting or labels:"""

        # Generate response using Google Generative AI
        response = model.generate_content(prompt)
        
        if not response.text:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Failed to generate content transformation"
            )
        
        # Parse the response - since we asked for only the output, use it directly
        output = response.text.strip()
        
        # Clean up any unwanted formatting
        if output.startswith('"') and output.endswith('"'):
            output = output[1:-1]
        
        # Visual cues are text-based, no image generation needed
        visual_cue_data = None
        
        # Prepare data for insertion into assets collection
        # content field stores the generated content (not original)
        from bson import ObjectId
        
        # Convert assetCode to ObjectId if it's a valid ObjectId string
        try:
            code_as_objectid = ObjectId(request.assetCode)
        except Exception:
            # If not a valid ObjectId, keep as string
            code_as_objectid = request.assetCode
        
        asset_data = {
            "code": code_as_objectid,
            "content": output,  # Generated content goes in content field
            "style": request.style,
            "domain": request.domain,
            "hobby": request.hobby,
            "created_at": datetime.utcnow()
        }
        
        # Visual cues are text-based only, no image data to add
        
        # Insert into MongoDB assets collection only
        asset_result = await db["assets"].insert_one(asset_data)
        
        if not asset_result.inserted_id:
            logger.error("Failed to insert data into assets collection")
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Failed to save data to database"
            )
        
        logger.info(f"Successfully transformed and saved content for assetCode: {request.assetCode}, style: {request.style}")
        logger.info(f"Asset ID: {asset_result.inserted_id}")
        
        return ContentTransformerResponse(
            id=str(asset_result.inserted_id),
            assetCode=request.assetCode,
            style=request.style,
            output=output,
            original_content="",  # Not storing original content anymore
            domain=request.domain,
            hobby=request.hobby,
            created_at=asset_data["created_at"].isoformat()
        )
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error transforming content: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to transform content: {str(e)}"
        )

@router.get(
    "/get-or-generate",
    response_model=ContentTransformerResponse,
    summary="Get or Generate Transformed Content",
    description="Check if transformed content exists for the combination (assetCode, style, domain, hobby). If exists, return it; otherwise generate and save new content."
)
async def get_or_generate_content(
    assetCode: str,
    style: str,
    content: str,
    domain: str,
    hobby: str,
    db=Depends(get_database)
):
    """
    Get existing transformed content or generate new content if not found.
    
    - **assetCode**: Asset code identifier
    - **style**: Transformation style (storytelling, visual_cue, or summary)
    - **content**: Raw content to transform (used only if generating new content)
    - **domain**: Domain context
    - **hobby**: Hobby context
    
    Returns existing content if found, otherwise generates and saves new content.
    """
    try:
        logger.info(f"Checking for existing content: assetCode={assetCode}, style={style}, domain={domain}, hobby={hobby}")
        
        # Check if record already exists with the same combination
        from bson import ObjectId
        
        # Try to convert assetCode to ObjectId for search
        try:
            search_code = ObjectId(assetCode)
        except Exception:
            # If not a valid ObjectId, search as string
            search_code = assetCode
        
        existing_record = await db["transformed-assets"].find_one({
            "assetCode": search_code,
            "style": style,
            "domain": domain,
            "hobby": hobby
        })
        
        if existing_record:
            # Record exists, return it
            logger.info(f"Found existing record for assetCode: {assetCode}")
            existing_record["id"] = str(existing_record["_id"])
            del existing_record["_id"]
            
            return ContentTransformerResponse(
                id=existing_record["id"],
                assetCode=existing_record["assetCode"],
                style=existing_record["style"],
                output=existing_record["content"],
                original_content=existing_record["original_content"],
                domain=existing_record["domain"],
                hobby=existing_record["hobby"],
                created_at=existing_record["created_at"].isoformat()
            )
        
        # Record doesn't exist, generate new content
        logger.info(f"No existing record found, generating new content for assetCode: {assetCode}")
        
        if not model:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Google Generative AI not configured. Please check API key."
            )
        
        # Create style-specific prompts
        style_prompts = {
            "storytelling": """
### Storytelling Mode:
- Convert the given content into a short storytelling analogy.
- Make it relevant to the given domain and hobby.
- Use simple, engaging language.
- Create a narrative that helps explain the concept through a relatable story.
""",
            "visual_cue": """
### Visual Cue Mode:
- Convert the content into simple, symbolic visual representations (emoji flows, ASCII diagrams, metaphors).
- Focus on clarity, simplicity, and instant understanding at a glance.
- Provide 3–4 different cues for the same concept.
- Each visual cue must connect the concept to the user's domain and hobby.
- Use emojis, arrows, or short symbolic flows instead of long text.
- Keep it fun, relatable, and visually intuitive.

Format your response as:
VISUAL CUE 1: [Emoji flow or diagram]
VISUAL CUE 2: [Emoji flow or diagram]
VISUAL CUE 3: [Emoji flow or diagram]
VISUAL CUE 4: [Optional extra if needed]
""",
            "summary": """
### Summary Mode:
- Generate a concise summary of the content.
- Keep it framed in the context of the given domain and hobby.
- Make it clear, informative, and easy to understand.
- Use analogies from the hobby to explain domain concepts.
"""
        }
        
        # Create the AI prompt based on selected style
        prompt = f"""You are an AI content transformer. 
You will receive four inputs:
1. Style (storytelling, visual_cue, or summary)
2. Content (raw lecture, case study, or concept)
3. Domain (e.g., Business, Engineering, Medicine, Education, etc.)
4. Hobby (e.g., Movies, Cricket, Gaming, Music, etc.)

Your task is to generate content in the specified style:

{style_prompts.get(style, style_prompts["summary"])}

### Examples for {style.title()} Mode:

**Content:** "Neural networks learn patterns from data."
**Domain:** Business
**Hobby:** Cricket

**Storytelling Mode Example:** 
"Imagine a cricket coach who studies thousands of player stats (data) to predict the best batting order. That's how neural networks learn patterns to make predictions."

**Visual Cue Mode Example:** 
VISUAL CUE 1: 🏏📊➡️🧠➡️🎯 (Cricket data → Neural Network → Target prediction)
VISUAL CUE 2: 📈📋➡️🤖➡️💼 (Business charts → AI brain → Better decisions)  
VISUAL CUE 3: Data ➡️ NN ➡️ Pattern ➡️ 🏆 (Linear flow to success)
VISUAL CUE 4: 🧠=🏏coach (Neural Network equals cricket coach analogy)

**Summary Mode Example:** 
"Neural networks are like a cricket coach for business — analyzing tons of data to spot patterns and make smarter predictions."

---

Now transform this content in {style} style:

**Style:** {style}
**Content:** "{content}"
**Domain:** {domain}
**Hobby:** {hobby}

Please provide ONLY the {style} output without any formatting or labels:"""

        # Generate response using Google Generative AI
        response = model.generate_content(prompt)
        
        if not response.text:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Failed to generate content transformation"
            )
        
        # Parse the response
        output = response.text.strip()
        
        # Clean up any unwanted formatting
        if output.startswith('"') and output.endswith('"'):
            output = output[1:-1]
        
        # Prepare data for insertion into transformed-assets collection
        from bson import ObjectId
        
        # Convert assetCode to ObjectId if it's a valid ObjectId string
        try:
            code_as_objectid = ObjectId(assetCode)
        except Exception:
            # If not a valid ObjectId, keep as string
            code_as_objectid = assetCode
        
        transformed_asset = {
            "assetCode": code_as_objectid,
            "style": style,
            "content": output,
            "original_content": content,
            "domain": domain,
            "hobby": hobby,
            "created_at": datetime.utcnow()
        }
        
        # Insert into MongoDB transformed-assets collection
        result = await db["transformed-assets"].insert_one(transformed_asset)
        
        if not result.inserted_id:
            logger.error("Failed to insert transformed content into database")
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Failed to save transformed content to database"
            )
        
        logger.info(f"Successfully generated and saved new content for assetCode: {assetCode}")
        
        return ContentTransformerResponse(
            id=str(result.inserted_id),
            assetCode=assetCode,
            style=style,
            output=output,
            original_content=content,
            domain=domain,
            hobby=hobby,
            created_at=transformed_asset["created_at"].isoformat()
        )
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error in get_or_generate_content: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to get or generate content: {str(e)}"
        )

@router.get(
    "/assets/{asset_code}",
    summary="Get Transformed Assets by Asset Code",
    description="Retrieve all transformed assets for a specific asset code."
)
async def get_transformed_assets(asset_code: str, db=Depends(get_database)):
    """Get all transformed assets for a specific asset code"""
    try:
        logger.info(f"Fetching transformed assets for asset code: {asset_code}")
        
        # Find all transformed assets for the given asset code
        assets_cursor = db["transformed-assets"].find({"assetCode": asset_code})
        assets = await assets_cursor.to_list(length=None)
        
        # Convert MongoDB ObjectIds to strings
        for asset in assets:
            asset["id"] = str(asset["_id"])
            del asset["_id"]
            if "created_at" in asset and hasattr(asset["created_at"], 'isoformat'):
                asset["created_at"] = asset["created_at"].isoformat()
        
        logger.info(f"Found {len(assets)} transformed assets for asset code: {asset_code}")
        return {
            "assetCode": asset_code,
            "count": len(assets),
            "assets": assets
        }
        
    except Exception as e:
        logger.error(f"Error fetching transformed assets: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to fetch transformed assets: {str(e)}"
        )

@router.get(
    "/assets-collection",
    summary="Get All Assets from Assets Collection",
    description="Retrieve all assets from the assets collection."
)
async def get_all_assets(db=Depends(get_database)):
    """Get all assets from assets collection"""
    try:
        logger.info("Fetching all assets from assets collection")
        
        # Find all assets
        assets_cursor = db["assets"].find({})
        assets = await assets_cursor.to_list(length=None)
        
        # Convert MongoDB ObjectIds to strings and handle all fields properly
        for asset in assets:
            if "_id" in asset:
                asset["id"] = str(asset["_id"])
                del asset["_id"]
            if "created_at" in asset and hasattr(asset["created_at"], 'isoformat'):
                asset["created_at"] = asset["created_at"].isoformat()
            
            # Convert any ObjectId fields to strings
            for key, value in list(asset.items()):
                if hasattr(value, 'generation_time'):  # Check if it's an ObjectId
                    asset[key] = str(value)
        
        logger.info(f"Found {len(assets)} total assets")
        return {
            "count": len(assets),
            "assets": assets
        }
        
    except Exception as e:
        logger.error(f"Error fetching all assets: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to fetch assets: {str(e)}"
        )

@router.get(
    "/assets",
    summary="Get All Transformed Assets",
    description="Retrieve all transformed assets from the database."
)
async def get_all_transformed_assets(db=Depends(get_database)):
    """Get all transformed assets"""
    try:
        logger.info("Fetching all transformed assets")
        
        # Find all transformed assets
        assets_cursor = db["transformed-assets"].find({})
        assets = await assets_cursor.to_list(length=None)
        
        # Convert MongoDB ObjectIds to strings
        for asset in assets:
            asset["id"] = str(asset["_id"])
            del asset["_id"]
            if "created_at" in asset and hasattr(asset["created_at"], 'isoformat'):
                asset["created_at"] = asset["created_at"].isoformat()
        
        logger.info(f"Found {len(assets)} total transformed assets")
        return {
            "count": len(assets),
            "assets": assets
        }
        
    except Exception as e:
        logger.error(f"Error fetching all transformed assets: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to fetch transformed assets: {str(e)}"
        )


@router.get(
    "/health",
    summary="Content Transformer Health Check",
    description="Health check endpoint for the content transformer service."
)
async def health_check():
    """Health check for content transformer service"""
    try:
        api_status = "configured" if settings.google_api_key else "not configured"
        model_status = "available" if model else "unavailable"
        
        return {
            "status": "healthy",
            "service": "content_transformer",
            "google_api": api_status,
            "model": model_status
        }
    except Exception as e:
        logger.error(f"Health check failed: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Health check failed: {str(e)}"
        )
