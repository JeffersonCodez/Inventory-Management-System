import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Send, KeyRound } from 'lucide-react';
import { useToast } from '../context/ToastContext.jsx';
import * as authApi from '../api/auth.js';
import FormField from '../components/common/FormField.jsx';
import Button from '../components/common/Button.jsx';

const AUTH_CARD_BG = {
  backgroundImage:
    'radial-gradient(circle at 20% 20%, rgba(212,175,55,.06), transparent 40%), radial-gradient(circle at 80% 80%, rgba(212,175,55,.05), transparent 45%)',
};

export default function ForgotPasswordPage() {
  const [step, setStep] = useState('email'); // 'email' -> 'reset'
  const [email, setEmail] = useState('');
  const [code, setCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [resending, setResending] = useState(false);

  const toast = useToast();
  const navigate = useNavigate();

  async function handleEmailSubmit(e) {
    e.preventDefault();
    setSubmitting(true);
    try {
      await authApi.forgotPassword({ email });
      // The backend intentionally returns the same message whether or not
      // this email has an account (see authService.requestPasswordReset) —
      // so the UI always moves forward the same way too. This is what
      // stops the form being usable to check which emails are registered.
      toast('If that email is registered, a reset code was sent', 'ok');
      setStep('reset');
    } catch (err) {
      toast(err.message, 'err');
    } finally {
      setSubmitting(false);
    }
  }

  async function handleResetSubmit(e) {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      toast('Passwords do not match', 'err');
      return;
    }
    setSubmitting(true);
    try {
      await authApi.resetPassword({ email, code, newPassword });
      toast('Password updated — you can now log in', 'ok');
      navigate('/login');
    } catch (err) {
      toast(err.message, 'err');
    } finally {
      setSubmitting(false);
    }
  }

  async function handleResend() {
    setResending(true);
    try {
      await authApi.resendOtp({ email, purpose: 'password_reset' });
      toast('If that email is registered, a new code was sent', 'ok');
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

        {step === 'email' ? (
          <>
            <h1 className="mb-1.5 text-center font-display text-2xl font-semibold">Reset your password</h1>
            <p className="mb-7 text-center text-[13.5px] text-ink-secondary">
              Enter your registered email and we'll send you a reset code
            </p>
            <form onSubmit={handleEmailSubmit}>
              <FormField label="Email">
                <input
                  type="email"
                  className="field-input"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@company.com"
                  autoComplete="email"
                  autoFocus
                />
              </FormField>
              <Button type="submit" variant="gold" icon={Send} className="w-full" disabled={submitting}>
                Send Reset Code
              </Button>
            </form>
          </>
        ) : (
          <>
            <h1 className="mb-1.5 text-center font-display text-2xl font-semibold">Check your email</h1>
            <p className="mb-7 text-center text-[13.5px] text-ink-secondary">
              Enter the code sent to <b className="text-ink">{email}</b>, then choose a new password
            </p>
            <form onSubmit={handleResetSubmit}>
              <FormField label="Reset Code">
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
              <FormField label="New Password">
                <input
                  type="password"
                  className="field-input"
                  required
                  minLength={8}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="At least 8 characters"
                  autoComplete="new-password"
                />
              </FormField>
              <FormField label="Confirm New Password">
                <input
                  type="password"
                  className="field-input"
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Re-enter your new password"
                  autoComplete="new-password"
                />
              </FormField>
              <Button type="submit" variant="gold" icon={KeyRound} className="w-full" disabled={submitting || code.length !== 6}>
                Reset Password
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
          Remembered your password?{' '}
          <Link to="/login" className="font-semibold text-gold-light">
            Log in
          </Link>
        </p>
      </div>
    </div>
  );
}
