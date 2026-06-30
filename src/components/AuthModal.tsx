import { useEffect, useState } from 'react';
import type { CSSProperties, FormEvent } from 'react';
import { Hoverable } from './ui/Hoverable';
import type { AuthMode, AuthRole } from '../types/landing';
import axios from 'axios';
import axiosInstance from '../api/axiosInstance';
import { registerSeller, becomeSeller } from '../api/stores';
import { useAuth } from '../context/AuthContext';
import type { AuthResponse } from '../types/auth';
import buyitIcon from '../assets/buyit-icon.png';
import buyitWordmark from '../assets/buyit-wordmark.png';

interface Props {
  initialMode: AuthMode;
  initialRole: AuthRole;
  onClose: () => void;
}

type Errors = Partial<Record<'email' | 'password' | 'firstName' | 'lastName' | 'storeName', string>>;

const strengthColors = ['#ff5d7a', '#ff9a4c', '#ffd23d', '#8be36b', '#4ade80'];
const strengthLabels = ['Too short', 'Weak', 'Fair', 'Good', 'Strong'];

const segBase: CSSProperties = { flex: 1, padding: 9, fontFamily: 'inherit', fontSize: 13.5, fontWeight: 600, border: 'none', borderRadius: 10, cursor: 'pointer', transition: 'all .2s' };
const segActive: CSSProperties = { ...segBase, background: 'linear-gradient(120deg,#8b5cf6,#6366f1)', color: '#fff', boxShadow: '0 6px 16px -6px rgba(124,58,237,.7)' };
const segIdle: CSSProperties = { ...segBase, background: 'transparent', color: 'rgba(255,255,255,0.6)' };

const fieldStyle = (hasErr: boolean, extra: CSSProperties = {}): CSSProperties => ({
  width: '100%', padding: '12px 13px', fontSize: 14.5, fontFamily: 'inherit', color: '#fff',
  background: 'rgba(255,255,255,0.05)', border: `1px solid ${hasErr ? '#ff5d7a' : 'rgba(255,255,255,0.13)'}`,
  borderRadius: 12, outline: 'none', transition: 'border-color .15s, box-shadow .15s', ...extra,
});
const focusStyle: CSSProperties = { borderColor: '#8b6cff', boxShadow: '0 0 0 3px rgba(139,108,255,0.2)' };

function strengthScore(pw: string) {
  let s = 0;
  if (pw.length >= 8) s++;
  if (/[A-Z]/.test(pw) && /[a-z]/.test(pw)) s++;
  if (/\d/.test(pw)) s++;
  if (/[^A-Za-z0-9]/.test(pw)) s++;
  return s;
}

function EyeIcon({ off }: { off: boolean }) {
  if (off) {
    return (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M10.6 6.1A9.8 9.8 0 0 1 12 6c6.4 0 10 7 10 7a17.6 17.6 0 0 1-3 3.6M6.5 7.5C3.7 9.2 2 12 2 12s3.6 7 10 7a9.7 9.7 0 0 0 4-.9" />
        <path d="M9.9 9.9a3 3 0 0 0 4.2 4.2" /><path d="M3 3l18 18" />
      </svg>
    );
  }
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M2 12s3.6-7 10-7 10 7 10 7-3.6 7-10 7-10-7-10-7Z" /><circle cx="12" cy="12" r="3" />
    </svg>
  );
}

const labelStyle: CSSProperties = { display: 'block', marginBottom: 6, fontSize: 13, fontWeight: 500, color: 'rgba(255,255,255,0.72)' };
const FieldError = ({ msg }: { msg?: string }) => (
  <div style={{ minHeight: 16, marginTop: 5 }}>{msg ? <span style={{ fontSize: 12, color: '#ff6d84' }}>{msg}</span> : null}</div>
);

