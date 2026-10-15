import React from 'react'
import { useState, useEffect } from 'react';
import useAuth from '../Hooks/useAuth';
import usePageMeta from '../Hooks/usePageMeta';
import { Link,useNavigate ,useLocation} from 'react-router-dom';
import { GoogleLogin } from '@react-oauth/google';
import logo from '../assets/logo.png';

function Loginpage() {
    usePageMeta({ title: 'Login', noindex: true, description: 'Log in to Campus Connect to buy and sell items with students on your campus.' });
    const {login, googleLogin}= useAuth();
    const[email,setEmail] = useState('');
    const[password,setPassword] = useState('');
    const[showPassword,setShowPassword] = useState(false);
    const[loading,setLoading] = useState(false);
    const[error,seterror] = useState('');
    const navigate = useNavigate();
    const location = useLocation();
    const hasGoogleLogin = !!import.meta.env.VITE_GOOGLE_CLIENT_ID && import.meta.env.VITE_GOOGLE_CLIENT_ID !== 'YOUR_GOOGLE_CLIENT_ID';

    const from = location.state?.from?.pathname || '/';
    

    const redirect = (userData) => {
        if (!userData?.campus) {
            return navigate('/onboarding', { replace: true });
        }

        if (userData.role === 'admin') {
            return navigate('/admin', { replace: true });
        }

        return navigate(from, { replace: true });
    };

    const handleLogin = async (e) => {
        e.preventDefault();
        seterror('');
        setLoading(true);

        try {
            const response = await login(email.trim(), password);
            const userData = response?.data?.user;

            if (!userData) {
                throw new Error('No user returned from login');
            }

            redirect(userData);
        } catch (err) {
            console.error('Error during login:', err);
            seterror(err?.response?.data?.message || 'Login failed. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const handleGoogleLogin = async (credential) => {
        seterror('');
        setLoading(true);
        try {
            const userData = await googleLogin(credential);
            const normalizedUser = userData?.user || userData;

            if (!normalizedUser) {
                throw new Error('No user returned from Google login');
            }

            redirect(normalizedUser);
        } catch (err) {
            console.error('Error during Google login:', err);
            seterror(err?.response?.data?.message || 'Google login failed. Please try again.');
        } finally {
            setLoading(false);
        }
    };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
            <div className="bg-white p-8 w-full max-w-md rounded-sm shadow-[0_4px_24px_rgba(0,0,0,0.04),0_1px_3px_rgba(0,0,0,0.02)] relative">
                <img src={logo} alt="Logo" className='w-32 mx-auto mb-4' />
                <h2 className="text-2xl font-bold mb-6 text-center">Login</h2>
                {error && <p className="text-red-500 mb-4">{error}</p>}
                <form onSubmit={handleLogin}>
                    <div className="flex flex-col mb-4">
                        <label htmlFor="email" className="mb-2 font-semibold">Email</label>
                        <input
                            type="email"
                            id="email"
                            name="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                            className="border border-gray-300 p-2 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                    </div>
                    <div className="flex flex-col mb-6">
                        <label htmlFor="password" className="mb-2 font-semibold">Password</label>
                        <input
                            type={showPassword ? "text" : "password"}
                            id="password"
                            name="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                            className="border border-gray-300 p-2 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                        <div className="mt-2">
                            <input
                                type="checkbox"
                                id="showPassword"
                                checked={showPassword}
                                onChange={() => setShowPassword(!showPassword)}
                            />
                            <label htmlFor="showPassword" className="ml-2">Show Password</label>
                        </div>
                    </div>
                    <Link to="/forgot-password" className="text-blue-500 hover:underline mb-4 block">
                        Forgot Password?
                    </Link>
                    <button
                        type="submit"
                        disabled={loading}
                        className={`w-full py-2 px-4 bg-blue-500 text-white font-semibold rounded hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
                    >
                        {loading ? 'Logging in...' : 'Login'}
                    </button>

                </form>
                {hasGoogleLogin && (
                    <div>
                        <GoogleLogin
                            onSuccess={(credentialResponse) => {
                                handleGoogleLogin(credentialResponse.credential);
                            }}
                            onError={() => {
                                seterror('Google login failed. Please try again.');
                            }}
                        />
                    </div>
                )}
                <p className="mt-4 text-center">
                    Don't have an account?{' '}
                    <Link to="/signup" className="text-blue-500 hover:underline">
                        Sign up
                    </Link>
                </p>
            </div>
        </div>
  );
}

export default Loginpage;
 