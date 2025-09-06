"""
Quiz service for generating and managing quizzes based on course content.
"""

import logging
from typing import List, Optional, Dict, Any, Tuple
from datetime import datetime
from bson import ObjectId
from motor.motor_asyncio import AsyncIOMotorDatabase

from app.models.quiz import Quiz, QuizAttempt
from app.schemas.quiz import QuizCreate, QuizUpdate, QuizGenerationRequest, CourseModuleInfo
from app.services.llm_service import llm_service, LLMRequest, ResultType, LLMProvider
import json

logger = logging.getLogger(__name__)


class QuizService:
    """Service for quiz operations and generation."""
    
    def __init__(self):
        self.llm_service = llm_service
    
    # CRUD Operations
    async def create_quiz(self, db: AsyncIOMotorDatabase, quiz_data: QuizCreate) -> Quiz:
        """Create a new quiz in MongoDB."""
        try:
            # Calculate total questions
            total_questions = len(quiz_data.questions)
            
            # Convert questions to dictionaries for MongoDB storage
            questions_dict = []
            for question in quiz_data.questions:
                if hasattr(question, 'dict'):
                    questions_dict.append(question.dict())
                else:
                    questions_dict.append(question)
            
            # Create quiz document
            quiz_doc = {
                "_id": ObjectId(),
                "course_id": quiz_data.course_id,
                "module_code": quiz_data.module_code,
                "title": quiz_data.title,
                "description": quiz_data.description,
                "difficulty": quiz_data.difficulty,
                "questions": questions_dict,
                "total_questions": total_questions,
                "estimated_time_minutes": quiz_data.estimated_time_minutes,
                "is_active": True,
                "generated_by_ai": True,
                "created_at": datetime.utcnow(),
                "updated_at": datetime.utcnow()
            }
            
            # Insert into MongoDB
            result = await db.quizzes.insert_one(quiz_doc)
            quiz_doc["_id"] = result.inserted_id
            
            # Create Quiz instance
            quiz = Quiz.from_mongo_dict(quiz_doc)
            
            logger.info(f"Created quiz: {quiz.id} for course: {quiz.course_id}")
            return quiz
            
        except Exception as e:
            logger.error(f"Error creating quiz: {e}")
            raise
    
    async def get_quiz(self, db: AsyncIOMotorDatabase, quiz_id: str) -> Optional[Quiz]:
        """Get quiz by ID from MongoDB."""
        try:
            quiz_doc = await db.quizzes.find_one({"_id": ObjectId(quiz_id)})
            if quiz_doc:
                return Quiz.from_mongo_dict(quiz_doc)
            return None
        except Exception as e:
            logger.error(f"Error getting quiz {quiz_id}: {e}")
            return None
    
    async def get_quizzes_by_course(self, db: AsyncIOMotorDatabase, course_id: str, module_code: Optional[str] = None) -> List[Quiz]:
        """Get all quizzes for a course, optionally filtered by module code."""
        try:
            query = {"course_id": course_id, "is_active": True}
            
            if module_code:
                query["module_code"] = module_code
            
            quiz_docs = []
            async for doc in db.quizzes.find(query).sort("created_at", -1):
                quiz_docs.append(doc)
            
            return [Quiz.from_mongo_dict(doc) for doc in quiz_docs]
        except Exception as e:
            logger.error(f"Error getting quizzes for course {course_id}: {e}")
            return []
    
    async def update_quiz(self, db: AsyncIOMotorDatabase, quiz_id: str, quiz_update: QuizUpdate) -> Optional[Quiz]:
        """Update an existing quiz in MongoDB."""
        try:
            update_data = quiz_update.dict(exclude_unset=True)
            
            # Update total_questions if questions are updated
            if 'questions' in update_data:
                # Convert questions to dictionaries if they're Pydantic objects
                questions_dict = []
                for question in update_data['questions']:
                    if hasattr(question, 'dict'):
                        questions_dict.append(question.dict())
                    else:
                        questions_dict.append(question)
                update_data['questions'] = questions_dict
                update_data['total_questions'] = len(questions_dict)
            
            # Add updated timestamp
            update_data['updated_at'] = datetime.utcnow()
            
            # Update in MongoDB
            result = await db.quizzes.update_one(
                {"_id": ObjectId(quiz_id)},
                {"$set": update_data}
            )
            
            if result.matched_count == 0:
                return None
            
            # Return updated quiz
            updated_quiz = await self.get_quiz(db, quiz_id)
            logger.info(f"Updated quiz: {quiz_id}")
            return updated_quiz
            
        except Exception as e:
            logger.error(f"Error updating quiz {quiz_id}: {e}")
            raise
    
    async def delete_quiz(self, db: AsyncIOMotorDatabase, quiz_id: str) -> bool:
        """Soft delete a quiz in MongoDB."""
        try:
            result = await db.quizzes.update_one(
                {"_id": ObjectId(quiz_id)},
                {"$set": {"is_active": False, "updated_at": datetime.utcnow()}}
            )
            
            if result.matched_count == 0:
                return False
            
            logger.info(f"Deleted quiz: {quiz_id}")
            return True
            
        except Exception as e:
            logger.error(f"Error deleting quiz {quiz_id}: {e}")
            raise
    
    # Quiz Generation Methods
    async def generate_quiz_for_module(
        self, 
        db: AsyncIOMotorDatabase, 
        course_id: str, 
        module_code: str, 
        module_content: str,
        module_title: str,
        num_questions: int = 5,
        difficulty: str = "medium"
    ) -> Optional[Quiz]:
        """Generate a quiz for a specific module."""
        try:
            # Prepare content for LLM
            content = f"Module: {module_title}\n\nContent:\n{module_content}"
            
            # Create LLM request
            llm_request = LLMRequest(
                content=content,
                result_type=ResultType.QUIZ_MCQ,
                additional_params={
                    "num_questions": num_questions,
                    "difficulty": difficulty,
                    "num_options": 4
                },
                provider=LLMProvider.GOOGLE,
                max_tokens=2000,
                temperature=0.7
            )
            
            # Generate quiz using LLM
            response = await self.llm_service.generate_content(llm_request)
            
            if not response.success:
                logger.error(f"LLM generation failed: {response.error_message}")
                return None
            
            # Extract quiz data
            quiz_data = response.result
            if isinstance(quiz_data, dict) and 'questions' in quiz_data:
                # Create quiz
                quiz_create = QuizCreate(
                    course_id=course_id,
                    module_code=module_code,
                    title=quiz_data.get('title', f"Quiz: {module_title}"),
                    description=f"Auto-generated quiz for module: {module_title}",
                    difficulty=difficulty,
                    questions=quiz_data['questions'],
                    estimated_time_minutes=len(quiz_data['questions']) * 2  # 2 minutes per question
                )
                
                return await self.create_quiz(db, quiz_create)
            else:
                logger.error(f"Invalid quiz format received from LLM: {quiz_data}")
                return None
                
        except Exception as e:
            logger.error(f"Error generating quiz for module {module_code}: {e}")
            return None
    
    async def generate_quizzes_for_course(
        self, 
        db: AsyncIOMotorDatabase, 
        request: QuizGenerationRequest
    ) -> Dict[str, Any]:
        """Generate quizzes for a course with module-wise logic."""
        try:
            result = {
                "success": True,
                "message": "",
                "generated_quizzes": [],
                "skipped_modules": [],
                "errors": []
            }
            
            # Get course and module information
            course_info = await self.get_course_modules_info(db, request.course_id, request.module_code)
            
            if not course_info:
                result["success"] = False
                result["message"] = "Course or module not found"
                return result
            
            # If specific module is provided
            if request.module_code:
                return await self._generate_quiz_for_single_module(
                    db, request, course_info[0], result
                )
            
            # Generate for all modules in the course
            return await self._generate_quizzes_for_all_modules(
                db, request, course_info, result
            )
            
        except Exception as e:
            logger.error(f"Error in generate_quizzes_for_course: {e}")
            return {
                "success": False,
                "message": f"Error generating quizzes: {str(e)}",
                "generated_quizzes": [],
                "skipped_modules": [],
                "errors": [str(e)]
            }
    
    async def _generate_quiz_for_single_module(
        self, 
        db: AsyncIOMotorDatabase, 
        request: QuizGenerationRequest, 
        module_info: CourseModuleInfo, 
        result: Dict[str, Any]
    ) -> Dict[str, Any]:
        """Generate quiz for a single module."""
        try:
            # Check if quiz already exists
            existing_quiz = await self.get_quizzes_by_course(
                db, request.course_id, request.module_code
            )
            
            if existing_quiz and not request.overwrite:
                result["skipped_modules"].append(request.module_code)
                result["message"] = "Quiz already exists for this module. Use overwrite=true to regenerate."
                return result
            
            # Delete existing quiz if overwrite is true
            if existing_quiz and request.overwrite:
                for quiz in existing_quiz:
                    await self.delete_quiz(db, str(quiz.id))
            
            # Generate new quiz
            quiz = await self.generate_quiz_for_module(
                db=db,
                course_id=request.course_id,
                module_code=request.module_code,
                module_content=module_info.assets_content or "",
                module_title=module_info.module_title or "Module",
                num_questions=request.num_questions,
                difficulty=request.difficulty
            )
            
            if quiz:
                result["generated_quizzes"].append(quiz.to_dict())
                result["message"] = "Quiz generated successfully"
            else:
                result["errors"].append(f"Failed to generate quiz for module {request.module_code}")
                result["success"] = False
            
            return result
            
        except Exception as e:
            logger.error(f"Error generating quiz for single module: {e}")
            result["errors"].append(str(e))
            result["success"] = False
            return result
    
    async def _generate_quizzes_for_all_modules(
        self, 
        db: AsyncIOMotorDatabase, 
        request: QuizGenerationRequest, 
        modules_info: List[CourseModuleInfo], 
        result: Dict[str, Any]
    ) -> Dict[str, Any]:
        """Generate quizzes for all modules in a course."""
        try:
            generated_count = 0
            skipped_count = 0
            
            for module_info in modules_info:
                if not module_info.module_code:
                    continue
                
                # Check if quiz already exists
                existing_quiz = await self.get_quizzes_by_course(
                    db, request.course_id, module_info.module_code
                )
                
                if existing_quiz and not request.overwrite:
                    result["skipped_modules"].append(module_info.module_code)
                    skipped_count += 1
                    continue
                
                # Delete existing quiz if overwrite is true
                if existing_quiz and request.overwrite:
                    for quiz in existing_quiz:
                        await self.delete_quiz(db, str(quiz.id))
                
                # Generate new quiz
                quiz = await self.generate_quiz_for_module(
                    db=db,
                    course_id=request.course_id,
                    module_code=module_info.module_code,
                    module_content=module_info.assets_content or "",
                    module_title=module_info.module_title or f"Module {module_info.module_code}",
                    num_questions=request.num_questions,
                    difficulty=request.difficulty
                )
                
                if quiz:
                    result["generated_quizzes"].append(quiz.to_dict())
                    generated_count += 1
                else:
                    result["errors"].append(f"Failed to generate quiz for module {module_info.module_code}")
            
            # Set result message
            if generated_count > 0:
                result["message"] = f"Generated {generated_count} quizzes"
                if skipped_count > 0:
                    result["message"] += f", skipped {skipped_count} existing quizzes"
            elif skipped_count > 0:
                result["message"] = f"Skipped {skipped_count} existing quizzes. Use overwrite=true to regenerate."
            else:
                result["success"] = False
                result["message"] = "No quizzes were generated"
            
            return result
            
        except Exception as e:
            logger.error(f"Error generating quizzes for all modules: {e}")
            result["errors"].append(str(e))
            result["success"] = False
            return result
    
    async def get_course_modules_info(
        self, 
        db: AsyncIOMotorDatabase,
        course_id: str, 
        module_code: Optional[str] = None
    ) -> List[CourseModuleInfo]:
        """Get course and module information from courses and assets collections."""
        try:

            logger.info(f"Course get with: {course_id}")
            logger.info(f"Course get with objectid: {ObjectId(course_id)}")
            # Get course from courses collection
            course = await db.courses.find_one({"_id": ObjectId(course_id)})
            if not course:
                logger.error(f"Course not found: {course_id}")
                return []
            
            course_title = course.get("title", "Unknown Course")
            modules = course.get("modules", [])
            
            result = []
            
            # If specific module is requested
            if module_code:
                target_module = None
                for module in modules:
                    if str(module.get("code", "")) == module_code:
                        target_module = module
                        break
                
                if target_module:
                    assets_content = await self._get_module_assets_content(db, target_module.get("assets", []))
                    result.append(CourseModuleInfo(
                        course_id=course_id,
                        course_title=course_title,
                        module_id=str(target_module.get("_id", "")),
                        module_title=target_module.get("title", "Unknown Module"),
                        module_code=str(target_module.get("code", "")),
                        assets_content=assets_content
                    ))
            else:
                # Get all modules
                for module in modules:
                    assets_content = await self._get_module_assets_content(db, module.get("assets", []))
                    result.append(CourseModuleInfo(
                        course_id=course_id,
                        course_title=course_title,
                        module_id=str(module.get("_id", "")),
                        module_title=module.get("title", "Unknown Module"),
                        module_code=str(module.get("code", "")),
                        assets_content=assets_content
                    ))
            
            return result
                
        except Exception as e:
            logger.error(f"Error getting course modules info: {e}")
            return []
    
    async def _get_module_assets_content(self, db: AsyncIOMotorDatabase, asset_ids: List[str]) -> str:
        """Get content from assets collection by asset IDs."""
        try:
            if not asset_ids:
                return ""
            
            # Convert string IDs to ObjectIds
            object_ids = []
            for asset_id in asset_ids:
                try:
                    object_ids.append(ObjectId(asset_id))
                except:
                    # If it's not a valid ObjectId, skip it
                    continue
            
            if not object_ids:
                return ""
            
            # Get assets from assets collection
            assets_content = []
            async for asset in db.assets.find({"_id": {"$in": object_ids}}):
                content = asset.get("content", "")
                title = asset.get("title", "")
                if title and content:
                    assets_content.append(f"Asset: {title}\n{content}")
                elif content:
                    assets_content.append(content)
            
            return "\n\n".join(assets_content)
            
        except Exception as e:
            logger.error(f"Error getting assets content: {e}")
            return ""
    
    # Quiz Attempt Methods
    async def create_quiz_attempt(self, db: AsyncIOMotorDatabase, user_id: str, quiz_id: str, answers: List[Dict]) -> QuizAttempt:
        """Create a new quiz attempt in MongoDB."""
        try:
            quiz = await self.get_quiz(db, quiz_id)
            if not quiz:
                raise ValueError("Quiz not found")
            
            # Calculate score
            score = 0
            max_score = len(quiz.questions)
            
            for i, answer in enumerate(answers):
                if i < len(quiz.questions):
                    correct_answer = quiz.questions[i].get('correct_answer', -1)
                    if answer.get('selected_answer') == correct_answer:
                        score += 1
            
            # Calculate percentage
            percentage = int((score / max_score) * 100) if max_score > 0 else 0
            
            # Create attempt document
            attempt_doc = {
                "_id": ObjectId(),
                "quiz_id": quiz_id,
                "user_id": user_id,
                "answers": answers,
                "score": score,
                "max_score": max_score,
                "percentage": percentage,
                "started_at": datetime.utcnow(),
                "completed_at": datetime.utcnow(),
                "is_completed": True
            }
            
            # Insert into MongoDB
            result = await db.quiz_attempts.insert_one(attempt_doc)
            attempt_doc["_id"] = result.inserted_id
            
            # Create QuizAttempt instance
            attempt = QuizAttempt.from_mongo_dict(attempt_doc)
            
            logger.info(f"Created quiz attempt: {attempt.id} for user: {user_id}")
            return attempt
            
        except Exception as e:
            logger.error(f"Error creating quiz attempt: {e}")
            raise
    
    async def get_user_quiz_attempts(self, db: AsyncIOMotorDatabase, user_id: str, quiz_id: Optional[str] = None) -> List[QuizAttempt]:
        """Get quiz attempts for a user from MongoDB."""
        try:
            query = {"user_id": user_id}
            
            if quiz_id:
                query["quiz_id"] = quiz_id
            
            attempt_docs = []
            async for doc in db.quiz_attempts.find(query).sort("started_at", -1):
                attempt_docs.append(doc)
            
            return [QuizAttempt.from_mongo_dict(doc) for doc in attempt_docs]
        except Exception as e:
            logger.error(f"Error getting quiz attempts for user {user_id}: {e}")
            return []


# QuizService class - instantiate per request like other services
