// import React, { useState } from 'react';
// import { useNavigate } from 'react-router-dom';
// import api from '../services/useFetch';
// import { useAuth } from '../context/authContext';
// // import { GoogleLogin } from '@react-oauth/google';

// interface AuthFormProps {
//     isLoginDefault?: boolean;
// }
// const AuthForm: React.FC<AuthFormProps> = ({ isLoginDefault = true }) => {
//     const [isLogin, setIsLogin] = useState(isLoginDefault);
//     const [formData, setFormData] = useState({ name: '', email: '', password: '' });
//     const [error, setError] = useState('');
//     const [loading, setLoading] = useState(false);
//     const { setToken } = useAuth();
//     const navigate = useNavigate();
//     const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
//         setFormData({ ...formData, [e.target.name]: e.target.value });
//     };

//     const handleSubmit = async (e: React.FormEvent) => {
//         e.preventDefault();
//         setLoading(true);
//         setError('');
//         const endpoint = isLogin ? '/api/v1/auth/login' : '/api/v1/auth/register';
//         const payload = isLogin ? { email: formData.email, password: formData.password } : formData;
//         try {
//             const response = await api.post(endpoint, payload);
//             if (isLogin) {
//                 const { token } = response.data;
//                 setToken(token);
//                 localStorage.setItem('token', JSON.stringify(token))
//                 navigate('/');
//             } else {
//                 setIsLogin(true);
//                 setError('Registration successful! Please log in.');
//             }
//         } catch (err: any) {
//             console.log(err)
//             setError(err.response?.data?.message || 'An error occurred.');
//         } finally {
//             setLoading(false);
//         }
//     };

//     // const handleGoogleSuccess = async (credentialResponse: any) => {
//     //     setLoading(true);
//     //     setError('');
//     //     try {
//     //         const res = await api.post('/auth/google', { token: credentialResponse.credential });
//     //         const { token } = res.data;
//     //         setToken(token);
//     //         navigate('/');
//     //     } catch (err: any) {
//     //         setError(err.response?.data?.message || "Google Sign-In failed.");
//     //     } finally {
//     //         setLoading(false);
//     //     }
//     // };

//     return (
//         <div className="flex justify-center items-center min-h-[80vh] bg-gray-50 px-4">
//             <div className="w-full max-w-md p-8 space-y-6 bg-white border border-gray-200 rounded-xl shadow-lg">
//                 <h2 className="text-3xl font-extrabold text-center text-gray-900">
//                     {isLogin ? 'Sign In' : 'Create Your Account'}
//                 </h2>
//                 <form onSubmit={handleSubmit} className="space-y-4">
//                     {!isLogin && (
//                         <div>
//                             <label htmlFor="name" className="block text-sm font-medium text-gray-700">Name</label>
//                             <input id="name" name="name" type="text" autoComplete="name" required onChange={handleChange} className="w-full px-3 py-2 mt-1 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500" autoFocus />
//                         </div>
//                     )}
//                     <div>
//                         <label htmlFor="email" className="block text-sm font-medium text-gray-700">Email Address</label>
//                         <input id="email" name="email" type="email" required onChange={handleChange} className="w-full px-3 py-2 mt-1 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500" autoComplete="email" />
//                     </div>
//                     <div>
//                         <label htmlFor="password" className="block text-sm font-medium text-gray-700">Password</label>
//                         <input id="password" name="password" type="password" required onChange={handleChange} className="w-full px-3 py-2 mt-1 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500" autoComplete={isLogin ? "current-password" : "new-password"} />
//                     </div>
//                     {error && <p className="text-sm text-red-600">{error}</p>}
//                     <button type="submit" disabled={loading} className="w-full py-2 px-4 font-semibold text-gray-900 bg-amber-400 rounded-md hover:bg-amber-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-amber-500 disabled:opacity-50 transition-colors duration-300">
//                         {loading ? 'Processing...' : (isLogin ? 'Sign In' : 'Create Account')}
//                     </button>
//                 </form>
//                 <div className="relative flex items-center justify-center">
//                     <div className="absolute inset-0 flex items-center">
//                         <div className="w-full border-t border-gray-300"></div>
//                     </div>
//                     <div className="relative bg-white px-2 text-sm text-gray-500">OR</div>
//                 </div>
//                 <div className="flex justify-center">
//                     {/* <GoogleLogin onSuccess={handleGoogleSuccess} onError={() => setError('Google Login Failed')} /> */}
//                 </div>
//                 <p className="text-sm text-center text-gray-600">
//                     {isLogin ? "Don't have an account?" : 'Already have an account?'}
//                     <button onClick={() => setIsLogin(!isLogin)} className="ml-1 font-medium text-indigo-600 hover:text-indigo-500">
//                         {isLogin ? 'Sign Up' : 'Sign In'}
//                     </button>
//                 </p>
//             </div>
//         </div>
//     );
// };

// export default AuthForm;

import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Mail, Lock, User as UserIcon, ArrowRight } from 'lucide-react';
import { Logo } from '../components/Logo';
import { InputField } from '../components/InputField';
import { useAuth } from '../context/authContext';
import API from '../services/useFetch';

