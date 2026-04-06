"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth, Category, DEFAULT_CATEGORIES } from "@/lib/auth";

const CATEGORY_COLORS = [
  "#3b82f6", // blue
  "#8b5cf6", // purple
  "#ec4899", // pink
  "#22c55e", // green
  "#f97316", // orange
  "#eab308", // yellow
  "#ef4444", // red
  "#06b6d4", // cyan
  "#84cc16", // lime
  "#6b7280", // gray
];

export default function LoginPage() {
  const [isLogin, setIsLogin] = useState(true);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [categories, setCategories] = useState<Category[]>([]);
  const [newCategoryName, setNewCategoryName] = useState("");
  const [newCategoryColor, setNewCategoryColor] = useState(CATEGORY_COLORS[0]);
  const { login, register, error, setError } = useAuth();
  const router = useRouter();

  const addCategory = () => {
    if (!newCategoryName.trim()) return;
    const value = newCategoryName.trim().toLowerCase().replace(/\s+/g, "-");
    const newCat: Category = { value, label: newCategoryName.trim(), color: newCategoryColor };
    setCategories([...categories, newCat]);
    setNewCategoryName("");
    setNewCategoryColor(CATEGORY_COLORS[Math.floor(Math.random() * CATEGORY_COLORS.length)]);
  };

  const removeCategory = (value: string) => {
    setCategories(categories.filter(c => c.value !== value));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (isLogin) {
      const success = login(email, password);
      if (success) {
        router.push("/");
      }
    } else {
      const allCategories = [...categories];
      if (allCategories.length === 0) {
        setError("Add at least one category");
        return;
      }
      const success = register(name, email, password, allCategories);
      if (success) {
        router.push("/");
      }
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-[var(--text-primary)] mb-2"><span className="text-[#FA7315]">Adi</span> Task</h1>
          <p className="text-[var(--text-secondary)]">
            {isLogin ? "Sign in to your account" : "Create your account"}
          </p>
        </div>

        <div className="bg-[var(--surface)] rounded-xl p-6 shadow-xl border border-[var(--border)]">
          <form onSubmit={handleSubmit} className="space-y-4">
            {!isLogin && (
              <>
                <div>
                  <label className="block text-sm text-[var(--text-secondary)] mb-1.5">Name</label>
                  <input
                    type="text"
                    value={name}
                    onChange={e => setName(e.target.value)}
                    placeholder="Your name"
                    className="w-full bg-[var(--background)] border border-[var(--border)] rounded-lg px-4 py-3 text-[var(--text-primary)] placeholder:text-[var(--text-secondary)] focus:outline-none focus:border-[var(--primary)] transition-colors"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm text-[var(--text-secondary)] mb-1.5">
                    Categories <span className="text-[var(--primary)]">*</span>
                  </label>
                  <p className="text-xs text-[var(--text-secondary)] mb-2">Add at least one category for your tasks</p>

                  {/* Added categories */}
                  <div className="flex flex-wrap gap-2 mb-3">
                    {categories.map(cat => (
                      <span
                        key={cat.value}
                        className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-sm"
                        style={{ backgroundColor: cat.color + "20", color: cat.color }}
                      >
                        {cat.label}
                        <button type="button" onClick={() => removeCategory(cat.value)} className="hover:opacity-70">
                          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                          </svg>
                        </button>
                      </span>
                    ))}
                  </div>

                  {/* Add category input */}
                  <div className="space-y-3">
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={newCategoryName}
                        onChange={e => setNewCategoryName(e.target.value)}
                        placeholder="Category name..."
                        className="flex-1 bg-[var(--background)] border border-[var(--border)] rounded-lg px-3 py-2.5 text-sm text-[var(--text-primary)] placeholder:text-[var(--text-secondary)] focus:outline-none focus:border-[var(--primary)] transition-colors"
                        onKeyDown={e => e.key === "Enter" && (e.preventDefault(), addCategory())}
                      />
                      <button
                        type="button"
                        onClick={addCategory}
                        className="px-4 py-2.5 bg-[var(--primary)]/10 rounded-lg text-[var(--primary)] hover:bg-[var(--primary)]/20 transition-all duration-200"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" />
                        </svg>
                      </button>
                    </div>
                    <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-1">
                      <span className="text-[10px] uppercase tracking-wider text-[var(--text-secondary)] font-bold mr-1 flex-shrink-0">Pick Color</span>
                      {CATEGORY_COLORS.map(color => (
                        <button
                          key={color}
                          type="button"
                          onClick={() => setNewCategoryColor(color)}
                          className={`w-7 h-7 rounded-full flex-shrink-0 transition-all duration-200 ${newCategoryColor === color ? "ring-2 ring-white ring-offset-2 ring-offset-[var(--surface)] scale-110" : "hover:scale-105"}`}
                          style={{ backgroundColor: color }}
                        />
                      ))}
                    </div>
                  </div>
                </div>
              </>
            )}

            <div>
              <label className="block text-sm text-[var(--text-secondary)] mb-1.5">Email</label>
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="you@example.com"
                className="w-full bg-[var(--background)] border border-[var(--border)] rounded-lg px-4 py-3 text-[var(--text-primary)] placeholder:text-[var(--text-secondary)] focus:outline-none focus:border-[var(--primary)] transition-colors"
                required
              />
            </div>

            <div>
              <label className="block text-sm text-[var(--text-secondary)] mb-1.5">Password</label>
              <input
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full bg-[var(--background)] border border-[var(--border)] rounded-lg px-4 py-3 text-[var(--text-primary)] placeholder:text-[var(--text-secondary)] focus:outline-none focus:border-[var(--primary)] transition-colors"
                required
              />
            </div>

            {error && (
              <p className="text-[var(--danger)] text-sm">{error}</p>
            )}

            <button
              type="submit"
              className="w-full bg-[var(--primary)] hover:bg-[var(--primary-hover)] text-white py-3 rounded-lg font-semibold transition-colors"
            >
              {isLogin ? "Sign In" : "Create Account"}
            </button>
          </form>

          <div className="mt-6 text-center">
            <button
              onClick={() => { setIsLogin(!isLogin); setName(""); setCategories([]); }}
              className="text-[var(--text-secondary)] hover:text-[var(--primary)] text-sm transition-colors"
            >
              {isLogin ? "Don't have an account? Sign up" : "Already have an account? Sign in"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}