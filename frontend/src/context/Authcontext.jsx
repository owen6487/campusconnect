import { createContext, useState, useEffect, useCallback } from "react";
import api, { setUnauthorizedHandler } from "../apis";

export const AuthContext = createContext();

const getTokenExpiryMs = (token) => {
    if (!token) return null;

    try {
        const payload = JSON.parse(atob(token.split(".")[1].replace(/-/g, "+").replace(/_/g, "/")));
        return typeof payload.exp === "number" ? payload.exp * 1000 : null;
    } catch {
        return null;
    }
};

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    const clearSession = useCallback(() => {
        localStorage.removeItem("token");
        setUser(null);
    }, []);

    useEffect(() => {
        setUnauthorizedHandler(() => {
            clearSession();
        });

        return () => setUnauthorizedHandler(null);
    }, [clearSession]);

    const refreshUser = useCallback(async () => {
        const token = localStorage.getItem("token");
        const expiry = token ? getTokenExpiryMs(token) : null;

        if (!token || (expiry !== null && Date.now() >= expiry)) {
            clearSession();
            setLoading(false);
            return null;
        }

        try {
            const response = await api.get("/api/users/me");
            const userData = response.data?.user || null;
            setUser(userData);
            return response;
        } catch (error) {
            console.warn("No active session:", error.response?.status || error.message);
            clearSession();
            throw error;
        }
    }, [clearSession]);

    useEffect(() => {
        refreshUser()
            .catch(() => {})
            .finally(() => setLoading(false));
    }, [refreshUser]);

    const login = useCallback(async (email, password) => {
        const response = await api.post("/api/users/login", { email, password });
        const token = response?.data?.token;
        const userData = response?.data?.user;

        if (token) {
            localStorage.setItem("token", token);
        }

        if (userData) {
            setUser(userData);
        }

        return response;
    }, []);

    const signup = useCallback(async ({ name, email, campus, branch, password }) => {
        const response = await api.post("/api/users/signup", { name, email, campus, branch, password });
        const token = response?.data?.token;
        const userData = response?.data?.user;

        if (token) {
            localStorage.setItem("token", token);
        }

        if (userData) {
            setUser(userData);
        }

        return response;
    }, []);

    const googleLogin = useCallback(async (tokenId) => {
        const response = await api.post("/api/users/google-login", { idToken: tokenId });
        const token = response?.data?.token;
        const userData = response?.data?.user || response?.data || null;

        if (token) {
            localStorage.setItem("token", token);
        }

        if (userData) {
            setUser(userData);
        }

        return response;
    }, []);

    const logout = useCallback(async () => {
        try {
            await api.post("/api/users/logout");
        } catch (error) {
            console.warn("Logout request failed:", error);
        }

        clearSession();
    }, [clearSession]);

    const isadmin = user?.role === "admin" || user?.role === "superadmin";
    const isuser = !!user;
    const isAuthenticated = user !== null;

    return (
        <AuthContext.Provider value={{ user, setUser, refreshUser, login, signup, logout, loading, isadmin, isuser, googleLogin, isAuthenticated }}>
            {children}
        </AuthContext.Provider>
    );
};