const AuthPage = ({ initialView }: { initialView: 'login' | 'register' }) => {
    const [isLoginView, setIsLoginView] = useState(initialView === 'login');
    const navigate = useNavigate();
    const { token, setToken, setUserDetails } = useAuth();
    const [fullName, setFullName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [error, setError] = useState<string | null>(null);
    const [info, setInfo] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (token) navigate('/', { replace: true });
    }, [token, navigate]);

    const handleLoginSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null); setInfo(null);
        if (!email || !password) {
            setError('Email and password are required');
            return;
        }
        try {
            setLoading(true);
            const { status, data } = await API.post('/auth/login', { email, password });
            if (status === 200) {
                setToken(data.token);
                setUserDetails({ id: data.id, name: data.name, email: data.email });
                navigate('/', { replace: true });
            } else {
                setError(data?.message || 'Login failed');
            }
        } catch (err: any) {
            setError(err.message || 'Login error');
        } finally {
            setLoading(false);
        }
    };

    const handleRegisterSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null); setInfo(null);
        if (!fullName || !email || !password || !confirmPassword) {
            setError('All fields are required');
            return;
        }
        if (password !== confirmPassword) {
            setError('Passwords do not match');
            return;
        }
        try {
            setLoading(true);
            const { status, data } = await API.post('/auth/register', { name: fullName, email, password });
            if (status === 201) {
                setInfo('Registration successful. Please sign in.');
                setIsLoginView(true);
                navigate('/login', { replace: true });
            } else {
                setError(data?.message || 'Registration failed');
            }
        } catch (err: any) {
            setError(err.message || 'Registration error');
        } finally {
            setLoading(false);
        }
    };

    const toggleView = () => {
        setError(null); setInfo(null);
        setIsLoginView(v => !v);
        const newPath = isLoginView ? '/register' : '/login';
        navigate(newPath, { replace: true });
    };

    return (
        <div className="flex min-h-screen flex-col justify-center items-center bg-gray-50 dark:bg-slate-900 px-4 sm:px-6 lg:px-8 transition-colors duration-300">
            <div className="sm:mx-auto sm:w-full sm:max-w-md">
                <div className="flex justify-center mb-6">
                    <Logo />
                </div>
                <h2 className="text-center text-2xl font-bold leading-9 tracking-tight text-gray-900 dark:text-white">
                    {isLoginView ? 'Sign in to your account' : 'Create your new account'}
                </h2>
            </div>

            <div className="mt-10 sm:mx-auto sm:w-full sm:max-w-md">
                <div className="bg-white dark:bg-slate-800 p-8 shadow-xl rounded-xl">
                    {isLoginView ? (
                        <form className="space-y-6" onSubmit={handleLoginSubmit}>
                            <InputField
                                id="email"
                                type="email"
                                placeholder="Email address"
                                icon={<Mail className="h-5 w-5 text-gray-400" />}
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                            />
                            <InputField
                                id="password"
                                type="password"
                                placeholder="Password"
                                icon={<Lock className="h-5 w-5 text-gray-400" />}
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                            />
                            {error && <p className="text-sm text-red-600">{error}</p>}
                            {info && <p className="text-sm text-green-600">{info}</p>}
                            <div className="text-right text-sm">
                                <a href="#" className="font-semibold text-indigo-600 hover:text-indigo-500 dark:text-sky-400 dark:hover:text-sky-300">
                                    Forgot password?
                                </a>
                            </div>
                            <div>
                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="group relative flex w-full justify-center rounded-md bg-indigo-600 px-3 py-3 text-sm font-semibold leading-6 text-white shadow-sm hover:bg-indigo-500 disabled:opacity-60 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
                                >
                                    {loading ? 'Signing in…' : 'Sign in'}
                                    <span className="absolute inset-y-0 right-0 flex items-center pr-3 transition-transform group-hover:translate-x-1">
                                        <ArrowRight className="h-5 w-5" aria-hidden="true" />
                                    </span>
                                </button>
                            </div>
                        </form>
                    ) : (
                        <form className="space-y-6" onSubmit={handleRegisterSubmit}>
                            <InputField
                                id="fullname"
                                type="text"
                                placeholder="Full Name"
                                icon={<UserIcon className="h-5 w-5 text-gray-400" />}
                                value={fullName}
                                onChange={(e) => setFullName(e.target.value)}
                            />
                            <InputField
                                id="email"
                                type="email"
                                placeholder="Email address"
                                icon={<Mail className="h-5 w-5 text-gray-400" />}
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                            />
                            <InputField
                                id="password"
                                type="password"
                                placeholder="Password"
                                icon={<Lock className="h-5 w-5 text-gray-400" />}
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                            />
                            <InputField
                                id="confirmPassword"
                                type="password"
                                placeholder="Confirm Password"
                                icon={<Lock className="h-5 w-5 text-gray-400" />}
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                            />
                            {error && <p className="text-sm text-red-600">{error}</p>}
                            {info && <p className="text-sm text-green-600">{info}</p>}
                            <div>
                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="group relative flex w-full justify-center rounded-md bg-indigo-600 px-3 py-3 text-sm font-semibold leading-6 text-white shadow-sm hover:bg-indigo-500 disabled:opacity-60 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
                                >
                                    {loading ? 'Creating account…' : 'Create Account'}
                                    <span className="absolute inset-y-0 right-0 flex items-center pr-3 transition-transform group-hover:translate-x-1">
                                        <ArrowRight className="h-5 w-5" aria-hidden="true" />
                                    </span>
                                </button>
                            </div>
                        </form>
                    )}

                    <p className="mt-10 text-center text-sm text-gray-500 dark:text-gray-400">
                        {isLoginView ? "Not a member? " : "Already have an account? "}
                        <button onClick={toggleView} className="font-semibold leading-6 text-indigo-600 hover:text-indigo-500 dark:text-sky-400 dark:hover:text-sky-300">
                            {isLoginView ? 'Create an account' : 'Sign in here'}
                        </button>
                    </p>
                </div>
            </div>
        </div>
    );
};

export default AuthPage;