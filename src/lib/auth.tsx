"use client";

import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { supabase } from "./supabase";

export interface Category {
  value: string;
  label: string;
  color: string;
}

export interface User {
  id: string;
  email: string;
  name: string;
  categories: Category[];
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  register: (name: string, email: string, password: string, categories: Category[]) => Promise<boolean>;
  logout: () => Promise<void>;
  error: string;
  setError: (error: string) => void;
  addCategory: (category: Category) => Promise<void>;
  removeCategory: (categoryValue: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

const DEFAULT_CATEGORIES: Category[] = [
  { value: "work", label: "Work", color: "#3b82f6" },
  { value: "personal", label: "Personal", color: "#8b5cf6" },
  { value: "shopping", label: "Shopping", color: "#ec4899" },
  { value: "health", label: "Health", color: "#22c55e" },
  { value: "other", label: "Other", color: "#6b7280" },
];

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    // Check active sessions and sets the user
    const checkUser = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        await fetchProfile(session.user.id);
      }
      setLoading(false);
    };

    checkUser();

    // Listen for changes on auth state (logged in, signed out, etc.)
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
      if (session) {
        await fetchProfile(session.user.id);
      } else {
        setUser(null);
      }
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const fetchProfile = async (userId: string) => {
    const { data, error } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", userId)
      .single();

    if (data) {
      setUser({
        id: data.id,
        email: data.email,
        name: data.name || "",
        categories: data.categories || [],
      });
    } else if (error) {
      console.error("Error fetching profile:", error);
    }
  };

  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        setError(error.message);
        return false;
      }

      setError("");
      return true;
    } catch (err: any) {
      setError(err.message || "An unexpected error occurred");
      return false;
    }
  };

  const register = async (
    name: string,
    email: string,
    password: string,
    categories: Category[]
  ): Promise<boolean> => {
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            name: name.trim(),
          },
        },
      });

      if (error) {
        setError(error.message);
        return false;
      }

      if (data.user) {
        // Categories are handled by the database trigger creating the profile, 
        // but we might want to update them immediately if we want specific categories on signup
        const { error: profileError } = await supabase
          .from("profiles")
          .update({ categories })
          .eq("id", data.user.id);
        
        if (profileError) {
          console.error("Error setting initial categories:", profileError);
        }
      }

      setError("");
      return true;
    } catch (err: any) {
      setError(err.message || "An unexpected error occurred");
      return false;
    }
  };

  const logout = async () => {
    await supabase.auth.signOut();
    setUser(null);
  };

  const addCategory = async (category: Category) => {
    if (!user) return;
    const updatedCategories = [...user.categories, category];
    
    const { error } = await supabase
      .from("profiles")
      .update({ categories: updatedCategories })
      .eq("id", user.id);

    if (error) {
      console.error("Error adding category:", error);
      setError("Failed to add category");
    } else {
      setUser({ ...user, categories: updatedCategories });
    }
  };

  const removeCategory = async (categoryValue: string) => {
    if (!user) return;
    const updatedCategories = user.categories.filter((c) => c.value !== categoryValue);

    const { error } = await supabase
      .from("profiles")
      .update({ categories: updatedCategories })
      .eq("id", user.id);

    if (error) {
      console.error("Error removing category:", error);
      setError("Failed to remove category");
    } else {
      setUser({ ...user, categories: updatedCategories });
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        login,
        register,
        logout,
        error,
        setError,
        addCategory,
        removeCategory,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return context;
}

export { DEFAULT_CATEGORIES };
