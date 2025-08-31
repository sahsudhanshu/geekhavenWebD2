import { Mail, Lock, ArrowRight } from 'lucide-react';
import { InputField } from './InputField';

interface Props { email: string; password: string; loading: boolean; error: string | null; info: string | null; onChangeEmail: (v: string) => void; onChangePassword: (v: string) => void; onSubmit: (e: React.FormEvent) => void }

const LoginForm: React.FC<Props> = ({ email, password, loading, error, info, onChangeEmail, onChangePassword, onSubmit }) => (
    <form className="space-y-6" onSubmit={onSubmit}>
        <InputField id="email" type="email" placeholder="Email address" icon={<Mail className="h-5 w-5 text-gray-400" />} value={email} onChange={(e) => onChangeEmail(e.target.value)} />
        <InputField id="password" type="password" placeholder="Password" icon={<Lock className="h-5 w-5 text-gray-400" />} value={password} onChange={(e) => onChangePassword(e.target.value)} />
        {error && <p className="text-sm text-red-600">{error}</p>}
        {info && <p className="text-sm text-green-600">{info}</p>}
        <div className="text-right text-sm">
            <a href="#" className="font-semibold text-indigo-600 hover:text-indigo-500 dark:text-sky-400 dark:hover:text-sky-300">Forgot password?</a>
        </div>
        <div>
            <button type="submit" disabled={loading} className="group relative flex w-full justify-center rounded-md px-3 py-3 text-sm font-semibold leading-6 text-white shadow-sm disabled:opacity-60" style={{ background: 'var(--seed-accent)' }}>
                {loading ? 'Signing in…' : 'Sign in'}
                <span className="absolute inset-y-0 right-0 flex items-center pr-3 transition-transform group-hover:translate-x-1">
                    <ArrowRight className="h-5 w-5" aria-hidden="true" />
                </span>
            </button>
        </div>
    </form>
);

export default LoginForm;