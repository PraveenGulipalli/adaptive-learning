import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

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
          fullName: "",
          email: "",
          domain: "",
          interests: "",
        }
  );

  const [error, setError] = useState("");

  const handleChange = (e) => {
    const { name, value } = e.target;
    setProfile((prevProfile) => ({
      ...prevProfile,
      [name]: value,
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!profile.fullName.trim() || !profile.email.trim() || !profile.domain.trim() || !profile.interests.trim()) {
      setError("Please fill out all fields to personalize your content.");
      return;
    }
    setError("");

    // Save profile data to localStorage
    try {
      localStorage.setItem("userProfile", JSON.stringify(profile));
      console.log("Profile saved to localStorage:", profile);
      navigate("/");
    } catch (error) {
      console.error("Error saving profile to localStorage:", error);
    }
  };

  return (
    <div className="flex justify-center items-center min-h-screen bg-gray-50">
      <div className="w-full max-w-md p-8 space-y-6 bg-white rounded-xl shadow-lg">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-800">Create Your Learning Profile</h1>
          <p className="mt-2 text-sm text-gray-600">Tell us a bit about yourself to get personalized content.</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Full Name Input */}
          <div>
            <label htmlFor="fullName" className="block text-sm font-medium text-gray-700 mb-1">
              Full Name
            </label>
            <input
              type="text"
              id="fullName"
              name="fullName"
              value={profile.fullName}
              onChange={handleChange}
              placeholder="e.g., Ada Lovelace"
              className="w-full px-3 py-2 text-gray-700 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              disabled={isUpdate}
            />
          </div>

          {/* Email Input */}
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
              Email
            </label>
            <input
              type="email"
              id="email"
              name="email"
              value={profile.email}
              onChange={handleChange}
              placeholder="e.g., ada@example.com"
              className="w-full px-3 py-2 text-gray-700 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              disabled={isUpdate}
            />
          </div>

          {/* Domain Selection */}
          <div>
            <label htmlFor="domain" className="block text-sm font-medium text-gray-700 mb-1">
              What is your primary domain?
            </label>
            <select
              id="domain"
              name="domain"
              value={profile.domain}
              onChange={handleChange}
              className="w-full px-3 py-2 text-gray-700 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">Select your domain</option>
              <option value="Engineering Student">Engineering Student</option>
              <option value="Medical Student">Medical Student</option>
              <option value="Business Student">Business Student</option>
              <option value="Teacher / Trainer">Teacher / Trainer</option>
              <option value="Working Professional">Working Professional</option>
            </select>
          </div>

          {/* Interests Selection */}
          <div>
            <label htmlFor="interests" className="block text-sm font-medium text-gray-700 mb-1">
              What are your interests or hobbies?
            </label>
            <select
              id="interests"
              name="interests"
              value={profile.interests}
              onChange={handleChange}
              className="w-full px-3 py-2 text-gray-700 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">Select your interest</option>
              <option value="Cricket">Cricket</option>
              <option value="Movie Buff">Movie Buff</option>
              <option value="Gamer">Gamer</option>
              <option value="Music Lover">Music Lover</option>
            </select>
          </div>

          {error && <p className="text-sm text-red-600 text-center">{error}</p>}

          {/* Submit Button */}
          <div>
            <button
              type="submit"
              className="w-full px-4 py-3 font-semibold text-white bg-blue-600 rounded-md shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-transform transform hover:scale-105"
            >
              {isUpdate ? "Update Preference" : "Save Preference"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default UserProfileForm;
