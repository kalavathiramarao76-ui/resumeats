"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    const res = await fetch("/api/auth", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "login", email, password }),
    });
    const data = await res.json();
    setLoading(false);
    if (data.ok) router.push("/builder");
    else setError(data.error || "Login failed");
  };

  return (
    <main className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="max-w-sm w-full">
        <div className="text-center mb-8">
          <Link href="/" className="text-2xl font-bold text-brand-600">Resume<span className="text-gray-900">ATS</span></Link>
          <h1 className="text-xl font-semibold mt-4">Welcome back</h1>
          <p className="text-gray-500 text-sm mt-1">Log in to access your resumes</p>
        </div>
        <form onSubmit={handleSubmit} className="bg-white rounded-2xl border border-gray-200 p-6 space-y-4 shadow-sm">
          {error && <p className="text-red-500 text-sm text-center bg-red-50 p-2 rounded-lg">{error}</p>}
          <div>
            <label className="text-sm text-gray-600 block mb-1">Email</label>
            <input type="email" value={email} onChange={e => setEmail(e.target.value)} required
              className="w-full p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-brand-500 focus:outline-none" placeholder="you@email.com" />
          </div>
          <div>
            <label className="text-sm text-gray-600 block mb-1">Password</label>
            <input type="password" value={password} onChange={e => setPassword(e.target.value)} required
              className="w-full p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-brand-500 focus:outline-none" placeholder="Your password" />
          </div>
          <button type="submit" disabled={loading}
            className="w-full py-3 bg-brand-600 text-white rounded-lg font-medium hover:bg-brand-700 disabled:opacity-50 transition">
            {loading ? "Logging in..." : "Log In"}
          </button>
        </form>
        <p className="text-center text-sm text-gray-500 mt-4">
          No account? <Link href="/signup" className="text-brand-600 hover:underline font-medium">Sign up free</Link>
        </p>
      </div>
    </main>
  );
}
