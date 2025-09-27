	import React, { useState } from "react";
import "../styles/globals.css";

export default function LoginPage({
  onLogin,
}: {
  onLogin?: (isAdmin?: boolean) => void; // <-- FIXED: allow one boolean arg
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
      const res = await fetch("http://localhost:5000/api/login", {
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

      // ✅ Now TypeScript is happy
      if (onLogin) {
        onLogin(data.user.isAdmin);
      }
    } catch (err) {
      console.error("Login request error:", err);
      setError("Unable to connect to server.");
    }
  };
		return (
			<div className="flex items-center justify-center min-h-screen bg-background animate-fade-in">
				<form
					className="bg-card p-2 rounded-lg shadow-lg w-full max-w-[200px] flex flex-col gap-4 border border-border animate-slide-up mx-auto"
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
						<h2 className="text-lg font-bold text-center">Welcome Back</h2>
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
						Login
					</button>
					<button
						type="button"
						className="w-full text-xs text-primary mt-2 underline"
						onClick={() => window.dispatchEvent(new CustomEvent("show-signup"))}
					>
						Don't have an account? Sign Up
					</button>
				</form>
			</div>
		);
	}

