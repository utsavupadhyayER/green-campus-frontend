import { createContext, useContext, useState, useEffect } from "react";
import api, { setAuthToken } from "../lib/api";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

useEffect(() => {
  const token = localStorage.getItem("token");
  if (token) {
    setAuthToken(token);

    api.get("/auth/me")
      .then((res) => {
        // normalize: user may be in res.data.user or res.data
        const userData = res.data?.user ?? res.data;
        // attach token so components that read user.token work
        setUser({ ...userData, token });
      })
      .catch((err) => {
        console.error("Auth load failed:", err);
        setUser(null);
      })
      .finally(() => setLoading(false));
  } else {
    setLoading(false);
  }
}, []);

  // // REGISTER
  // const signUp = async (full_name, email, password, role) => {
  //   const res = await api.post("/auth/register", {
  //     full_name,
  //     email,
  //     password,
  //     role,
  //   });

  //   localStorage.setItem("token", res.data.token);
  //   setAuthToken(res.data.token);
  //   setUser(res.data.user);
  // };

  // // LOGIN
  // const signIn = async (email, password) => {
  //   const res = await api.post("/auth/login", { email, password });
  //   localStorage.setItem("token", res.data.token);
  //   setAuthToken(res.data.token);
  //   setUser(res.data.user);
  // };

  // REGISTER
const signUp = async (full_name, email, password, role) => {
  const res = await api.post("/auth/register", {
    full_name, email, password, role,
  });

  const token = res.data.token;
  const userObj = res.data.user ?? res.data;

  localStorage.setItem("token", token);
  setAuthToken(token);
  setUser({ ...userObj, token });
};

// LOGIN
const signIn = async (email, password) => {
  const res = await api.post("/auth/login", { email, password });

  const token = res.data.token;
  const userObj = res.data.user ?? res.data;

  localStorage.setItem("token", token);
  setAuthToken(token);
  setUser({ ...userObj, token });
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
