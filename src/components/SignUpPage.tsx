import React, { useState } from "react";
import "../styles/globals.css";

export default function SignUpPage({ onLogin }: { onLogin?: () => void }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = (e: any) => {
    e.preventDefault();
    if (!email || !password) {
      setError("Please enter both email and password.");
      return;
    }
    setError("");
    alert("Account created for " + email);
    if (onLogin) onLogin();
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-background animate-fade-in">
      <form
        className="bg-card p-3 rounded-xl shadow-lg w-full max-w-[250px] flex flex-col gap-4 border border-border animate-slide-up mx-auto"
        onSubmit={handleSubmit}
      >
        <div className="flex flex-col items-center mb-2 animate-bounce">
          <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center mb-2">
            <svg
              width="24"
              height="24"
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
          <h2 className="text-lg font-bold text-center">Create Account</h2>
        </div>
        {error && (
          <div className="text-red-500 text-xs text-center mb-2">{error}</div>
        )}
        <input
          type="email"
          placeholder="Email"
          className="w-full px-3 py-2 border rounded bg-input-background focus:outline-none focus:ring focus:border-primary text-sm"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <input
          type="password"
          placeholder="Password"
          className="w-full px-3 py-2 border rounded bg-input-background focus:outline-none focus:ring focus:border-primary text-sm"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        <button
          type="submit"
          className="w-full bg-primary text-primary-foreground py-2 rounded font-medium hover:bg-primary/90 transition text-sm"
        >
          Sign Up
        </button>
        <div className="flex flex-col gap-2 mt-2">
          <button
            type="button"
            className="w-full flex items-center justify-center gap-2 bg-blue-600 text-white py-2 rounded hover:bg-blue-700 transition text-sm"
          >
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="currentColor"
            >
              <path d="M22.675 0h-21.35c-.733 0-1.325.592-1.325 1.326v21.348c0 .733.592 1.326 1.325 1.326h11.495v-9.294h-3.128v-3.622h3.128v-2.672c0-3.1 1.893-4.788 4.659-4.788 1.325 0 2.463.099 2.797.143v3.24l-1.918.001c-1.504 0-1.797.715-1.797 1.763v2.313h3.587l-.467 3.622h-3.12v9.294h6.116c.733 0 1.325-.593 1.325-1.326v-21.349c0-.733-.592-1.325-1.325-1.325z" />
            </svg>
            Facebook
          </button>
          <button
            type="button"
            className="w-full flex items-center justify-center gap-2 bg-red-500 text-white py-2 rounded hover:bg-red-600 transition text-sm"
          >
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="currentColor"
            >
              <path d="M21.35 11.1h-9.17v2.8h5.22c-.22 1.16-1.32 3.4-5.22 3.4-3.14 0-5.7-2.6-5.7-5.8s2.56-5.8 5.7-5.8c1.7 0 3.18.66 4.18 1.74l2.86-2.86c-1.66-1.56-3.84-2.54-7.04-2.54-5.52 0-10 4.48-10 10s4.48 10 10 10c5.52 0 10-4.48 10-10 0-.68-.07-1.34-.18-1.98z" />
            </svg>
            Gmail
          </button>
          <button
            type="button"
            className="w-full flex items-center justify-center gap-2 bg-black text-white py-2 rounded hover:bg-gray-800 transition text-sm"
          >
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="currentColor"
            >
              <path d="M16.365 1.43c-.36-.36-.94-.36-1.3 0l-2.06 2.06c-.36.36-.36.94 0 1.3l2.06 2.06c.36.36.94.36 1.3 0l2.06-2.06c.36-.36.36-.94 0-1.3l-2.06-2.06zm-4.95 4.95c-.36-.36-.94-.36-1.3 0l-2.06 2.06c-.36.36-.36.94 0 1.3l2.06 2.06c.36.36.94.36 1.3 0l2.06-2.06c.36-.36.36-.94 0-1.3l-2.06-2.06zm4.95 4.95c-.36-.36-.94-.36-1.3 0l-2.06 2.06c-.36.36-.36.94 0 1.3l2.06 2.06c.36.36.94.36 1.3 0l2.06-2.06c.36-.36.36-.94 0-1.3l-2.06-2.06zm-4.95 4.95c-.36-.36-.94-.36-1.3 0l-2.06 2.06c-.36.36-.36.94 0 1.3l2.06 2.06c.36.36.94.36 1.3 0l2.06-2.06c.36-.36.36-.94 0-1.3l-2.06-2.06z" />
            </svg>
            Apple
          </button>
        </div>
        <button
          type="button"
          className="w-full text-xs text-primary mt-2 underline"
          onClick={onLogin}
        >
          Already have an account? Login
        </button>
      </form>
    </div>
  );
}
