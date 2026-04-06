"use client";

import { createContext, useContext, useState, useEffect, ReactNode } from "react";

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
  users: User[];
  login: (email: string, password: string) => boolean;
  register: (name: string, email: string, password: string, categories: Category[]) => boolean;
  logout: () => void;
  error: string;
  setError: (error: string) => void;
  addCategory: (category: Category) => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

const DEFAULT_CATEGORIES: Category[] = [
  { value: "work", label: "Work", color: "#3b82f6" },
  { value: "personal", label: "Personal", color: "#8b5cf6" },
  { value: "shopping", label: "Shopping", color: "#ec4899" },
  { value: "health", label: "Health", color: "#22c55e" },
  { value: "other", label: "Other", color: "#6b7280" },
];

const USERS_KEY = "task-tracker-users";
const PASSWORDS_KEY = "task-tracker-passwords";
const CURRENT_USER_KEY = "task-tracker-current-user";

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [users, setUsers] = useState<User[]>([]);
  const [error, setError] = useState("");

  useEffect(() => {
    const storedUsers = localStorage.getItem(USERS_KEY);
    const storedCurrentUser = localStorage.getItem(CURRENT_USER_KEY);

    if (storedUsers) {
      setUsers(JSON.parse(storedUsers));
    }

    if (storedCurrentUser) {
      try {
        const currentUser = JSON.parse(storedCurrentUser);
        setUser(currentUser);
      } catch {
        localStorage.removeItem(CURRENT_USER_KEY);
      }
    }
  }, []);

  const saveData = (newUsers: User[], newCurrentUser: User | null) => {
    localStorage.setItem(USERS_KEY, JSON.stringify(newUsers));
    if (newCurrentUser) {
      localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(newCurrentUser));
    } else {
      localStorage.removeItem(CURRENT_USER_KEY);
    }
  };

  const login = (email: string, password: string): boolean => {
    const storedPasswords = localStorage.getItem(PASSWORDS_KEY);
    const passwords: Record<string, string> = storedPasswords ? JSON.parse(storedPasswords) : {};

    const normalizedEmail = email.toLowerCase().trim();
    if (passwords[normalizedEmail] !== password) {
      setError("Invalid email or password");
      return false;
    }

    const foundUser = users.find((u) => u.email === normalizedEmail);
    if (foundUser) {
      const userWithCategories = { ...foundUser, categories: foundUser.categories || [] };
      setUser(userWithCategories);
      saveData(users, userWithCategories);
      setError("");
      return true;
    }

    setError("User not found");
    return false;
  };

  const register = (
    name: string,
    email: string,
    password: string,
    categories: Category[]
  ): boolean => {
    const normalizedEmail = email.toLowerCase().trim();

    if (users.some((u) => u.email === normalizedEmail)) {
      setError("Email already registered");
      return false;
    }

    if (!name.trim() || !password) {
      setError("Name and password are required");
      return false;
    }

    if (categories.length === 0) {
      setError("Add at least one category");
      return false;
    }

    const newUser: User = {
      id: Date.now().toString(),
      email: normalizedEmail,
      name: name.trim(),
      categories,
    };

    const newUsers = [...users, newUser];
    const storedPasswords = localStorage.getItem(PASSWORDS_KEY);
    const passwords: Record<string, string> = storedPasswords
      ? JSON.parse(storedPasswords)
      : {};
    passwords[normalizedEmail] = password;

    setUsers(newUsers);
    setUser(newUser);
    localStorage.setItem(PASSWORDS_KEY, JSON.stringify(passwords));
    saveData(newUsers, newUser);
    setError("");
    return true;
  };

  const logout = () => {
    setUser(null);
    saveData(users, null);
  };

  const addCategory = (category: Category) => {
    if (!user) return;
    const currentCategories = user.categories || [];
    const updatedUser = { ...user, categories: [...currentCategories, category] };
    const updatedUsers = users.map((u) =>
      u.id === user.id ? updatedUser : u
    );
    setUser(updatedUser);
    setUsers(updatedUsers);
    saveData(updatedUsers, updatedUser);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        users,
        login,
        register,
        logout,
        error,
        setError,
        addCategory,
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