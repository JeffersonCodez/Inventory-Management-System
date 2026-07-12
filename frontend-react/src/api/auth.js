import { api, setToken, clearToken } from './client.js';

export async function login({ email, password }) {
  const data = await api.post('/auth/login', { email, password });
  setToken(data.token);
  return data; // { token, user }
}

// --- Sign Up -----------------------------------------------------------

// Step 1: creates an unverified account and triggers an OTP email. No
// token yet — the account isn't usable until verifySignupOtp succeeds.
export async function register({ name, email, password }) {
  return api.post('/auth/register', { name, email, password });
}

// Step 2: confirming the code logs the user straight in, same shape as
// login() — { token, user } — so AuthContext can treat it identically.
export async function verifySignupOtp({ email, code }) {
  const data = await api.post('/auth/verify-signup', { email, code });
  setToken(data.token);
  return data;
}

// --- Forgot Password -----------------------------------------------------

export async function forgotPassword({ email }) {
  return api.post('/auth/forgot-password', { email });
}

export async function resetPassword({ email, code, newPassword }) {
  return api.post('/auth/reset-password', { email, code, newPassword });
}

// --- Shared resend, used by both flows -----------------------------------

export async function resendOtp({ email, purpose }) {
  return api.post('/auth/resend-otp', { email, purpose });
}

export async function logout() {
  try {
    await api.post('/auth/logout');
  } catch {
    // token may already be invalid/expired — clearing client-side is what matters
  }
  clearToken();
  return true;
}

export async function me() {
  return api.get('/auth/me');
}
