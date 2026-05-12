// src/app/login/page.tsx
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { login } from '@/lib/api';
import { useAuthStore } from '@/stores/auth.store';
import { toast } from 'sonner';
import Link from 'next/link';

export default function LoginPage() {
    const router = useRouter();
    const { setAuth } = useAuthStore();

    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);

    const handleLogin = async () => {
        if (!email || !password) {
            toast.error('ກະລຸນາໃສ່ອີເມລ ແລະ ລະຫັດຜ່ານ');
            return;
        }
        setLoading(true);
        try {
            const { data } = await login(email, password);
            setAuth(data.access_token, data.admin);
            toast.success(`ຍິນດີຕ້ອນຮັບ ${data.admin.name}!`);
            // Role-based redirect
            if (data.admin.role === 'CASHIER') {
                router.push('/cashier');
            } else {
                router.push('/dashboard');
            }
        } catch {
            toast.error('ອີເມລ ຫຼື ລະຫັດຜ່ານບໍ່ຖືກຕ້ອງ');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="login-bg">
            {/* Decorative blobs */}
            <div className="blob blob-1" />
            <div className="blob blob-2" />

            <div className="login-card">
                {/* Logo mark */}
                <div className="login-logo">
                    <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
                        <rect width="28" height="28" rx="8" fill="#3a5a40" />
                        <path d="M8 20 Q14 8 20 20" stroke="white" strokeWidth="2.2" strokeLinecap="round" fill="none" />
                        <circle cx="14" cy="10" r="2" fill="white" />
                    </svg>
                </div>

                <div className="login-header">
                    <h1>E-Menu</h1>
                    <p>ເຂົ້າສູ່ລະບົບ</p>
                </div>

                <div className="login-form">
                    {/* Email */}
                    <div className="field-group">
                        <label htmlFor="email">ອີເມລ</label>
                        <div className="input-wrapper">
                            <svg className="input-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <rect x="2" y="4" width="20" height="16" rx="2" />
                                <polyline points="2,4 12,13 22,4" />
                            </svg>
                            <input
                                id="email"
                                type="email"
                                placeholder="your@email.com"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                onKeyDown={(e) => e.key === 'Enter' && handleLogin()}
                                autoComplete="email"
                            />
                        </div>
                    </div>

                    {/* Password */}
                    <div className="field-group">
                        <label htmlFor="password">ລະຫັດຜ່ານ</label>
                        <div className="input-wrapper">
                            <svg className="input-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <rect x="3" y="11" width="18" height="11" rx="2" />
                                <path d="M7 11V7a5 5 0 0110 0v4" />
                            </svg>
                            <input
                                id="password"
                                type={showPassword ? 'text' : 'password'}
                                placeholder="••••••••"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                onKeyDown={(e) => e.key === 'Enter' && handleLogin()}
                                autoComplete="current-password"
                            />
                            <button
                                type="button"
                                className="eye-btn"
                                onClick={() => setShowPassword(!showPassword)}
                                aria-label="toggle password visibility"
                            >
                                {showPassword ? (
                                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                        <path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94" />
                                        <path d="M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19" />
                                        <line x1="1" y1="1" x2="23" y2="23" />
                                    </svg>
                                ) : (
                                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                                        <circle cx="12" cy="12" r="3" />
                                    </svg>
                                )}
                            </button>
                        </div>
                    </div>

                    <button
                        id="login-btn"
                        className={`login-btn${loading ? ' loading' : ''}`}
                        onClick={handleLogin}
                        disabled={loading}
                    >
                        {loading ? (
                            <span className="spinner" />
                        ) : (
                            'ເຂົ້າສູ່ລະບົບ'
                        )}
                    </button>
                </div>

                <p className="login-hint">
                    Restaurant management system · E-Menu
                </p>
                <p className="login-hint" style={{ marginTop: '0.5rem' }}>
                    New here?{' '}
                    <Link href="/register" className="register-link">Create an account</Link>
                </p>
            </div>

            <style>{`
                @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');

                .login-bg {
                    min-height: 100vh;
                    background: linear-gradient(135deg, #f0f5f1 0%, #e8f0ea 50%, #dce8df 100%);
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    padding: 1.5rem;
                    font-family: 'Inter', sans-serif;
                    position: relative;
                    overflow: hidden;
                }

                .blob {
                    position: absolute;
                    border-radius: 50%;
                    filter: blur(80px);
                    opacity: 0.35;
                    pointer-events: none;
                }
                .blob-1 {
                    width: 420px;
                    height: 420px;
                    background: radial-gradient(circle, #3a5a40 0%, transparent 70%);
                    top: -100px;
                    right: -100px;
                    animation: float1 8s ease-in-out infinite;
                }
                .blob-2 {
                    width: 320px;
                    height: 320px;
                    background: radial-gradient(circle, #5a8a62 0%, transparent 70%);
                    bottom: -80px;
                    left: -60px;
                    animation: float2 10s ease-in-out infinite;
                }
                @keyframes float1 {
                    0%, 100% { transform: translate(0, 0) scale(1); }
                    50% { transform: translate(-20px, 30px) scale(1.05); }
                }
                @keyframes float2 {
                    0%, 100% { transform: translate(0, 0) scale(1); }
                    50% { transform: translate(20px, -20px) scale(1.08); }
                }

                .login-card {
                    background: rgba(255,255,255,0.88);
                    backdrop-filter: blur(20px);
                    -webkit-backdrop-filter: blur(20px);
                    border: 1px solid rgba(58,90,64,0.12);
                    border-radius: 1.5rem;
                    padding: 2.5rem;
                    width: 100%;
                    max-width: 380px;
                    box-shadow:
                        0 4px 6px -1px rgba(58,90,64,0.06),
                        0 20px 60px -12px rgba(58,90,64,0.18);
                    display: flex;
                    flex-direction: column;
                    gap: 0;
                    position: relative;
                    z-index: 10;
                    animation: slideUp 0.5s cubic-bezier(0.16, 1, 0.3, 1);
                }
                @keyframes slideUp {
                    from { opacity: 0; transform: translateY(24px); }
                    to   { opacity: 1; transform: translateY(0); }
                }

                .login-logo {
                    display: flex;
                    justify-content: center;
                    margin-bottom: 1.25rem;
                }
                .login-logo svg {
                    filter: drop-shadow(0 4px 12px rgba(58,90,64,0.3));
                }

                .login-header {
                    text-align: center;
                    margin-bottom: 1.75rem;
                }
                .login-header h1 {
                    font-size: 1.625rem;
                    font-weight: 700;
                    color: #1a2e1d;
                    letter-spacing: -0.025em;
                    margin: 0 0 0.25rem;
                }
                .login-header p {
                    font-size: 0.875rem;
                    color: #5a7a5f;
                    margin: 0;
                }

                .login-form {
                    display: flex;
                    flex-direction: column;
                    gap: 1rem;
                }

                .field-group {
                    display: flex;
                    flex-direction: column;
                    gap: 0.375rem;
                }
                .field-group label {
                    font-size: 0.8125rem;
                    font-weight: 500;
                    color: #2c4430;
                }

                .input-wrapper {
                    position: relative;
                    display: flex;
                    align-items: center;
                }
                .input-icon {
                    position: absolute;
                    left: 0.875rem;
                    color: #7a9a7f;
                    pointer-events: none;
                    flex-shrink: 0;
                }
                .input-wrapper input {
                    width: 100%;
                    padding: 0.6875rem 2.75rem 0.6875rem 2.625rem;
                    border: 1.5px solid #c3d6c7;
                    border-radius: 0.75rem;
                    font-size: 0.9375rem;
                    font-family: inherit;
                    background: #fafcfa;
                    color: #1a2e1d;
                    outline: none;
                    transition: border-color 0.2s, box-shadow 0.2s, background 0.2s;
                    -webkit-appearance: none;
                }
                .input-wrapper input::placeholder {
                    color: #a8c0ac;
                }
                .input-wrapper input:focus {
                    border-color: #3a5a40;
                    background: #ffffff;
                    box-shadow: 0 0 0 3px rgba(58,90,64,0.12);
                }

                .eye-btn {
                    position: absolute;
                    right: 0.875rem;
                    background: none;
                    border: none;
                    cursor: pointer;
                    color: #7a9a7f;
                    padding: 0;
                    display: flex;
                    align-items: center;
                    transition: color 0.2s;
                }
                .eye-btn:hover { color: #3a5a40; }

                .login-btn {
                    margin-top: 0.5rem;
                    width: 100%;
                    padding: 0.8125rem;
                    background: linear-gradient(135deg, #3a5a40 0%, #2c4430 100%);
                    color: white;
                    border: none;
                    border-radius: 0.75rem;
                    font-size: 0.9375rem;
                    font-weight: 600;
                    font-family: inherit;
                    cursor: pointer;
                    transition: transform 0.15s, box-shadow 0.15s, opacity 0.15s;
                    box-shadow: 0 4px 14px rgba(58,90,64,0.35);
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    min-height: 48px;
                }
                .login-btn:hover:not(:disabled) {
                    transform: translateY(-1px);
                    box-shadow: 0 6px 20px rgba(58,90,64,0.4);
                }
                .login-btn:active:not(:disabled) {
                    transform: translateY(0);
                }
                .login-btn:disabled {
                    opacity: 0.7;
                    cursor: not-allowed;
                }
                .login-btn.loading {
                    background: linear-gradient(135deg, #4a7050 0%, #3a5a40 100%);
                }

                .spinner {
                    width: 18px;
                    height: 18px;
                    border: 2.5px solid rgba(255,255,255,0.35);
                    border-top-color: white;
                    border-radius: 50%;
                    animation: spin 0.7s linear infinite;
                    display: inline-block;
                }
                @keyframes spin {
                    to { transform: rotate(360deg); }
                }

                .login-hint {
                    text-align: center;
                    font-size: 0.75rem;
                    color: #8aaa8e;
                    margin-top: 1.5rem;
                    margin-bottom: 0;
                }
                .register-link {
                    color: #3a5a40;
                    font-weight: 600;
                    text-decoration: underline;
                    text-underline-offset: 2px;
                }
                .register-link:hover { color: #2c4430; }
            `}</style>
        </div>
    );
}