import { createContext, useContext, useState, useEffect } from 'react';
import { authApi } from '../api';

const AuthContext = createContext();

export function AuthProvider({ children }) {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    const initAuth = async () => {
        const token = localStorage.getItem('token');
        if (token) {
            try {
                const userData = await authApi.me();
                setUser(userData);
            } catch (err) {
                console.error("Auth init failed:", err);
                localStorage.removeItem('token');
            }
        }
        setLoading(false);
    };

    useEffect(() => {
        initAuth();
    }, []);

    const login = async (email, password) => {
        const data = await authApi.login(email, password);
        localStorage.setItem('token', data.access_token);
        const userData = await authApi.me();
        setUser(userData);
        return userData;
    };

    const logout = async () => {
        try {
            await authApi.logout();
        } catch (e) { 
            // ignore
        }
        localStorage.removeItem('token');
        setUser(null);
    };

    const hasPermission = (permission) => {
        if (!user || !user.role) return false;
        const perms = user.role.permissions || [];
        // Support '*' wildcard for admins
        if (perms.includes('*')) return true;
        return perms.includes(permission);
    };

    const value = {
        user,
        loading,
        login,
        logout,
        hasPermission,
        isAuthenticated: !!user
    };

    return (
        <AuthContext.Provider value={value}>
            {!loading && children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    return useContext(AuthContext);
}
