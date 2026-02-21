import { useEffect, useState, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { authApi } from '../api';
import { useAuth } from '../context/AuthContext';

export default function OAuthCallbackPage() {
    const navigate = useNavigate();
    const location = useLocation();
    const { login } = useAuth();
    const hasAttempted = useRef(false);

    useEffect(() => {
        if (hasAttempted.current) return;
        hasAttempted.current = true;

        const params = new URLSearchParams(location.search);
        const code = params.get('code');
        const state = params.get('state');

        if (!code) {
            navigate('/login', { state: { error: 'Authentication failed. Please try again or use your password.' } });
            return;
        }

        const authenticate = async () => {
            try {
                const data = await authApi.googleCallback(code, state);
                await login(data.access_token);
                navigate('/', { replace: true });
            } catch (err) {
                console.error("OAuth callback failed:", err);
                navigate('/login', { state: { error: 'Authentication failed. Please try again or use your password.' } });
            }
        };

        authenticate();
    }, [location.search, navigate, login]);

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-slate-900 to-black p-4">
            <div className="flex flex-col items-center animate-pulse">
                <div className="w-16 h-16 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin mb-6"></div>
                <h2 className="text-2xl font-bold text-white mb-2">Authenticating...</h2>
                <p className="text-slate-400">Please wait while we securely log you in.</p>
            </div>
        </div>
    );
}
