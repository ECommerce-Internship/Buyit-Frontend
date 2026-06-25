// src/context/AuthContext.tsx
import { createContext, useContext, useState, type ReactNode } from 'react';
import type { AuthResponse, User } from '../types/auth';

// The shape of everything the context hands to the rest of the app.
interface AuthContextType {
    user: User | null;
    isAuthenticated: boolean;
    login: (data: AuthResponse) => void;
    logout: () => void;
}

// Create the context. `undefined` default lets us detect "used outside provider".
const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
    // Initialize from localStorage so a page refresh keeps the user logged in.
    // The function form runs only once, on first render.
    const [user, setUser] = useState<User | null>(() => {
        const stored = localStorage.getItem('user');
        return stored ? (JSON.parse(stored) as User) : null;
    });

    // Called after a successful login/register. Saves the session everywhere it must live.
    function login(data: AuthResponse) {
        localStorage.setItem('token', data.accessToken);         // <-- key axiosInstance reads
        localStorage.setItem('refreshToken', data.refreshToken); // for future token refresh
        localStorage.setItem('user', JSON.stringify(data.user)); // objects must be stringified
        setUser(data.user);                                      // re-render app as "logged in"
    }

    // Clears the session. (You'll wire a logout button in a later ticket.)
    function logout() {
        localStorage.removeItem('token');
        localStorage.removeItem('refreshToken');
        localStorage.removeItem('user');
        setUser(null);
    }

    return (
        <AuthContext.Provider value={{ user, isAuthenticated: user !== null, login, logout }}>
            {children}
        </AuthContext.Provider>
    );
}

// Custom hook so pages can do: const { login } = useAuth();
// eslint-disable-next-line react-refresh/only-export-components
export function useAuth() {
    const ctx = useContext(AuthContext);
    if (!ctx) throw new Error('useAuth must be used within an AuthProvider');
    return ctx;
}