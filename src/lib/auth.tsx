import { createContext, useContext, useEffect, useState, type ReactNode } from "react";

export type Role = "student" | "admin" | "client";
export type User = { name: string; email: string; role: Role };

type Ctx = {
  user: User | null;
  login: (u: User) => void;
  logout: () => void;
  ready: boolean;
};

const AuthCtx = createContext<Ctx>({ user: null, login: () => {}, logout: () => {}, ready: false });

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    try {
      const raw = localStorage.getItem("sb_user");
      if (raw) setUser(JSON.parse(raw));
    } catch {}
    setReady(true);
  }, []);

  const login = (u: User) => {
    localStorage.setItem("sb_user", JSON.stringify(u));
    setUser(u);
  };
  const logout = () => {
    localStorage.removeItem("sb_user");
    setUser(null);
  };

  return <AuthCtx.Provider value={{ user, login, logout, ready }}>{children}</AuthCtx.Provider>;
}

export const useAuth = () => useContext(AuthCtx);
