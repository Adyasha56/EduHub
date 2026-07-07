import { createContext, useContext, useEffect, useState } from "react";
import axios from "axios";
import { useQueryClient } from "@tanstack/react-query";

export const AuthContext = createContext();

const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const queryClient = useQueryClient();

  // On app start, check localStorage
  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
  }, []);

  // Listen for logout in other tabs
  useEffect(() => {
    const handleStorageChange = (e) => {
      if (e.key === "token" && e.newValue === null) {
        // Token was removed from another tab, logout this tab too
        setUser(null);
      }
      if (e.key === "user" && e.newValue === null) {
        // User was removed from another tab
        setUser(null);
      }
    };

    window.addEventListener("storage", handleStorageChange);
    return () => window.removeEventListener("storage", handleStorageChange);
  }, []);

  const login = (userData, token) => {
    // Clear admin token to prevent conflicts
    localStorage.removeItem("adminToken");
    localStorage.removeItem("admin");
    
    localStorage.setItem("user", JSON.stringify(userData));
    localStorage.setItem("token", token);
    setUser(userData);
  };

  const logout = async () => {
    try {
      const token = localStorage.getItem("token");
      if (token) {
        // Call logout API
        await axios.post(
          `${import.meta.env.VITE_API_URL}/auth/logout`,
          {},
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
      }
    } catch (err) {
      console.error("Logout API error:", err);
    } finally {
      // Always clear local storage regardless of API response
      localStorage.removeItem("user");
      localStorage.removeItem("token");
      setUser(null);
      queryClient.clear();
    }
  };

  const updateUser = (userData) => {
    localStorage.setItem("user", JSON.stringify(userData));
    setUser(userData);
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, updateUser }}>
      {children}
    </AuthContext.Provider>
  );
};

// This is the missing export that fixes the error
export const useAuth = () => useContext(AuthContext);

export default AuthProvider;