export function AuthModal({ initialMode, initialRole, onClose }: Props) {
  const [mode, setMode] = useState<AuthMode>(initialMode);
  const [role, setRole] = useState<AuthRole>(initialRole);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [phone, setPhone] = useState('');
  const [storeName, setStoreName] = useState('');
  const [storeDescription, setStoreDescription] = useState('');
  const [errors, setErrors] = useState<Errors>({});
  const [formError, setFormError] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [showPass, setShowPass] = useState(false);
  const { login, user, isAuthenticated } = useAuth(); // login() stores token + user after a real auth call

  // Esc to close.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  const isLogin = mode === 'login';
  const isRegister = mode === 'register';
  const isSeller = role === 'seller';
  // A logged-in user on the seller sign-up tab is UPGRADING an existing account (TB-139),
  // not creating a new one: we already know their identity, so we only ask for store details
  // and call become-seller instead of register-seller.
  const isSellerUpgrade = isRegister && isSeller && isAuthenticated;
  const score = strengthScore(password);

  const resetMsgs = () => { setErrors({}); setFormError(''); };
  const clearErr = (k: keyof Errors) => setErrors((e) => ({ ...e, [k]: '' }));

  function validate(): Errors {
    const e: Errors = {};
    // When a logged-in customer is upgrading, we only need the store name — their email,
    // password and name already exist, so those fields aren't shown and aren't validated.
    if (isSellerUpgrade) {
      if (!storeName.trim()) e.storeName = 'Store name is required.';
      return e;
    }
    if (!email.trim()) e.email = 'Email is required.';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) e.email = 'Enter a valid email.';
    if (!password) e.password = 'Password is required.';
    else if (isRegister && password.length < 8) e.password = 'Use at least 8 characters.';
    if (isRegister) {
      if (!firstName.trim()) e.firstName = 'Required.';
      if (!lastName.trim()) e.lastName = 'Required.';
      if (isSeller && !storeName.trim()) e.storeName = 'Store name is required.';
    }
    return e;
  }

    // TB-56 wired login + buyer registration; TB-139 wires the real seller path. The Google
    // button (SSO ticket) is intentionally left mocked — it is not part of these tickets.
    async function submit(ev: FormEvent) {
        ev.preventDefault();
        const e = validate();
        if (Object.keys(e).length) { setErrors(e); setFormError('Please fix the highlighted fields.'); return; }
        setErrors({}); setFormError(''); setLoading(true);

        // TB-139: real seller onboarding. Two shapes, same outcome (logged in as a Seller with a
        // Pending store): a brand-new visitor REGISTERS (register-seller); a logged-in customer
        // UPGRADES (become-seller). Both return an AuthResponse, so login(...) stores the token
        // and AuthContext redirects the Seller to /seller. We only send a description when typed.
        if (isRegister && isSeller) {
            const desc = storeDescription.trim() ? { storeDescription: storeDescription.trim() } : {};
            try {
                const data = isSellerUpgrade
                    ? await becomeSeller({ storeName, ...desc })
                    : await registerSeller({ firstName, lastName, email, password, storeName, ...desc });
                login(data);      // store tokens + user; AuthContext redirects a Seller to /seller
                setSuccess(true); // show the existing "Store created — Pending review" success panel
            } catch (err) {
                // Backend errors are RFC-7807 ProblemDetails; the human message is in `detail`.
                const message = axios.isAxiosError<{ detail?: string }>(err)
                    ? err.response?.data?.detail ?? 'Something went wrong. Please try again.'
                    : 'Something went wrong. Please try again.';
                setFormError(message);
            } finally {
                setLoading(false); // stop the spinner whether we succeeded or failed
            }
            return; // don't fall through into the buyer/login code below
        }

        try {
            // Log in OR register a buyer, depending on the active tab.
            const res = isLogin
                ? await axiosInstance.post<AuthResponse>('/api/v1/auth/login', { email, password })
                : await axiosInstance.post<AuthResponse>('/api/v1/auth/register', {
                    firstName,
                    lastName,
                    email,
                    password,
                    // phone is optional: only include it when the user actually typed one.
                    ...(phone.trim() ? { phoneNumber: phone.trim() } : {}),
                });

            login(res.data);   // store token (key 'token') + refreshToken + user via AuthContext
            setSuccess(true);  // show the design's existing success panel
        } catch (err) {
            // Backend errors arrive as RFC-7807 ProblemDetails; the message is in `detail`.
            const message = axios.isAxiosError<{ detail?: string }>(err)
                ? err.response?.data?.detail ?? 'Something went wrong. Please try again.'
                : 'Something went wrong. Please try again.';
            setFormError(message); // surface it in the modal's existing inline error region
        } finally {
            setLoading(false); // turn the button's spinner off whether we succeeded or failed
        }
    }

  // TB-133: start the real Google OAuth flow. This is a FULL-PAGE navigation (not Axios) because
  // Google must take over the top-level browser to show its consent screen and set its cookies.
  function handleGoogleLogin() {
    const apiUrl = import.meta.env.VITE_API_URL;
    if (!apiUrl) {
      setFormError('Google sign-in is unavailable right now. Please try again later.');
      return;
    }
    window.location.href = `${apiUrl}/api/auth/login/google`;
  }

  const successTitle = isLogin ? 'Welcome back!' : (isSeller ? 'Store created' : 'Account created');
  const successMessage = isLogin
    ? 'You\u2019re signed in. Time to explore the marketplace.'
    : (isSeller ? 'Your store is now Pending review \u2014 an admin will approve it shortly.'
                : 'Your Buyit account is ready. Start shopping across every store.');
  const authHeading = isLogin ? 'Sign in to Buyit' : (isSeller ? 'Create your seller account' : 'Create your Buyit account');
  const authSub = isLogin ? 'Welcome back \u2014 let\u2019s get you shopping.'
    : (isSeller ? 'Launch your store on the marketplace.' : 'Join millions shopping across every store.');
  const submitLabel = isLogin ? 'Sign in' : (isSeller ? 'Create store' : 'Create account');

  return (
    <div
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label="Buyit authentication"
      style={{ position: 'fixed', inset: 0, zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20, background: 'rgba(6,5,12,0.66)', backdropFilter: 'blur(8px)', WebkitBackdropFilter: 'blur(8px)', animation: 'authFade .25s ease' }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="auth-shell"
        style={{ width: '100%', maxWidth: '30rem', maxHeight: '92vh', overflowY: 'auto', background: 'linear-gradient(168deg, rgba(28,25,48,0.96), rgba(13,12,24,0.97))', border: '1px solid rgba(255,255,255,0.13)', borderRadius: 26, boxShadow: '0 40px 100px -30px rgba(124,58,237,0.5)', padding: 32 }}
      >
        {success ? (
          <div style={{ textAlign: 'center', padding: '24px 8px' }}>
            <div style={{ width: 66, height: 66, margin: '0 auto 20px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'linear-gradient(135deg, rgba(74,222,128,0.25), rgba(34,211,238,0.18))', border: '1px solid rgba(74,222,128,0.5)', color: '#6ee7a0' }}>
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round"><path d="M20 6 9 17l-5-5" /></svg>
            </div>
            <h2 style={{ margin: '0 0 8px', fontFamily: 'Outfit', fontSize: 23, fontWeight: 700, color: '#fff' }}>{successTitle}</h2>
            <p style={{ margin: '0 0 26px', fontSize: 14.5, lineHeight: 1.55, color: 'rgba(255,255,255,0.6)' }}>{successMessage}</p>
            <button onClick={onClose} style={{ width: '100%', padding: 14, fontFamily: 'inherit', fontSize: 15, fontWeight: 600, color: '#fff', border: 'none', borderRadius: 13, cursor: 'pointer', background: 'linear-gradient(120deg, #8b5cf6, #6366f1)' }}>Done</button>
          </div>
        ) : (
          <div>
            {/* Header */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 22 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 9 }}>
                <img src={buyitIcon} alt="" aria-hidden style={{ height: 28, width: 'auto', display: 'block' }} />
                <img src={buyitWordmark} alt="Buyit" style={{ height: 19, width: 'auto', display: 'block' }} />
              </div>
              <Hoverable as="button" onClick={onClose} aria-label="Close"
                style={{ width: 34, height: 34, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.12)', borderRadius: 10, color: 'rgba(255,255,255,0.7)', cursor: 'pointer' }}
                hoverStyle={{ color: '#fff' }}>
                <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M6 6l12 12M18 6 6 18" /></svg>
              </Hoverable>
            </div>

            {/* Login / Register tabs */}
            <div style={{ display: 'flex', gap: 4, padding: 4, borderRadius: 13, background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.09)', marginBottom: 14 }}>
              <button onClick={() => { setMode('login'); resetMsgs(); }} style={isLogin ? segActive : segIdle}>Log in</button>
              <button onClick={() => { setMode('register'); resetMsgs(); }} style={isRegister ? segActive : segIdle}>Sign up</button>
            </div>

            {/* Buyer / Seller segmented (register only) */}
            {isRegister && (
              <div style={{ display: 'flex', gap: 4, padding: 4, borderRadius: 13, background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.09)', marginBottom: 18 }}>
                <button onClick={() => { setRole('buyer'); resetMsgs(); }} style={!isSeller ? segActive : segIdle}>&#128722; I'm a Buyer</button>
                <button onClick={() => { setRole('seller'); resetMsgs(); }} style={isSeller ? segActive : segIdle}>&#127978; I'm a Seller</button>
              </div>
            )}

            <h2 style={{ margin: '0 0 4px', fontFamily: 'Outfit', fontSize: 22, fontWeight: 700, letterSpacing: '-0.01em', color: '#fff' }}>{authHeading}</h2>
            <p style={{ margin: '0 0 20px', fontSize: 13.5, color: 'rgba(255,255,255,0.5)' }}>{authSub}</p>

            {/* TB-133: real Google OAuth — full-page redirect to the backend login endpoint */}
            <Hoverable as="button" onClick={handleGoogleLogin}
              style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10, padding: 12, marginBottom: 18, fontFamily: 'inherit', fontSize: 14.5, fontWeight: 600, color: '#fff', background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.16)', borderRadius: 12, cursor: 'pointer', transition: 'background .15s' }}
              hoverStyle={{ background: 'rgba(255,255,255,0.12)' }}>
              <svg width="18" height="18" viewBox="0 0 24 24"><path fill="#4285F4" d="M22.5 12.2c0-.7-.06-1.4-.18-2.06H12v3.9h5.9a5 5 0 0 1-2.18 3.3v2.74h3.52c2.06-1.9 3.26-4.7 3.26-7.88z" /><path fill="#34A853" d="M12 23c2.94 0 5.42-.97 7.22-2.64l-3.52-2.74c-.98.66-2.23 1.05-3.7 1.05-2.85 0-5.26-1.92-6.12-4.5H2.24v2.83A11 11 0 0 0 12 23z" /><path fill="#FBBC05" d="M5.88 14.17a6.6 6.6 0 0 1 0-4.34V7H2.24a11 11 0 0 0 0 9.99z" /><path fill="#EA4335" d="M12 5.16c1.6 0 3.04.55 4.17 1.63l3.12-3.12C17.42 1.9 14.94.9 12 .9A11 11 0 0 0 2.24 7l3.64 2.83C6.74 7.25 9.15 5.16 12 5.16z" /></svg>
              Continue with Google
            </Hoverable>

            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 18 }}>
              <span style={{ flex: 1, height: 1, background: 'rgba(255,255,255,0.1)' }} />
              <span style={{ fontSize: 12, color: 'rgba(255,255,255,0.4)' }}>or</span>
              <span style={{ flex: 1, height: 1, background: 'rgba(255,255,255,0.1)' }} />
            </div>

            {/* `key` remounts the form when switching mode/role, matching the source's formKey */}
            <form onSubmit={submit} noValidate key={`${mode}-${role}`} style={{ animation: 'authFade .3s ease' }}>
              {/* Logged-in customer upgrading: skip identity fields, show who's being upgraded. */}
              {isSellerUpgrade && (
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: 9, marginBottom: 16, padding: '11px 13px', borderRadius: 12, background: 'rgba(139,108,255,0.1)', border: '1px solid rgba(139,108,255,0.28)' }}>
                  <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="#b9a9ff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ flex: 'none', marginTop: 1 }}><path d="M20 6 9 17l-5-5" /></svg>
                  <span style={{ fontSize: 12.5, lineHeight: 1.45, color: '#cbbcff' }}>Upgrading <strong style={{ color: '#e3dbff' }}>{user?.email}</strong> to a seller account — just name your first store below.</span>
                </div>
              )}

              {isRegister && !isSellerUpgrade && (
                <div className="name-row" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                  <div>
                    <label htmlFor="af-first" style={labelStyle}>First name</label>
                    <Hoverable as="input" id="af-first" className="buyit-input" type="text" value={firstName}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) => { setFirstName(e.target.value); clearErr('firstName'); }}
                      placeholder="Jane" style={fieldStyle(!!errors.firstName)} focusStyle={focusStyle} />
                    <FieldError msg={errors.firstName} />
                  </div>
                  <div>
                    <label htmlFor="af-last" style={labelStyle}>Last name</label>
                    <Hoverable as="input" id="af-last" className="buyit-input" type="text" value={lastName}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) => { setLastName(e.target.value); clearErr('lastName'); }}
                      placeholder="Doe" style={fieldStyle(!!errors.lastName)} focusStyle={focusStyle} />
                    <FieldError msg={errors.lastName} />
                  </div>
                </div>
              )}

              {!isSellerUpgrade && (
              <div>
                <label htmlFor="af-email" style={labelStyle}>Email</label>
                <Hoverable as="input" id="af-email" className="buyit-input" type="email" value={email}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => { setEmail(e.target.value); clearErr('email'); }}
                  placeholder="you@example.com" style={fieldStyle(!!errors.email)} focusStyle={focusStyle} />
                <FieldError msg={errors.email} />
              </div>
              )}

              {!isSellerUpgrade && (
              <div>
                <label htmlFor="af-pass" style={labelStyle}>Password</label>
                <div style={{ position: 'relative' }}>
                  <Hoverable as="input" id="af-pass" className="buyit-input" type={showPass ? 'text' : 'password'} value={password}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => { setPassword(e.target.value); clearErr('password'); }}
                    placeholder={isRegister ? 'At least 8 characters' : 'Enter your password'}
                    style={fieldStyle(!!errors.password, { paddingRight: 44 })} focusStyle={focusStyle} />
                  <Hoverable as="button" type="button" onClick={() => setShowPass((v) => !v)} aria-label="Toggle password"
                    style={{ position: 'absolute', right: 8, top: '50%', transform: 'translateY(-50%)', width: 32, height: 32, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'transparent', border: 'none', borderRadius: 8, color: 'rgba(255,255,255,0.5)', cursor: 'pointer' }}
                    hoverStyle={{ color: '#b9a9ff' }}>
                    <EyeIcon off={showPass} />
                  </Hoverable>
                </div>
                {isRegister && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 9 }}>
                    <div style={{ flex: 1, display: 'flex', gap: 4 }}>
                      {[0, 1, 2, 3].map((i) => (
                        <span key={i} style={{ flex: 1, height: 4, borderRadius: 2, background: i < score ? strengthColors[score] : 'rgba(255,255,255,0.12)', transition: 'background .25s' }} />
                      ))}
                    </div>
                    <span style={{ fontSize: 11.5, fontWeight: 600, color: password ? strengthColors[score] : 'rgba(255,255,255,0.4)' }}>
                      {password ? strengthLabels[score] : ''}
                    </span>
                  </div>
                )}
                <FieldError msg={errors.password} />
              </div>
              )}

              {/* Buyer-only phone */}
              {isRegister && !isSeller && (
                <div>
                  <label htmlFor="af-phone" style={labelStyle}>Phone <span style={{ color: 'rgba(255,255,255,0.4)', fontWeight: 400 }}>(optional)</span></label>
                  <Hoverable as="input" id="af-phone" className="buyit-input" type="tel" value={phone}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setPhone(e.target.value)}
                    placeholder="+1 555 000 1234" style={fieldStyle(false)} focusStyle={focusStyle} />
                  <div style={{ minHeight: 8 }} />
                </div>
              )}

              {/* Seller-only store fields */}
              {isRegister && isSeller && (
                <div>
                  <div>
                    <label htmlFor="af-store" style={labelStyle}>Store name</label>
                    <Hoverable as="input" id="af-store" className="buyit-input" type="text" value={storeName}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) => { setStoreName(e.target.value); clearErr('storeName'); }}
                      placeholder="e.g. Nova Tech" style={fieldStyle(!!errors.storeName)} focusStyle={focusStyle} />
                    <FieldError msg={errors.storeName} />
                  </div>
                  <div>
                    <label htmlFor="af-desc" style={labelStyle}>Store description <span style={{ color: 'rgba(255,255,255,0.4)', fontWeight: 400 }}>(optional)</span></label>
                    <Hoverable as="textarea" id="af-desc" className="buyit-input" value={storeDescription}
                      onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setStoreDescription(e.target.value)}
                      placeholder="What does your store sell?" rows={2}
                      style={fieldStyle(false, { resize: 'vertical', minHeight: 60, lineHeight: 1.45 })} focusStyle={focusStyle} />
                  </div>
                  <div style={{ display: 'flex', alignItems: 'flex-start', gap: 9, margin: '4px 0 16px', padding: '11px 13px', borderRadius: 12, background: 'rgba(255,178,77,0.1)', border: '1px solid rgba(255,178,77,0.28)' }}>
                    <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="#ffb24d" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ flex: 'none', marginTop: 1 }}><circle cx="12" cy="12" r="9" /><path d="M12 8v5M12 16.5v.01" /></svg>
                    <span style={{ fontSize: 12.5, lineHeight: 1.45, color: '#ffcd8a' }}>Your store starts as <strong style={{ color: '#ffdfae' }}>Pending</strong> until an admin approves it.</span>
                  </div>
                </div>
              )}

              {isLogin && (
                <div style={{ textAlign: 'right', margin: '-4px 0 14px' }}>
                  <Hoverable as="a" href="#" onClick={(e: React.MouseEvent) => e.preventDefault()}
                    style={{ fontSize: 13, textDecoration: 'none', color: 'rgba(255,255,255,0.55)' }} hoverStyle={{ color: '#b9a9ff' }}>
                    Forgot password?
                  </Hoverable>
                </div>
              )}

              {formError && (
                <div style={{ marginBottom: 14, padding: '11px 13px', borderRadius: 11, background: 'rgba(255,93,122,0.12)', border: '1px solid rgba(255,93,122,0.3)', fontSize: 13, color: '#ff8fa3' }}>{formError}</div>
              )}

              <button type="submit" disabled={loading}
                style={{ width: '100%', padding: 14, fontFamily: 'inherit', fontSize: 15, fontWeight: 600, color: '#fff', border: 'none', borderRadius: 13, cursor: loading ? 'wait' : 'pointer', background: 'linear-gradient(120deg,#ff8a4c,#ff4d6d)', boxShadow: '0 12px 30px -10px rgba(255,77,109,.6)', opacity: loading ? 0.8 : 1, transition: 'transform .15s, box-shadow .2s' }}>
                {loading ? (
                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: 9 }}>
                    <span style={{ width: 16, height: 16, borderRadius: '50%', border: '2px solid rgba(255,255,255,0.4)', borderTopColor: '#fff', animation: 'spin .7s linear infinite' }} />
                    Please wait&hellip;
                  </span>
                ) : (
                  <span>{submitLabel}</span>
                )}
              </button>
            </form>

            <p style={{ margin: '18px 0 0', textAlign: 'center', fontSize: 13.5, color: 'rgba(255,255,255,0.55)' }}>
              {isLogin ? 'New to Buyit?' : 'Already have an account?'}{' '}
              <button onClick={() => { setMode(isLogin ? 'register' : 'login'); resetMsgs(); }}
                style={{ background: 'none', border: 'none', padding: 0, fontFamily: 'inherit', fontSize: 13.5, fontWeight: 600, cursor: 'pointer', backgroundImage: 'linear-gradient(120deg, #c4b5fd, #ff9aa9)', WebkitBackgroundClip: 'text', backgroundClip: 'text', WebkitTextFillColor: 'transparent', color: 'transparent' }}>
                {isLogin ? 'Create an account' : 'Sign in'}
              </button>
            </p>

            {/* TB-139: secondary "become a seller" entry point — hidden when already on the seller tab. */}
            {!isSeller && (
              <p style={{ margin: '10px 0 0', textAlign: 'center', fontSize: 13 }}>
                <button
                  onClick={() => { setMode('register'); setRole('seller'); resetMsgs(); }}
                  style={{ background: 'none', border: 'none', padding: 0, fontFamily: 'inherit', fontSize: 13, fontWeight: 600, cursor: 'pointer', color: '#ff9a4c' }}
                >
                  Want to sell? Become a seller &rarr;
                </button>
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
