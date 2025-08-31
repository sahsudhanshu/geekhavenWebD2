import { Mail, Lock, User as UserIcon, ArrowRight } from 'lucide-react';
import { InputField } from './InputField';

interface Props { fullName: string; email: string; password: string; confirmPassword: string; loading: boolean; error: string | null; info: string | null; onChange: (field: string, value: string) => void; onSubmit: (e: React.FormEvent) => void }

const RegisterForm: React.FC<Props> = ({ fullName, email, password, confirmPassword, loading, error, info, onChange, onSubmit }) => (
    <form className="space-y-6" onSubmit={onSubmit}>
        <InputField id="fullname" type="text" placeholder="Full Name" icon={<UserIcon className="h-5 w-5 text-gray-400" />} value={fullName} onChange={(e) => onChange('fullName', e.target.value)} />
        <InputField id="email" type="email" placeholder="Email address" icon={<Mail className="h-5 w-5 text-gray-400" />} value={email} onChange={(e) => onChange('email', e.target.value)} />
        <InputField id="password" type="password" placeholder="Password" icon={<Lock className="h-5 w-5 text-gray-400" />} value={password} onChange={(e) => onChange('password', e.target.value)} />
        <InputField id="confirmPassword" type="password" placeholder="Confirm Password" icon={<Lock className="h-5 w-5 text-gray-400" />} value={confirmPassword} onChange={(e) => onChange('confirmPassword', e.target.value)} />
        {error && <p className="text-sm text-red-600">{error}</p>}
        {info && <p className="text-sm text-green-600">{info}</p>}
        <div>
            <button type="submit" disabled={loading} className="group relative flex w-full justify-center rounded-md px-3 py-3 text-sm font-semibold leading-6 text-white shadow-sm disabled:opacity-60" style={{ background: 'var(--seed-accent)' }}>
                {loading ? 'Creating account…' : 'Create Account'}
                <span className="absolute inset-y-0 right-0 flex items-center pr-3 transition-transform group-hover:translate-x-1">
                    <ArrowRight className="h-5 w-5" aria-hidden="true" />
                </span>
            </button>
        </div>
    </form>
);

export default RegisterForm;