import React, { createContext, useContext, useState, useEffect, useRef } from 'react';

const AuthContext = createContext();

// Duración de la sesión: 30 minutos en milisegundos
const SESSION_DURATION_MS = 30 * 60 * 1000;

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const logoutTimerRef = useRef(null);

    const clearSession = () => {
        setUser(null);
        localStorage.removeItem('atila_user');
        localStorage.removeItem('atila_token');
        localStorage.removeItem('atila_login_time');
        if (logoutTimerRef.current) {
            clearTimeout(logoutTimerRef.current);
            logoutTimerRef.current = null;
        }
    };

    const scheduleAutoLogout = (loginTime) => {
        if (logoutTimerRef.current) {
            clearTimeout(logoutTimerRef.current);
        }
        const elapsed = Date.now() - loginTime;
        const remaining = SESSION_DURATION_MS - elapsed;

        if (remaining <= 0) {
            // Ya expiró
            clearSession();
            return;
        }

        logoutTimerRef.current = setTimeout(() => {
            clearSession();
        }, remaining);
    };

    useEffect(() => {
        // Verificar sesión guardada al montar
        const savedUser = localStorage.getItem('atila_user');
        const savedToken = localStorage.getItem('atila_token');
        const savedLoginTime = localStorage.getItem('atila_login_time');

        if (savedUser && savedToken && savedLoginTime) {
            const loginTime = parseInt(savedLoginTime, 10);
            const elapsed = Date.now() - loginTime;

            if (elapsed >= SESSION_DURATION_MS) {
                // Sesión expirada mientras la app estaba cerrada
                clearSession();
            } else {
                setUser(JSON.parse(savedUser));
                scheduleAutoLogout(loginTime);
            }
        } else {
            // Si falta algún dato (migración o datos corruptos), limpiar todo
            localStorage.removeItem('atila_user');
            localStorage.removeItem('atila_token');
            localStorage.removeItem('atila_login_time');
            setUser(null);
        }
        setLoading(false);

        // Limpiar timer al desmontar
        return () => {
            if (logoutTimerRef.current) {
                clearTimeout(logoutTimerRef.current);
            }
        };
    }, []);

    const login = (userData, token) => {
        const loginTime = Date.now();
        setUser(userData);
        localStorage.setItem('atila_user', JSON.stringify(userData));
        localStorage.setItem('atila_login_time', String(loginTime));
        if (token) {
            localStorage.setItem('atila_token', token);
        }
        scheduleAutoLogout(loginTime);
    };

    const logout = () => {
        clearSession();
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
