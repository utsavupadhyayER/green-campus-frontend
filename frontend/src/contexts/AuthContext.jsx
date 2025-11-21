import { createContext, useContext, useState, useEffect } from "react";
import api, { setAuthToken } from "../lib/api";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Load user from token
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      setAuthToken(token);

      api.get("/auth/me")
        .then((res) => setUser(res.data))
        .catch(() => setUser(null))
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, []);

  // REGISTER
  const signUp = async (full_name, email, password, role) => {
    const res = await api.post("/auth/register", {
      full_name,
      email,
      password,
      role,
    });

    localStorage.setItem("token", res.data.token);
    setAuthToken(res.data.token);
    setUser(res.data.user);
  };

  // LOGIN
  const signIn = async (email, password) => {
    const res = await api.post("/auth/login", { email, password });
    localStorage.setItem("token", res.data.token);
    setAuthToken(res.data.token);
    setUser(res.data.user);
  };

  const logout = () => {
    localStorage.removeItem("token");
    setAuthToken(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, signUp, signIn, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
