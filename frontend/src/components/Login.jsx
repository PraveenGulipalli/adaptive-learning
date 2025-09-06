import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { getUserByEmail } from "../services/api";

const Login = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  // Email validation helper function
  const isValidEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const handleChange = (e) => {
    const newEmail = e.target.value;
    setEmail(newEmail);

    // Clear error when user starts typing a valid email
    if (error && newEmail.trim() && isValidEmail(newEmail.trim())) {
      setError("");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validate email input
    if (!email.trim()) {
      setError("Please enter your email address.");
      return;
    }

    // Validate email format
    if (!isValidEmail(email.trim())) {
      setError("Please enter a valid email address.");
      return;
    }

    setError("");
    setIsLoading(true);

    try {
      // Call getUserByEmail API
      const userData = await getUserByEmail(email.trim());

      // Success case - store user data in localStorage and navigate to "/"
      localStorage.setItem("userProfile", JSON.stringify(userData));
      navigate("/");
    } catch (error) {
      // Check if it's a 404 error with the specific message
      if (
        error.response?.status === 404 &&
        error.response?.data?.detail?.includes(`User preferences not found for email: ${email.trim()}`)
      ) {
        // Store only email in localStorage and navigate to "/save-preference"
        localStorage.setItem("userProfile", JSON.stringify({ email: email.trim() }));
        navigate("/save-preference");
      } else {
        // Handle other errors
        setError("An error occurred while checking your email. Please try again.");
        console.error("Login error:", error);
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
            <span className="text-5xl">🎓</span>
          </div>
          <h1 className="text-3xl font-bold gradient-primary text-white px-6 py-3 rounded-lg inline-block mb-4">
            Welcome
          </h1>
          <p className="text-muted">Enter your email to access your personalized learning experience</p>
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
              value={email}
              onChange={handleChange}
              placeholder="e.g., ada@example.com"
              className="w-full px-4 py-3 border-2 border-theme border-theme-hover rounded-lg shadow-sm focus-ring transition-all duration-200"
              style={{
                backgroundColor: "var(--surface)",
                color: "var(--text-primary)",
              }}
            />
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
                  Checking...
                </span>
              ) : (
                <span className="flex items-center justify-center">🚀 Login</span>
              )}
            </button>
          </div>
        </form>

        <div className="text-center pt-4 border-t border-theme">
          <p className="text-xs text-muted">New to the platform? Your preferences will be set up after login.</p>
        </div>
      </div>
    </div>
  );
};

export default Login;
