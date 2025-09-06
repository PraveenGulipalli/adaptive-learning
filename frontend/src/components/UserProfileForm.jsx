import React, { useState } from "react";

/**
 * A form to collect user profile information for content personalization.
 * @param {object} props - The component props.
 * @param {function(object): void} props.onProfileSubmit - Callback function to execute when the form is submitted. It passes the profile data object.
 */
function UserProfileForm({ onProfileSubmit }) {
  const [profile, setProfile] = useState({
    ageGroup: "college",
    domain: "",
    interests: "",
  });

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
    if (!profile.fullName.trim() || !profile.domain.trim() || !profile.interests.trim()) {
      setError("Please fill out all fields to personalize your content.");
      return;
    }
    if (!profile.domain.trim() || !profile.interests.trim()) {
      setError("Please fill out all fields to personalize your content.");
      return;
    }
    setError("");
    // Pass the collected profile data to the parent component
    onProfileSubmit(profile);
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
            />
          </div>
          {/* Age Group Selection */}
          <div>
            <label htmlFor="ageGroup" className="block text-sm font-medium text-gray-700 mb-1">
              Which group describes you best?
            </label>
            <select
              id="ageGroup"
              name="ageGroup"
              value={profile.ageGroup}
              onChange={handleChange}
              className="w-full px-3 py-2 text-gray-700 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="school">School Student (Under 18)</option>
              <option value="college">College Student (18-22)</option>
              <option value="professional">Working Professional (23+)</option>
            </select>
          </div>

          {/* Domain Input */}
          <div>
            <label htmlFor="domain" className="block text-sm font-medium text-gray-700 mb-1">
              What is your primary domain?
            </label>
            <input
              type="text"
              id="domain"
              name="domain"
              value={profile.domain}
              onChange={handleChange}
              placeholder="e.g., Computer Science, Marketing, Biology"
              className="w-full px-3 py-2 text-gray-700 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          {/* Interests Input */}
          <div>
            <label htmlFor="interests" className="block text-sm font-medium text-gray-700 mb-1">
              What are your interests or hobbies?
            </label>
            <input
              type="text"
              id="interests"
              name="interests"
              value={profile.interests}
              onChange={handleChange}
              placeholder="e.g., Gaming, Sci-Fi Movies, Hiking"
              className="w-full px-3 py-2 text-gray-700 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
            <p className="mt-1 text-xs text-gray-500">Separate your interests with commas.</p>
          </div>

          {error && <p className="text-sm text-red-600 text-center">{error}</p>}

          {/* Submit Button */}
          <div>
            <button
              type="submit"
              className="w-full px-4 py-3 font-semibold text-white bg-blue-600 rounded-md shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-transform transform hover:scale-105"
            >
              Generate My Content
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default UserProfileForm;
