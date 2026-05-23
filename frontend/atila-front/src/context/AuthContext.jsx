import React, { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Check for saved user in localStorage on mount
        const savedUser = localStorage.getItem('atila_user');
        const savedToken = localStorage.getItem('atila_token');

        if (savedUser && savedToken) {
            setUser(JSON.parse(savedUser));
        } else {
            // Si falta el token o el usuario (migración a Token Auth), limpiar todo
            localStorage.removeItem('atila_user');
            localStorage.removeItem('atila_token');
            setUser(null);
        }
        setLoading(false);
    }, []);

    const login = (userData, token) => {
        setUser(userData);
        localStorage.setItem('atila_user', JSON.stringify(userData));
        if (token) {
            localStorage.setItem('atila_token', token);
        }
    };

    const logout = () => {
        setUser(null);
        localStorage.removeItem('atila_user');
        localStorage.removeItem('atila_token');
    };

    return (
        <AuthContext.Provider value={{ user, login, logout, loading }}>
            {!loading && children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};
