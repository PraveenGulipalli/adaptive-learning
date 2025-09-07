import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { saveUserPreferences, updateUserPreferences } from "../services/api";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { AlertCircle, User, Mail, Target, Heart, Brain, Save, Edit, Loader2 } from "lucide-react";

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

  // Store initial values for comparison when in update mode
  const [initialProfile, setInitialProfile] = useState(null);

  // Set initial values when in update mode
  useEffect(() => {
    if (isUpdate && profile && !initialProfile) {
      setInitialProfile({
        domain: profile.domain,
        hobbies: profile.hobbies,
        learningStyle: profile.learningStyle,
      });
    }
  }, [isUpdate, profile, initialProfile]);

  const handleChange = (name, value) => {
    setProfile((prevProfile) => ({
      ...prevProfile,
      [name]: value,
    }));
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    handleChange(name, value);
  };

  // Check if any editable values have changed from initial values
  const hasChanges = () => {
    if (!isUpdate || !initialProfile) return true; // Allow submission for new profiles or when initial values aren't set yet

    return (
      profile.domain !== initialProfile.domain ||
      profile.hobbies !== initialProfile.hobbies ||
      profile.learningStyle !== initialProfile.learningStyle
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

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
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <div className="w-full max-w-md">
        <Card className="shadow-lg">
          <CardHeader className="text-center space-y-6">
            <div className="mx-auto w-16 h-16 rounded-full bg-gradient-to-tr from-sky-200 via-blue-400 to-indigo-900 to-90% flex items-center justify-center">
              <User className="w-8 h-8 text-white" />
            </div>
            <div className="space-y-2">
              <CardTitle className="text-3xl font-bold bg-gradient-to-r from-secondary to-primary bg-clip-text text-transparent">
                {isUpdate ? "Update Profile" : "Create Your Profile"}
              </CardTitle>
              <CardDescription className="text-base">
                {isUpdate
                  ? "Update your preferences to get better personalized content."
                  : "Tell us about yourself to get personalized learning content."}
              </CardDescription>
            </div>
          </CardHeader>

          <CardContent className="space-y-6">
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Email Input */}
              <div className="space-y-2">
                <Label htmlFor="email" className="text-sm font-semibold flex items-center gap-2">
                  <Mail className="w-4 h-4" />
                  Email Address
                </Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  value={profile.email}
                  onChange={handleInputChange}
                  placeholder="e.g., ada@example.com"
                  disabled
                  className="bg-muted text-muted-foreground"
                />
              </div>

              {/* Full Name Input */}
              <div className="space-y-2">
                <Label htmlFor="name" className="text-sm font-semibold flex items-center gap-2">
                  <User className="w-4 h-4" />
                  Full Name
                </Label>
                <Input
                  id="name"
                  name="name"
                  type="text"
                  value={profile.name}
                  onChange={handleInputChange}
                  placeholder="e.g., Ada Lovelace"
                  disabled={isUpdate}
                  className={isUpdate ? "bg-muted text-muted-foreground" : ""}
                />
              </div>

              {/* Domain Selection */}
              <div className="space-y-2">
                <Label className="text-sm font-semibold flex items-center gap-2">
                  <Target className="w-4 h-4" />
                  Primary Domain
                </Label>
                <Select value={profile.domain} onValueChange={(value) => handleChange("domain", value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select your domain" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="engineering-student">🔧 Engineering Student</SelectItem>
                    <SelectItem value="medical-student">🏥 Medical Student</SelectItem>
                    <SelectItem value="business-student">💼 Business Student</SelectItem>
                    <SelectItem value="teacher-trainer">👨‍🏫 Teacher / Trainer</SelectItem>
                    <SelectItem value="working-professional">💻 Working Professional</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Hobbies Selection */}
              <div className="space-y-2">
                <Label className="text-sm font-semibold flex items-center gap-2">
                  <Heart className="w-4 h-4" />
                  Hobbies
                </Label>
                <Select value={profile.hobbies} onValueChange={(value) => handleChange("hobbies", value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select your interest" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="cricket">🏏 Cricket</SelectItem>
                    <SelectItem value="movies">🎬 Movie Buff</SelectItem>
                    <SelectItem value="gaming">🎮 Gamer</SelectItem>
                    <SelectItem value="music">🎵 Music Lover</SelectItem>
                    <SelectItem value="cooking">👨‍🍳 Chef</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Learning Style Selection */}
              <div className="space-y-2">
                <Label className="text-sm font-semibold flex items-center gap-2">
                  <Brain className="w-4 h-4" />
                  Learning Style
                </Label>
                <Select value={profile.learningStyle} onValueChange={(value) => handleChange("learningStyle", value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select your learning style" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="visual_cue">👁️ Visual Cue</SelectItem>
                    <SelectItem value="storytelling">📚 Storytelling</SelectItem>
                    <SelectItem value="summary">📝 Summary</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {error && (
                <div className="flex items-center gap-2 p-3 text-sm bg-destructive/10 text-destructive border border-destructive/20 rounded-md">
                  <AlertCircle className="w-4 h-4 flex-shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              {/* Submit Button */}
              <Button
                type="submit"
                className="w-full h-12 text-base font-semibold"
                disabled={isLoading || !hasChanges()}
              >
                {isLoading ? (
                  <div className="flex items-center gap-2">
                    <Loader2 className="w-4 h-4 animate-spin" />
                    {isUpdate ? "Updating..." : "Saving..."}
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    {isUpdate ? <Edit className="w-4 h-4" /> : <Save className="w-4 h-4" />}
                    {isUpdate ? "Update Profile" : "Save Profile"}
                  </div>
                )}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export default UserProfileForm;
