import axios from "axios";

// Base URL configuration - uses environment variable or defaults to localhost
const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || "http://localhost:8000/api/v1";
const API_ROOT_URL = process.env.REACT_APP_API_ROOT_URL || "http://localhost:8000";

// Create axios instance with base configuration
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// Create axios instance for course endpoints (different base URL)
const courseApi = axios.create({
  baseURL: API_ROOT_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// User API functions

/**
 * Get user by ID
 * @param {string} userId - The user ID
 * @returns {Promise} - Promise resolving to user data
 */
export const getUserById = async (userId) => {
  try {
    const response = await api.get(`/users-collection/${userId}`);
    return response.data;
  } catch (error) {
    console.error("Error fetching user by ID:", error);
    throw error;
  }
};

/**
 * Get user by email
 * @param {string} email - The user email
 * @returns {Promise} - Promise resolving to user data
 */
export const getUserByEmail = async (email) => {
  try {
    const response = await api.get(`/users-collection/email/${email}`);
    return response.data;
  } catch (error) {
    console.error("Error fetching user by email:", error);
    throw error;
  }
};

/**
 * Save new user preferences
 * @param {Object} userData - User data object
 * @param {string} userData.name - User name
 * @param {string} userData.email - User email
 * @param {string} userData.domain - User domain
 * @param {string} userData.hobbies - User hobbies
 * @param {string} userData.learningStyle - User learning style ("visual_cue", "storytelling", or "summary")
 * @returns {Promise} - Promise resolving to created user data
 */
export const saveUserPreferences = async (userData) => {
  try {
    const response = await api.post("/users-collection/", userData);
    return response.data;
  } catch (error) {
    console.error("Error saving user preferences:", error);
    throw error;
  }
};

/**
 * Update user preferences
 * @param {string} userId - The user ID
 * @param {Object} updateData - Data to update
 * @param {string} [updateData.name] - User name
 * @param {string} [updateData.email] - User email
 * @param {string} [updateData.domain] - User domain
 * @param {string} [updateData.hobbies] - User hobbies
 * @param {string} [updateData.learningStyle] - User learning style ("visual_cue", "storytelling", or "summary")
 * @returns {Promise} - Promise resolving to updated user data
 */
export const updateUserPreferences = async (userId, updateData) => {
  try {
    const response = await api.put(`/users-collection/${userId}`, updateData);
    return response.data;
  } catch (error) {
    console.error("Error updating user preferences:", error);
    throw error;
  }
};

// Course API functions

/**
 * Get course assets by course ID
 * @param {string} courseId - The course ID
 * @returns {Promise} - Promise resolving to course assets data
 */
export const getCourseAssets = async (courseId) => {
  try {
    const response = await courseApi.get(`/course/${courseId}/assets`);
    return response.data;
  } catch (error) {
    console.error("Error fetching course assets:", error);
    throw error;
  }
};

// Quiz API functions

/**
 * Generate quizzes for a course or specific module
 * @param {Object} requestData - Quiz generation request data
 * @param {string} requestData.course_id - MongoDB ObjectId of the course (required)
 * @param {string} [requestData.module_code] - Module code reference (optional)
 * @param {boolean} [requestData.overwrite] - Whether to overwrite existing quizzes (default: false)
 * @param {number} [requestData.num_questions] - Number of questions per quiz (default: 5)
 * @param {string} [requestData.difficulty] - Quiz difficulty level (easy/medium/hard)
 * @returns {Promise} - Promise resolving to quiz generation response
 */
export const generateQuizzes = async (requestData) => {
  try {
    const response = await api.post("/quiz/generate", requestData);
    return response.data;
  } catch (error) {
    console.error("Error generating quizzes:", error);
    throw error;
  }
};

/**
 * Get quizzes for a course
 * @param {string} courseId - The course ID
 * @param {string} [moduleCode] - Optional module code to filter by
 * @param {number} [page] - Page number for pagination (default: 1)
 * @param {number} [size] - Page size (default: 10)
 * @returns {Promise} - Promise resolving to quiz list response
 */
export const getQuizzesByCourse = async (courseId, moduleCode = null, page = 1, size = 10) => {
  try {
    const params = { page, size };
    if (moduleCode) {
      params.module_code = moduleCode;
    }

    const response = await api.get(`/quiz/course/${courseId}`, { params });
    return response.data;
  } catch (error) {
    console.error("Error fetching quizzes:", error);
    throw error;
  }
};

// Content Transformer API functions

/**
 * Get personalized asset content based on user preferences
 * @param {string} code - Asset code identifier
 * @param {string} domain - User's domain preference
 * @param {string} hobby - User's hobby preference
 * @param {string} style - User's preferred learning style
 * @returns {Promise} - Promise resolving to personalized asset data
 */
export const getPersonalizedAsset = async (code, domain, hobby, style) => {
  try {
    const response = await api.get("/content-transformer/getAsset", {
      params: {
        code,
        domain,
        hobby,
        style,
      },
    });
    return response.data;
  } catch (error) {
    console.error("Error fetching personalized asset:", error);
    throw error;
  }
};

// Export the axios instances for additional custom requests if needed
export { courseApi };
export default api;
