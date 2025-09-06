import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { saveUserPreferences, updateUserPreferences } from "../services/api";

/**
 * A form to collect user profile information for content personalization.
 * @param {object} props - The component props.
 */
function UserProfileForm({ isUpdate }) {
  const navigate = useNavigate();

  const userProfile = localStorage.getItem("userProfile");
  const [profile, setProfile] = useState(
    userProfile
      ? JSON.parse(userProfile)
      : {
          name: "",
          email: "",
          domain: "",
          hobbies: "",
          learningStyle: "",
        }
  );

  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setProfile((prevProfile) => ({
      ...prevProfile,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    console.log("profile", profile);
    // Validate form fields
    if (
      !profile.name.trim() ||
      !profile.email.trim() ||
      !profile.domain.trim() ||
      !profile.hobbies.trim() ||
      !profile.learningStyle.trim()
    ) {
      setError("Please fill out all fields to personalize your content.");
      return;
    }

    setError("");
    setIsLoading(true);

    try {
      // Prepare data for API call
      const userData = {
        name: profile.name.trim(),
        email: profile.email.trim(),
        domain: profile.domain,
        hobbies: profile.hobbies,
        learningStyle: profile.learningStyle,
      };

      let result;

      if (isUpdate) {
        // Update existing user preferences
        const userId = profile.id || profile._id; // Handle both possible ID field names
        if (!userId) {
          setError("User ID not found. Cannot update preferences.");
          return;
        }
        result = await updateUserPreferences(userId, userData);
      } else {
        // Save new user preferences
        result = await saveUserPreferences(userData);
      }

      // Save updated profile data to localStorage
      localStorage.setItem("userProfile", JSON.stringify(result));

      // Navigate to home page on success
      navigate("/");
    } catch (error) {
      console.error("Error saving user preferences:", error);

      // Display user-friendly error message
      if (error.response?.data?.detail) {
        setError(error.response.data.detail);
      } else {
        setError("An error occurred while saving your preferences. Please try again.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex justify-center items-center min-h-screen" style={{ backgroundColor: "var(--background)" }}>
      <div className="w-full max-w-md p-8 space-y-6 card card-hover">
        <div className="text-center">
          <div className="mb-4">
            <span className="text-5xl">👤</span>
          </div>
          <h1 className="text-3xl font-bold gradient-secondary text-white px-6 py-3 rounded-lg inline-block mb-4">
            {isUpdate ? "Update Profile" : "Create Your Profile"}
          </h1>
          <p className="text-muted">
            {isUpdate
              ? "Update your preferences to get better personalized content."
              : "Tell us about yourself to get personalized learning content."}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Email Input */}
          <div>
            <label
              htmlFor="email"
              className="block text-sm font-semibold mb-2"
              style={{ color: "var(--text-primary)" }}
            >
              📧 Email Address
            </label>
            <input
              type="email"
              id="email"
              name="email"
              value={profile.email}
              onChange={handleChange}
              placeholder="e.g., ada@example.com"
              className="w-full px-4 py-3 border-2 rounded-lg shadow-sm transition-all duration-200 opacity-60"
              style={{
                backgroundColor: "var(--surface-secondary)",
                color: "var(--text-secondary)",
                borderColor: "var(--border)",
              }}
              disabled
            />
            <p className="text-xs text-muted mt-1">Email cannot be changed</p>
          </div>

          {/* Full Name Input */}
          <div>
            <label htmlFor="name" className="block text-sm font-semibold mb-2" style={{ color: "var(--text-primary)" }}>
              👤 Full Name
            </label>
            <input
              type="text"
              id="name"
              name="name"
              value={profile.name}
              onChange={handleChange}
              placeholder="e.g., Ada Lovelace"
              className={`w-full px-4 py-3 border-2 border-theme border-theme-hover rounded-lg shadow-sm focus-ring transition-all duration-200 ${
                isUpdate ? "opacity-60" : ""
              }`}
              style={{
                backgroundColor: isUpdate ? "var(--surface-secondary)" : "var(--surface)",
                color: "var(--text-primary)",
              }}
              disabled={isUpdate}
            />
            {isUpdate && <p className="text-xs text-muted mt-1">Name cannot be changed</p>}
          </div>

          {/* Domain Selection */}
          <div>
            <label
              htmlFor="domain"
              className="block text-sm font-semibold mb-2"
              style={{ color: "var(--text-primary)" }}
            >
              🎯 Primary Domain
            </label>
            <select
              id="domain"
              name="domain"
              value={profile.domain}
              onChange={handleChange}
              className="w-full px-4 py-3 border-2 border-theme border-theme-hover rounded-lg shadow-sm focus-ring transition-all duration-200"
              style={{
                backgroundColor: "var(--surface)",
                color: "var(--text-primary)",
              }}
            >
              <option value="">Select your domain</option>
              <option value="engineering-student">🔧 Engineering Student</option>
              <option value="medical-student">🏥 Medical Student</option>
              <option value="business-student">💼 Business Student</option>
              <option value="teacher-trainer">👨‍🏫 Teacher / Trainer</option>
              <option value="working-professional">💻 Working Professional</option>
            </select>
          </div>

          {/* hobbies Selection */}
          <div>
            <label
              htmlFor="hobbies"
              className="block text-sm font-semibold mb-2"
              style={{ color: "var(--text-primary)" }}
            >
              ❤️ Hobbies
            </label>
            <select
              id="hobbies"
              name="hobbies"
              value={profile.hobbies}
              onChange={handleChange}
              className="w-full px-4 py-3 border-2 border-theme border-theme-hover rounded-lg shadow-sm focus-ring transition-all duration-200"
              style={{
                backgroundColor: "var(--surface)",
                color: "var(--text-primary)",
              }}
            >
              <option value="">Select your interest</option>
              <option value="cricket">🏏 Cricket</option>
              <option value="movies">🎬 Movie Buff</option>
              <option value="gaming">🎮 Gamer</option>
              <option value="music">🎵 Music Lover</option>
              <option value="cooking">👨‍🍳 Chef</option>
            </select>
          </div>

          {/* Learning Style Selection */}
          <div>
            <label
              htmlFor="learningStyle"
              className="block text-sm font-semibold mb-2"
              style={{ color: "var(--text-primary)" }}
            >
              🧠 Learning Style
            </label>
            <select
              id="learningStyle"
              name="learningStyle"
              value={profile.learningStyle}
              onChange={handleChange}
              className="w-full px-4 py-3 border-2 border-theme border-theme-hover rounded-lg shadow-sm focus-ring transition-all duration-200"
              style={{
                backgroundColor: "var(--surface)",
                color: "var(--text-primary)",
              }}
            >
              <option value="">Select your learning style</option>
              <option value="visual_cue">👁️ Visual Cue</option>
              <option value="storytelling">📚 Storytelling</option>
              <option value="summary">📝 Summary</option>
            </select>
          </div>

          {error && (
            <div
              className="p-3 rounded-lg"
              style={{
                backgroundColor: "var(--error-50)",
                color: "var(--error-700)",
                border: "1px solid var(--error-200)",
              }}
            >
              <div className="flex items-center">
                <span className="mr-2">⚠️</span>
                <span className="text-sm font-medium">{error}</span>
              </div>
            </div>
          )}

          {/* Submit Button */}
          <div>
            <button
              type="submit"
              disabled={isLoading}
              className="w-full btn-primary py-3 text-lg font-semibold focus-ring"
            >
              {isLoading ? (
                <span className="flex items-center justify-center">
                  <span className="animate-spin mr-2">⏳</span>
                  {isUpdate ? "Updating..." : "Saving..."}
                </span>
              ) : (
                <span className="flex items-center justify-center">
                  {isUpdate ? "✏️ Update Profile" : "💾 Save Profile"}
                </span>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default UserProfileForm;
