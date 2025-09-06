import React, { useEffect } from "react";
import { Routes, Route, useNavigate, useLocation } from "react-router-dom";
import Home from "./components/Home";
import UserProfileForm from "./components/UserProfileForm";
import Login from "./components/Login";

function App() {
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    // Check if user profile exists in localStorage
    const userProfile = localStorage.getItem("userProfile");

    // If no profile exists, redirect to login page
    if (!userProfile && location.pathname !== "/login") {
      navigate("/login");
    }
    // If profile exists and user is on login page, redirect to home
    else if (userProfile && location.pathname === "/login") {
      if (JSON.parse(userProfile)?.name) {
        navigate("/");
      } else {
        navigate("/save-preference");
      }
    }
  }, [location.pathname]);

  return (
    <div className="App">
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="login" element={<Login />} />
        <Route path="/save-preference" element={<UserProfileForm />} />
        <Route path="/update-preference" element={<UserProfileForm isUpdate />} />
      </Routes>
    </div>
  );
}

export default App;
