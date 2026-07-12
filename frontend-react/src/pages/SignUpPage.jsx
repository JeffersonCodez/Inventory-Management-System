import { useState } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { Mail, KeyRound } from 'lucide-react';
import { useAuth } from '../context/AuthContext.jsx';
import { useToast } from '../context/ToastContext.jsx';
import * as authApi from '../api/auth.js';
import FormField from '../components/common/FormField.jsx';
import Button from '../components/common/Button.jsx';

// AUTH_CARD_BG matches the gradient LoginPage.jsx uses — kept identical so
// Login / Sign Up / Forgot Password all feel like one continuous flow
// rather than three differently-styled screens.
const AUTH_CARD_BG = {
  backgroundImage:
    'radial-gradient(circle at 20% 20%, rgba(212,175,55,.06), transparent 40%), radial-gradient(circle at 80% 80%, rgba(212,175,55,.05), transparent 45%)',
};

export default function SignUpPage() {
  const [searchParams] = useSearchParams();
  // Arriving here can mean two different things: a fresh signup (step
  // defaults to 'details'), or resuming an abandoned one — the Login
  // page's "resend code" link sends people straight here with
  // ?step=verify&email=... after it already triggered a fresh code, so
  // there's no reason to make them re-type their email and password.
  const [step, setStep] = useState(searchParams.get('step') === 'verify' ? 'verify' : 'details');
  const [name, setName] = useState('');
  const [email, setEmail] = useState(searchParams.get('email') || '');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [code, setCode] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [resending, setResending] = useState(false);

  const { verifySignupOtp } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();

  async function handleDetailsSubmit(e) {
    e.preventDefault();
    if (password !== confirmPassword) {
      toast('Passwords do not match', 'err');
      return;
    }
    setSubmitting(true);
    try {
      await authApi.register({ name, email, password });
      toast('Verification code sent — check your email', 'ok');
      setStep('verify');
    } catch (err) {
      toast(err.message, 'err');
    } finally {
      setSubmitting(false);
    }
  }

  async function handleVerifySubmit(e) {
    e.preventDefault();
    setSubmitting(true);
    try {
      const user = await verifySignupOtp(email, code);
      toast(`Welcome, ${user.name.split(' ')[0]}`, 'ok');
      navigate('/');
    } catch (err) {
      toast(err.message, 'err');
    } finally {
      setSubmitting(false);
    }
  }

  async function handleResend() {
    setResending(true);
    try {
      await authApi.resendOtp({ email, purpose: 'signup' });
      toast('A new code was sent', 'ok');
    } catch (err) {
      toast(err.message, 'err');
    } finally {
      setResending(false);
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-bg p-6" style={AUTH_CARD_BG}>
      <div className="w-full max-w-[400px] animate-riseIn rounded-card border border-border bg-card p-11 px-9 shadow-card">
        <div className="mb-7 flex items-center justify-center gap-2.5">
          <div className="h-3.5 w-3.5 rotate-45 bg-gold" />
          <span className="font-display text-[22px] font-semibold tracking-wide">LEDGER</span>
        </div>

        {step === 'details' ? (
          <>
            <h1 className="mb-1.5 text-center font-display text-2xl font-semibold">Create your account</h1>
            <p className="mb-7 text-center text-[13.5px] text-ink-secondary">
              We'll email you a code to verify it's really you
            </p>
            <form onSubmit={handleDetailsSubmit}>
              <FormField label="Full Name">
                <input
                  className="field-input"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Juan Dela Cruz"
                  autoComplete="name"
                />
              </FormField>
              <FormField label="Email">
                <input
                  type="email"
                  className="field-input"
                  required
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
                  required
                  minLength={8}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="At least 8 characters"
                  autoComplete="new-password"
                />
              </FormField>
              <FormField label="Confirm Password">
                <input
                  type="password"
                  className="field-input"
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Re-enter your password"
                  autoComplete="new-password"
                />
              </FormField>
              <Button type="submit" variant="gold" icon={Mail} className="w-full" disabled={submitting}>
                Send Verification Code
              </Button>
            </form>
          </>
        ) : (
          <>
            <h1 className="mb-1.5 text-center font-display text-2xl font-semibold">Check your email</h1>
            <p className="mb-7 text-center text-[13.5px] text-ink-secondary">
              Enter the 6-digit code we sent to <b className="text-ink">{email}</b>
            </p>
            <form onSubmit={handleVerifySubmit}>
              <FormField label="Verification Code">
                <input
                  className="field-input text-center font-mono text-lg tracking-[0.4em]"
                  required
                  maxLength={6}
                  inputMode="numeric"
                  value={code}
                  onChange={(e) => setCode(e.target.value.replace(/\D/g, ''))}
                  placeholder="000000"
                  autoFocus
                />
              </FormField>
              <Button type="submit" variant="gold" icon={KeyRound} className="w-full" disabled={submitting || code.length !== 6}>
                Verify &amp; Create Account
              </Button>
            </form>
            <button
              type="button"
              onClick={handleResend}
              disabled={resending}
              className="mt-3.5 w-full text-center text-[13px] text-ink-secondary hover:text-gold-light"
            >
              Didn't get a code? Resend
            </button>
          </>
        )}

        <p className="mt-5 text-center text-xs text-ink-muted">
          Already have an account?{' '}
          <Link to="/login" className="font-semibold text-gold-light">
            Log in
          </Link>
        </p>
      </div>
    </div>
  );
}
