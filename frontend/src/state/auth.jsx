import React, { createContext, useContext, useState } from 'react';
import axios from 'axios';

const AuthContext = createContext();
export const useAuth = () => useContext(AuthContext);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);

  const login = async (creds) => {
    const res = await axios.post('http://localhost:4000/api/auth/login', creds);
    const payload = { role: res.data.role, token: res.data.token, userId: res.data.userId };
    setUser(payload);
    return payload;
  };

  const logout = () => { setUser(null); };

  return <AuthContext.Provider value={{ user, login, logout }}>{children}</AuthContext.Provider>;
  
}
