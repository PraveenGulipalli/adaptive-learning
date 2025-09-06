import React from "react";
import { Link, useNavigate } from "react-router-dom";

/**
 * Home component that serves as the landing page
 */
function Home() {
  const navigate = useNavigate();

  return (
    <div className="flex justify-center items-center min-h-screen bg-gray-50">
      <header className="flex justify-center items-center h-20 fixed top-0 w-full text-2xl font-bold shadow-md">
        Adaptive Learning
        <button
          className="absolute right-5 h-10 flex items-center outline outline-1 px-4 rounded-md text-base"
          onClick={() => {
            navigate("/update-preference");
          }}
        >
          Change Preference
        </button>
      </header>
      <div className="w-full max-w-2xl p-8 space-y-6 bg-white rounded-xl shadow-lg text-center">
        <div>
          <h1 className="text-4xl font-bold text-gray-800 mb-4">Welcome to Adaptive Learning</h1>
          <p className="text-lg text-gray-600 mb-8">Personalized learning experiences tailored just for you</p>
        </div>

        <div className="space-y-4">
          <p className="text-gray-700">
            Get started by creating your learning profile to receive content that matches your interests and learning
            style.
          </p>

          <Link
            to="/login"
            className="inline-block px-6 py-3 font-semibold text-white bg-blue-600 rounded-md shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-transform transform hover:scale-105"
          >
            Create Your Profile
          </Link>
        </div>

        <div className="mt-8 text-sm text-gray-500">
          <p>Already have a profile? Your data is saved locally in your browser.</p>
        </div>
      </div>
    </div>
  );
}

export default Home;
