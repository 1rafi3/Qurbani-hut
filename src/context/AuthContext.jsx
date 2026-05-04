"use client";

import { createContext, useContext, useState, useEffect } from "react";
import { useSession, signIn, signOut } from "next-auth/react";

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const { data: session, status } = useSession();

  const saveUser = (nextUser) => {
    setUser(nextUser);
    localStorage.setItem("qurbani_user", JSON.stringify(nextUser));
  };

  useEffect(() => {
    // Check if user is logged in (mocking localStorage persistence)
    const storedUser = localStorage.getItem("qurbani_user");
    if (storedUser) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setUser(JSON.parse(storedUser));
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    // Sync NextAuth session (if present) into our local user shape
    if (session && session.user) {
      const sUser = {
        name: session.user.name || "",
        email: session.user.email || "",
        avatar: session.user.image || session.user.avatar || "",
      };
      // eslint-disable-next-line react-hooks/set-state-in-effect
      saveUser(sUser);
      setLoading(false);
    } else if (status === "unauthenticated") {
      // keep local anonymous state; do not overwrite user unless explicitly logged out
    }
  }, [session, status]);

  const login = async (email, password) => {
    setLoading(true);
    // Mock network request
    await new Promise((resolve) => setTimeout(resolve, 800));

    if (email && password) {
      const mockUser = {
        name: "Test User",
        email,
        avatar: "https://i.pravatar.cc/150?u=" + email,
      };
      saveUser(mockUser);
      setLoading(false);
      return { success: true };
    }
    setLoading(false);
    return { success: false, error: "Invalid credentials" };
  };

  const register = async (name, email, password) => {
    setLoading(true);
    // Mock network request
    await new Promise((resolve) => setTimeout(resolve, 800));

    if (name && email && password) {
      const mockUser = {
        name,
        email,
        avatar: "https://i.pravatar.cc/150?u=" + email,
      };
      saveUser(mockUser);
      setLoading(false);
      return { success: true };
    }
    setLoading(false);
    return { success: false, error: "Missing information" };
  };

  const loginWithGoogle = async () => {
    // Delegate to NextAuth signIn for Google; this will redirect by default
    setLoading(true);
    await signIn("google", { callbackUrl: "/" });
    return { success: true };
  };

  const logout = () => {
    // Clear both local and NextAuth session
    signOut({ callbackUrl: "/" });
    setUser(null);
    localStorage.removeItem("qurbani_user");
  };

  const updateProfile = (name, avatar) => {
    if (user) {
      const updatedUser = { ...user, name, avatar };
      setUser(updatedUser);
      localStorage.setItem("qurbani_user", JSON.stringify(updatedUser));
    }
  };

  const value = {
    user,
    loading,
    login,
    register,
    loginWithGoogle,
    logout,
    updateProfile,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export const useAuth = () => useContext(AuthContext);
