import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { LogIn } from 'lucide-react';
import { useAuth } from '../context/AuthContext.jsx';
import { useToast } from '../context/ToastContext.jsx';
import * as authApi from '../api/auth.js';
import FormField from '../components/common/FormField.jsx';
import Button from '../components/common/Button.jsx';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);
  // Set only when login fails specifically because the account exists but
  // hasn't been verified yet (a 403 from the backend — see
  // authController.login) — lets the form offer a "resend code" action
  // instead of just repeating "try again".
  const [unverifiedEmail, setUnverifiedEmail] = useState(null);
  const { login, loading } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();

  async function handleSubmit(e) {
    e.preventDefault();
    setSubmitting(true);
    setUnverifiedEmail(null);
    try {
      const user = await login(email, password);
      toast(`Welcome back, ${user.name.split(' ')[0]}`, 'ok');
      navigate('/');
    } catch (err) {
      if (err.status === 403) {
        setUnverifiedEmail(email);
      } else {
        toast(err.message || 'Log in failed — check the API is running', 'err');
      }
    } finally {
      setSubmitting(false);
    }
  }

  async function handleResend() {
    try {
      await authApi.resendOtp({ email: unverifiedEmail, purpose: 'signup' });
      toast('Verification code sent — check your email', 'ok');
      navigate(`/signup?email=${encodeURIComponent(unverifiedEmail)}&step=verify`);
    } catch (err) {
      toast(err.message, 'err');
    }
  }

  const busy = loading || submitting;

  return (
    <div
      className="flex min-h-screen items-center justify-center bg-bg p-6"
      style={{
        backgroundImage:
          'radial-gradient(circle at 20% 20%, rgba(212,175,55,.06), transparent 40%), radial-gradient(circle at 80% 80%, rgba(212,175,55,.05), transparent 45%)',
      }}
    >
      <div className="w-full max-w-[400px] animate-riseIn rounded-card border border-border bg-card p-11 px-9 shadow-card">
        <div className="mb-7 flex items-center justify-center gap-2.5">
          <div className="h-3.5 w-3.5 rotate-45 bg-gold" />
          <span className="font-display text-[22px] font-semibold tracking-wide">LEDGER</span>
        </div>
        <h1 className="mb-1.5 text-center font-display text-2xl font-semibold">Welcome back</h1>
        <p className="mb-7 text-center text-[13.5px] text-ink-secondary">Log in to manage your inventory</p>

        {unverifiedEmail ? (
          <div className="mb-4 rounded-control border border-gold-dim bg-gold/10 px-3.5 py-3 text-[13px] text-gold-light">
            This account hasn't verified its email yet.{' '}
            <button type="button" onClick={handleResend} className="font-semibold underline underline-offset-2">
              Resend the verification code
            </button>
            .
          </div>
        ) : null}

        <form onSubmit={handleSubmit}>
          <FormField label="Email">
            <input
              type="email"
              className="field-input"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@company.com"
              autoComplete="email"
            />
          </FormField>
          <FormField label="Password">
            <input
              type="password"
              className="field-input"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              autoComplete="current-password"
            />
          </FormField>
          <Button type="submit" variant="gold" icon={LogIn} className="w-full" disabled={busy}>
            Log in
          </Button>
        </form>

        <div className="mt-4 flex items-center justify-between text-[13px]">
          <Link to="/signup" className="text-ink-secondary hover:text-gold-light">
            Sign Up
          </Link>
          <Link to="/forgot-password" className="text-ink-secondary hover:text-gold-light">
            Forgot Password?
          </Link>
        </div>
      </div>
    </div>
  );
}
