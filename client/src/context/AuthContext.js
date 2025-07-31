import { createContext, useContext, useState, useEffect } from "react";
import axios from "axios";
import { signInWithPopup, signOut } from "firebase/auth";
import { auth, googleProvider } from "../firebase";

const API_URL = process.env.REACT_APP_API_URL || "http://localhost:5000";
const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const storedUser = localStorage.getItem("excelProUser");
    if (storedUser) setUser(JSON.parse(storedUser));
    setLoading(false);
  }, []);

  const register = async (userData) => {
    const response = await axios.post(`${API_URL}/api/auth/register`, userData);
    return response.data;
  };

  const login = async ({ email, password }) => {
    const res = await axios.post(
      `${API_URL}/api/auth/login`,
      { email, password },
      {
        withCredentials: true,
        headers: {
          "Content-Type": "application/json",
        },
      }
    );

    const { token, user: userData } = res.data;

    // Save token and user to localStorage
    localStorage.setItem("token", token);
    localStorage.setItem("excelProUser", JSON.stringify(userData));

    setUser(userData);
    return res.data;
  };

  // Google sign in with role selection
  const loginWithGoogle = async (requestedRole = "user", adminCode = null) => {
    try {
      const result = await signInWithPopup(auth, googleProvider);
      const { displayName, email, uid, photoURL } = result.user;

      // Call our backend to create/authenticate the user
      const response = await axios.post(`${API_URL}/api/auth/google`, {
        name: displayName,
        email,
        uid,
        photoURL,
        requestedRole,
        adminCode: adminCode, // Include admin code if provided
      });

      const { token, user: userData } = response.data;

      // Save token and user to localStorage
      localStorage.setItem("token", token);
      localStorage.setItem("excelProUser", JSON.stringify(userData));

      setUser(userData);
      return response.data;
    } catch (error) {
      console.error("Google sign in error:", error);
      throw error;
    }
  };

  const logout = async () => {
    // If user was signed in with Firebase
    try {
      await signOut(auth);
    } catch (error) {
      console.error("Error signing out from Firebase:", error);
    }

    // Clear local storage
    localStorage.removeItem("token");
    localStorage.removeItem("excelProUser");
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        register,
        login,
        loginWithGoogle,
        logout,
        loading,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
