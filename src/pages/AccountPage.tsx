// src/pages/AccountPage.tsx
import { useState, type CSSProperties, type FormEvent } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import axios from 'axios';
import Logo from '../components/Logo';
import { useAuth } from '../context/AuthContext';
import { useAuthModal } from '../context/AuthModalContext';
import { getMe, updateProfile, changePassword } from '../api/auth';

// Read a backend ProblemDetails message (`detail`), falling back to a generic line.
function errorMessage(err: unknown, fallback: string): string {
    return axios.isAxiosError<{ detail?: string }>(err)
        ? err.response?.data?.detail ?? fallback
        : fallback;
}

export function AccountPage() {
    const queryClient = useQueryClient();
    const { updateUser, logout } = useAuth();
    const { openAuth } = useAuthModal();

    // ---- load the profile ----
    const { data: profile, isLoading, isError } = useQuery({ queryKey: ['me'], queryFn: getMe });

    // ---- profile form state ----
    const [firstName, setFirstName] = useState('');
    const [lastName, setLastName] = useState('');
    const [phone, setPhone] = useState('');
    const [pErrors, setPErrors] = useState<{ firstName?: string; lastName?: string; phone?: string }>({});

    // Seed the form the first time the profile arrives (and again only if a *different*
    // user's profile loads). Done during render via a guard — the React-recommended
    // alternative to calling setState inside an effect, which triggers cascading renders
    // (react-hooks/set-state-in-effect). Guarding on id also avoids clobbering in-progress
    // edits when a background refetch returns the same profile.
    const [seededId, setSeededId] = useState<number | null>(null);
    if (profile && profile.id !== seededId) {
        setSeededId(profile.id);
        setFirstName(profile.firstName);
        setLastName(profile.lastName);
        setPhone(profile.phoneNumber ?? '');
    }

    const saveProfile = useMutation({
        mutationFn: () =>
            updateProfile({
                firstName: firstName.trim(),
                lastName: lastName.trim(),
                phoneNumber: phone.trim() ? phone.trim() : null,
            }),
        onSuccess: (updated) => {
            toast.success('Profile updated!');
            queryClient.setQueryData(['me'], updated);            // refresh the cache
            updateUser({                                          // reflect app-wide
                firstName: updated.firstName,
                lastName: updated.lastName,
                phoneNumber: updated.phoneNumber,
            });
        },
        onError: (err) => toast.error(errorMessage(err, 'Could not update profile.')),
    });

    function validateProfile(): boolean {
        const e: typeof pErrors = {};
        const f = firstName.trim(), l = lastName.trim(), ph = phone.trim();
        if (!f) e.firstName = 'First name is required.';
        else if (f.length > 100) e.firstName = 'First name must be at most 100 characters.';
        if (!l) e.lastName = 'Last name is required.';
        else if (l.length > 100) e.lastName = 'Last name must be at most 100 characters.';
        if (ph) {
            if (ph.length > 30) e.phone = 'Phone number must be at most 30 characters.';
            else if (!/^[0-9+\-\s()]*$/.test(ph)) e.phone = 'Phone may contain only digits, spaces, +, -, and ().';
        }
        setPErrors(e);
        return Object.keys(e).length === 0;
    }

    function submitProfile(ev: FormEvent) {
        ev.preventDefault();
        if (validateProfile()) saveProfile.mutate();
    }

    // ---- change-password state ----
    const [currentPassword, setCurrentPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [pwErrors, setPwErrors] = useState<{ current?: string; next?: string; confirm?: string }>({});
    const [ssoNoPassword, setSsoNoPassword] = useState(false); // set true when backend returns 409

    const savePassword = useMutation({
        mutationFn: () => changePassword({ currentPassword, newPassword }), // confirm NOT sent (Gap #1)
        onSuccess: () => {
            toast.success('Password changed. You may need to sign in again.'); // Gap #3
            setCurrentPassword(''); setNewPassword(''); setConfirmPassword('');
            setPwErrors({});
        },
        onError: (err) => {
            const status = axios.isAxiosError(err) ? err.response?.status : undefined;
            if (status === 409) {                          // Google-only account (Gap #2)
                setSsoNoPassword(true);
                toast.error('This account uses Google sign-in — there is no password to change.');
                return;
            }
            if (status === 401) {                          // wrong current password
                setPwErrors((p) => ({ ...p, current: 'Current password is incorrect.' }));
                toast.error('Current password is incorrect.');
                return;
            }
            toast.error(errorMessage(err, 'Could not change password.')); // 400 / other
        },
    });

    function validatePassword(): boolean {
        const e: typeof pwErrors = {};
        if (!currentPassword) e.current = 'Current password is required.';
        if (!newPassword) e.next = 'New password is required.';
        else if (newPassword.length < 8) e.next = 'New password must be at least 8 characters.';
        else if (newPassword === currentPassword) e.next = 'New password must differ from the current one.';
        if (confirmPassword !== newPassword) e.confirm = 'Passwords do not match.';
        setPwErrors(e);
        return Object.keys(e).length === 0;
    }

    function submitPassword(ev: FormEvent) {
        ev.preventDefault();
        if (validatePassword()) savePassword.mutate();
    }

    // ---- render ----
    return (
        <div style={pageStyle}>
            <header style={headerStyle}>
                <div style={{ maxWidth: 760, margin: '0 auto', padding: '13px 28px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 11 }}>
                        <Logo height={26} to="/products" />
                        <span style={{ fontSize: 13, color: '#9a97a8', fontWeight: 500 }}>/ Account</span>
                    </div>
                    <button onClick={() => logout()} style={ghostBtnStyle}>Log out</button>
                </div>
            </header>

            <main style={{ maxWidth: 760, margin: '0 auto', padding: '32px 28px 80px' }}>
                <h1 style={{ fontFamily: "'Outfit',sans-serif", fontWeight: 800, fontSize: 30, margin: '0 0 24px', color: '#15131f' }}>
                    Your account
                </h1>

                {isLoading ? (
                    <p style={{ color: '#6b6878' }}>Loading your profile…</p>
                ) : isError || !profile ? (
                    <p style={{ color: '#c0392b' }}>Couldn’t load your profile. Please refresh.</p>
                ) : (
                    <>
                        {/* ---------- Profile card ---------- */}
                        <section style={cardStyle}>
                            <h2 style={cardTitleStyle}>Profile</h2>
                            <form onSubmit={submitProfile} noValidate>
                                <Field label="Email (read-only)">
                                    <input value={profile.email} readOnly style={{ ...inputStyle(), background: '#f3f2f8', color: '#9a97a8', cursor: 'not-allowed' }} />
                                </Field>
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
                                    <Field label="First name" error={pErrors.firstName}>
                                        <input value={firstName} onChange={(e) => setFirstName(e.target.value)} style={inputStyle(!!pErrors.firstName)} />
                                    </Field>
                                    <Field label="Last name" error={pErrors.lastName}>
                                        <input value={lastName} onChange={(e) => setLastName(e.target.value)} style={inputStyle(!!pErrors.lastName)} />
                                    </Field>
                                </div>
                                <Field label="Phone (optional)" error={pErrors.phone}>
                                    <input value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="+1 (555) 123-4567" style={inputStyle(!!pErrors.phone)} />
                                </Field>
                                <button type="submit" disabled={saveProfile.isPending} style={primaryBtnStyle}>
                                    {saveProfile.isPending ? 'Saving…' : 'Save changes'}
                                </button>
                            </form>
                        </section>

                        {/* ---------- Change-password card ---------- */}
                        <section style={{ ...cardStyle, marginTop: 24 }}>
                            <h2 style={cardTitleStyle}>Change password</h2>

                            {ssoNoPassword ? (
                                <p style={{ color: '#6b6878', fontSize: 14.5, lineHeight: 1.6, margin: 0 }}>
                                    This account uses <strong>Google sign-in</strong>, so there is no password to change.
                                </p>
                            ) : (
                                <form onSubmit={submitPassword} noValidate>
                                    <Field label="Current password" error={pwErrors.current}>
                                        <input type="password" value={currentPassword} onChange={(e) => setCurrentPassword(e.target.value)} style={inputStyle(!!pwErrors.current)} />
                                    </Field>
                                    <Field label="New password" error={pwErrors.next}>
                                        <input type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} style={inputStyle(!!pwErrors.next)} />
                                    </Field>
                                    <Field label="Confirm new password" error={pwErrors.confirm}>
                                        <input type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} style={inputStyle(!!pwErrors.confirm)} />
                                    </Field>
                                    <button type="submit" disabled={savePassword.isPending} style={primaryBtnStyle}>
                                        {savePassword.isPending ? 'Changing…' : 'Change password'}
                                    </button>
                                </form>
                            )}
                        </section>

                        {/* ---------- Become a seller (customers only) — TB-139 ---------- */}
                        {profile.role === 'Customer' && (
                            <section style={{ ...cardStyle, marginTop: 24 }}>
                                <h2 style={cardTitleStyle}>Sell on Buyit</h2>
                                <p style={{ color: '#6b6878', fontSize: 14.5, lineHeight: 1.6, margin: '0 0 16px' }}>
                                    Turn your account into a seller account and open your first store. New stores start
                                    as <strong>Pending</strong> until an admin approves them.
                                </p>
                                <button type="button" onClick={() => openAuth('register', 'seller')} style={primaryBtnStyle}>
                                    Become a seller
                                </button>
                            </section>
                        )}
                    </>
                )}
            </main>
        </div>
    );
}

// ---------- tiny reusable field (label + child input + inline error) ----------
function Field({ label, error, children }: { label: string; error?: string; children: React.ReactNode }) {
    return (
        <label style={{ display: 'block', marginBottom: 14 }}>
            <span style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#56536a', marginBottom: 6 }}>{label}</span>
            {children}
            {error && <span style={{ display: 'block', color: '#c0392b', fontSize: 12.5, marginTop: 5 }}>{error}</span>}
        </label>
    );
}

// ---------- styles ----------
const pageStyle: CSSProperties = { minHeight: '100vh', background: '#f7f6fb', fontFamily: "'Plus Jakarta Sans',sans-serif", color: '#15131f' };
const headerStyle: CSSProperties = { position: 'sticky', top: 0, zIndex: 20, background: 'rgba(247,246,251,.86)', backdropFilter: 'blur(12px)', WebkitBackdropFilter: 'blur(12px)', borderBottom: '1px solid #eceaf2' };
const cardStyle: CSSProperties = { background: '#fff', border: '1px solid #eceaf2', borderRadius: 18, padding: '24px 26px' };
const cardTitleStyle: CSSProperties = { fontFamily: "'Outfit',sans-serif", fontWeight: 700, fontSize: 18, margin: '0 0 18px', color: '#15131f' };
const primaryBtnStyle: CSSProperties = { marginTop: 6, padding: '12px 22px', borderRadius: 12, border: 'none', cursor: 'pointer', background: 'linear-gradient(135deg,#8d6cff,#7c5cff)', color: '#fff', fontFamily: "'Plus Jakarta Sans',sans-serif", fontSize: 14.5, fontWeight: 700 };
const ghostBtnStyle: CSSProperties = { padding: '8px 16px', borderRadius: 10, border: '1px solid #eceaf2', cursor: 'pointer', background: '#fff', color: '#56536a', fontFamily: "'Plus Jakarta Sans',sans-serif", fontSize: 13.5, fontWeight: 600 };

// `inputStyle` is a function so an invalid field can show a red border. Calling it with no
// argument (e.g. for the read-only email) just yields the normal style.
function inputStyle(invalid = false): CSSProperties {
    return {
        width: '100%', boxSizing: 'border-box', padding: '10px 12px', borderRadius: 10,
        border: `1px solid ${invalid ? '#e2a3a3' : '#eceaf2'}`, background: '#fff',
        fontFamily: "'Plus Jakarta Sans',sans-serif", fontSize: 14, color: '#15131f', outline: 'none',
    };
}