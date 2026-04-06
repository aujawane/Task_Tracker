"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth, Category, DEFAULT_CATEGORIES } from "@/lib/auth";

export default function LoginPage() {
  const [isLogin, setIsLogin] = useState(true);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const { login, register, error, setError } = useAuth();
  const router = useRouter();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (isLogin) {
      const success = login(email, password);
      if (success) {
        router.push("/");
      }
    } else {
      const success = register(name, email, password, DEFAULT_CATEGORIES);
      if (success) {
        router.push("/");
      }
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-[var(--background)]">
      <div className="w-full max-w-md">
        <div className="text-center mb-10">
          <h1 className="text-5xl font-black text-[var(--primary)] tracking-tighter mb-2 italic">
            Adi<span className="text-white">Task</span>
          </h1>
          <p className="text-[var(--text-secondary)] font-medium">
            {isLogin ? "Welcome back! Please sign in." : "Join AdiTask today!"}
          </p>
        </div>

        <div className="bg-[var(--surface)] rounded-3xl p-8 shadow-2xl border border-[var(--border)]">
          <form onSubmit={handleSubmit} className="space-y-5">
            {!isLogin && (
              <div>
                <label className="block text-sm font-bold text-[var(--text-secondary)] mb-1.5 ml-1">Name</label>
                <input
                  type="text"
                  value={name}
                  onChange={e => setName(e.target.value)}
                  placeholder="Your full name"
                  className="w-full bg-[var(--background)] border border-[var(--border)] rounded-2xl px-5 py-4 text-[var(--text-primary)] placeholder:text-[var(--text-secondary)] focus:outline-none focus:ring-2 focus:ring-[var(--primary)]/20 focus:border-[var(--primary)] transition-all"
                  required
                />
              </div>
            )}

            <div>
              <label className="block text-sm font-bold text-[var(--text-secondary)] mb-1.5 ml-1">Email</label>
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="name@company.com"
                className="w-full bg-[var(--background)] border border-[var(--border)] rounded-2xl px-5 py-4 text-[var(--text-primary)] placeholder:text-[var(--text-secondary)] focus:outline-none focus:ring-2 focus:ring-[var(--primary)]/20 focus:border-[var(--primary)] transition-all"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-bold text-[var(--text-secondary)] mb-1.5 ml-1">Password</label>
              <input
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full bg-[var(--background)] border border-[var(--border)] rounded-2xl px-5 py-4 text-[var(--text-primary)] placeholder:text-[var(--text-secondary)] focus:outline-none focus:ring-2 focus:ring-[var(--primary)]/20 focus:border-[var(--primary)] transition-all"
                required
              />
            </div>

            {error && (
              <div className="bg-[var(--danger)]/10 text-[var(--danger)] text-xs font-bold px-4 py-3 rounded-xl border border-[var(--danger)]/20">
                {error}
              </div>
            )}

            <button
              type="submit"
              className="w-full bg-[var(--primary)] hover:bg-[var(--primary-hover)] text-white py-4 rounded-2xl font-bold text-lg shadow-lg shadow-[var(--primary)]/20 transition-all hover:-translate-y-0.5 active:translate-y-0"
            >
              {isLogin ? "Sign In" : "Create Account"}
            </button>
          </form>

          <div className="mt-8 text-center">
            <button
              onClick={() => { setIsLogin(!isLogin); setName(""); }}
              className="text-[var(--text-secondary)] hover:text-[var(--primary)] text-sm font-bold transition-colors"
            >
              {isLogin ? "New to AdiTask? Create an account" : "Already have an account? Sign in"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
