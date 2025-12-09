import React, { useState } from "react";
import "../styles/globals.css";

export default function LoginPage({
  onLogin,
}: {
  onLogin?: (isAdmin: boolean, userId: string) => void;
}) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = async (e: any) => {
    e.preventDefault();

    if (!email || !password) {
      setError("Please enter both email and password.");
      return;
    }

    try {
      const res = await fetch("http://localhost:5000/api/users/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Login failed");
        return;
      }

      setError("");
      alert(`Welcome, ${data.user.name || data.user.email}`);

      if (onLogin) {
        onLogin(data.user.isAdmin, data.user.id);
      }
    } catch (err) {
      console.error("Login request error:", err);
      setError("Unable to connect to server.");
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-background">
   <form
  className="bg-card p-6 rounded-lg shadow-lg max-w-[450px] flex flex-col gap-5 border border-border mx-auto"
  onSubmit={handleSubmit}
>
        <div className="flex flex-col items-center mb-4">
          <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center mb-3">
            <svg
              width="28"
              height="28"
              fill="none"
              stroke="white"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              viewBox="0 0 24 24"
            >
              <circle cx="12" cy="8" r="4" />
              <path d="M6 20v-2a6 6 0 0 1 12 0v2" />
            </svg>
          </div>
          <h2 className="text-xl font-bold text-center">Welcome Back</h2>
          <p className="text-sm text-gray-500 mt-1">Sign in to your account</p>
        </div>
        
        {error && (
          <div className="text-red-500 text-sm text-center bg-red-50 py-2 px-3 rounded border border-red-200">
            {error}
          </div>
        )}
        
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Email Address
            </label>
            <input
              type="email"
              placeholder="Enter your email"
              className="w-full px-4 py-3 border rounded-lg bg-input-background focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Password
            </label>
            <input
              type="password"
              placeholder="Enter your password"
              className="w-full px-4 py-3 border rounded-lg bg-input-background focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
        </div>
        
        <button
          type="submit"
          className="w-full bg-primary text-primary-foreground py-3 rounded-lg font-medium hover:bg-primary/90 transition-colors mt-2"
        >
          Login
        </button>
        
        <div className="text-center pt-4 border-t border-gray-100 mt-4">
          <button
            type="button"
            className="text-sm text-primary hover:text-primary/80 transition-colors"
            onClick={() => window.dispatchEvent(new CustomEvent("show-signup"))}
          >
            Don't have an account? Sign Up
          </button>
        </div>
      </form>
    </div>
  );
}