import React, { createContext, useContext, useState } from 'react';
import { AppUser } from '../types';
import { getUsers } from '../lib/api';

const SESSION_KEY = 'mapeia_session';

interface AuthContextValue {
  user: AppUser | null;
  login: (email: string, password: string) => Promise<{ ok: boolean; error?: string }>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AppUser | null>(() => {
    try {
      const raw = sessionStorage.getItem(SESSION_KEY);
      return raw ? JSON.parse(raw) : null;
    } catch { return null; }
  });

  const login = async (email: string, password: string): Promise<{ ok: boolean; error?: string }> => {
    try {
      // Busca os usuários do KV store usando api.ts
      const users = await getUsers();
      const userFound = users.find(u => u.email === email && u.password === password);
      
      if (userFound) {
        if (userFound.status === 'Inativo') {
          return { ok: false, error: 'Conta inativa. Entre em contato com o administrador do sistema.' };
        }
        setUser(userFound);
        sessionStorage.setItem(SESSION_KEY, JSON.stringify(userFound));
        return { ok: true };
      }
      return { ok: false, error: 'Credenciais inválidas ou e-mail não encontrado.' };
    } catch {
      return { ok: false, error: 'Erro interno de conexão. Tente novamente.' };
    }
  };

  const logout = async () => {
    setUser(null);
    sessionStorage.removeItem(SESSION_KEY);
  };

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider');
  return ctx;
}
