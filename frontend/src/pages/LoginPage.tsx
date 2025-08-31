import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Logo } from '../components/Logo';
import { useAuth } from '../context/authContext';
import API from '../services/useFetch';
import LoginForm from '../components/auth/LoginForm';
import RegisterForm from '../components/auth/RegisterForm';

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
                                            <LoginForm
                                                email={email}
                                                password={password}
                                                loading={loading}
                                                error={error}
                                                info={info}
                                                onChangeEmail={setEmail}
                                                onChangePassword={setPassword}
                                                onSubmit={handleLoginSubmit}
                                            />
                                        ) : (
                                            <RegisterForm
                                                fullName={fullName}
                                                email={email}
                                                password={password}
                                                confirmPassword={confirmPassword}
                                                loading={loading}
                                                error={error}
                                                info={info}
                                                onChange={(field, value) => {
                                                    if (field === 'fullName') setFullName(value);
                                                    if (field === 'email') setEmail(value);
                                                    if (field === 'password') setPassword(value);
                                                    if (field === 'confirmPassword') setConfirmPassword(value);
                                                }}
                                                onSubmit={handleRegisterSubmit}
                                            />
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