import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { getUserByEmail } from "../services/api";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { AlertCircle, GraduationCap, Mail, Rocket, Loader2 } from "lucide-react";

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
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <div className="w-full max-w-md">
        <Card className="shadow-lg">
          <CardHeader className="text-center space-y-6">
            <div className="mx-auto w-16 h-16 bg-primary rounded-full flex items-center justify-center">
              <GraduationCap className="w-8 h-8 text-primary-foreground" />
            </div>
            <div className="space-y-2">
              <CardTitle className="text-3xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                Welcome
              </CardTitle>
              <CardDescription className="text-base text-muted-foreground">
                Enter your email to access your personalized learning experience
              </CardDescription>
            </div>
          </CardHeader>

          <CardContent className="space-y-6">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="email" className="text-sm font-semibold flex items-center gap-2">
                  <Mail className="w-4 h-4" />
                  Email Address
                </Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  value={email}
                  onChange={handleChange}
                  placeholder="e.g., ada@example.com"
                  className="h-12 text-base"
                  disabled={isLoading}
                />
              </div>

              {error && (
                <div className="flex items-center gap-2 p-3 text-sm bg-destructive/10 text-destructive border border-destructive/20 rounded-md">
                  <AlertCircle className="w-4 h-4 flex-shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              <Button
                type="submit"
                className="w-full h-12 text-base font-semibold"
                disabled={isLoading || !email.trim()}
              >
                {isLoading ? (
                  <div className="flex items-center gap-2">
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Checking...
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <Rocket className="w-4 h-4" />
                    Login
                  </div>
                )}
              </Button>
            </form>

            <div className="pt-6 border-t border-border text-center">
              <p className="text-xs text-muted-foreground">
                New to the platform? Your preferences will be set up after login.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Login;
