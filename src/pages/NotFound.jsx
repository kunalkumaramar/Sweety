// sweetyintimate/src/pages/NotFound.jsx
import React from "react";
import { useNavigate } from "react-router-dom";

export default function NotFound() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-pink-50 text-center">
      <h1 className="text-7xl font-extrabold text-pink-600 mb-4">404</h1>
      <h2 className="text-2xl font-semibold text-gray-800 mb-3">
        Oops! Page Not Found
      </h2>
      <p className="text-gray-500 mb-6 px-6 max-w-md">
        The page you’re looking for might have been removed, renamed, or doesn’t exist.
      </p>
      <button
        onClick={() => navigate("/")}
        className="bg-pink-500 text-white px-6 py-3 rounded-full shadow-md hover:bg-pink-600 transition-all"
      >
        Go Back Home
      </button>
    </div>
  );
}
