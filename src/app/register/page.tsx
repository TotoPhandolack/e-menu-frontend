// src/app/register/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { registerAdmin, getRestaurants, type Restaurant } from '@/lib/api';
import { toast } from 'sonner';
import {
  User,
  Mail,
  Lock,
  Eye,
  EyeOff,
  Store,
  ShieldCheck,
  ChevronDown,
  ArrowLeft,
  Loader2,
} from 'lucide-react';

export default function RegisterPage() {
  const router = useRouter();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [restaurantId, setRestaurantId] = useState('');
  const [role, setRole] = useState<'CASHIER' | 'ADMIN'>('CASHIER');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [loadingRestaurants, setLoadingRestaurants] = useState(true);

  useEffect(() => {
    getRestaurants()
      .then(({ data }) => setRestaurants(data))
      .catch(() => toast.error('Failed to load restaurants'))
      .finally(() => setLoadingRestaurants(false));
  }, []);

  const handleSubmit = async () => {
    if (!name.trim() || !email.trim() || !password || !restaurantId) {
      toast.error('Please fill in all required fields');
      return;
    }
    if (password !== confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }
    if (password.length < 6) {
      toast.error('Password must be at least 6 characters');
      return;
    }

    setLoading(true);
    try {
      await registerAdmin({ name, email, password, restaurant_id: restaurantId, role });
      toast.success(`Account created! You can now log in.`);
      router.push('/login');
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } };
      toast.error(error.response?.data?.message ?? 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="register-bg">
      {/* Decorative blobs */}
      <div className="blob blob-1" />
      <div className="blob blob-2" />
      <div className="blob blob-3" />

      <div className="register-card">
        {/* Back link */}
        <button
          onClick={() => router.push('/login')}
          className="back-btn"
        >
          <ArrowLeft size={14} />
          Back to Login
        </button>

        {/* Logo */}
        <div className="register-logo">
          <svg width="32" height="32" viewBox="0 0 28 28" fill="none">
            <rect width="28" height="28" rx="8" fill="#3a5a40" />
            <path d="M8 20 Q14 8 20 20" stroke="white" strokeWidth="2.2" strokeLinecap="round" fill="none" />
            <circle cx="14" cy="10" r="2" fill="white" />
          </svg>
        </div>

        <div className="register-header">
          <h1>Create Account</h1>
          <p>Register a cashier or admin for your restaurant</p>
        </div>

        <div className="register-form">
          {/* Name */}
          <div className="field-group">
            <label htmlFor="name">Full Name</label>
            <div className="input-wrapper">
              <User size={15} className="input-icon" />
              <input
                id="name"
                type="text"
                placeholder="John Doe"
                value={name}
                onChange={(e) => setName(e.target.value)}
                autoComplete="name"
              />
            </div>
          </div>

          {/* Email */}
          <div className="field-group">
            <label htmlFor="email">Email</label>
            <div className="input-wrapper">
              <Mail size={15} className="input-icon" />
              <input
                id="email"
                type="email"
                placeholder="cashier@restaurant.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                autoComplete="email"
              />
            </div>
          </div>

          {/* Password */}
          <div className="field-group">
            <label htmlFor="password">Password</label>
            <div className="input-wrapper">
              <Lock size={15} className="input-icon" />
              <input
                id="password"
                type={showPassword ? 'text' : 'password'}
                placeholder="Min. 6 characters"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete="new-password"
              />
              <button
                type="button"
                className="eye-btn"
                onClick={() => setShowPassword(!showPassword)}
                aria-label="Toggle password"
              >
                {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
              </button>
            </div>
          </div>

          {/* Confirm Password */}
          <div className="field-group">
            <label htmlFor="confirm">Confirm Password</label>
            <div className="input-wrapper">
              <Lock size={15} className="input-icon" />
              <input
                id="confirm"
                type={showConfirm ? 'text' : 'password'}
                placeholder="Re-enter password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                autoComplete="new-password"
              />
              <button
                type="button"
                className="eye-btn"
                onClick={() => setShowConfirm(!showConfirm)}
                aria-label="Toggle confirm password"
              >
                {showConfirm ? <EyeOff size={15} /> : <Eye size={15} />}
              </button>
            </div>
          </div>

          {/* Restaurant */}
          <div className="field-group">
            <label htmlFor="restaurant">Restaurant</label>
            <div className="input-wrapper">
              <Store size={15} className="input-icon" />
              <select
                id="restaurant"
                value={restaurantId}
                onChange={(e) => setRestaurantId(e.target.value)}
                disabled={loadingRestaurants}
                className="select-input"
              >
                <option value="">
                  {loadingRestaurants ? 'Loading restaurants…' : 'Select a restaurant'}
                </option>
                {restaurants.map((r) => (
                  <option key={r.id} value={r.id}>
                    {r.name}
                  </option>
                ))}
              </select>
              <ChevronDown size={14} className="select-arrow" />
            </div>
          </div>

          {/* Role */}
          <div className="field-group">
            <label htmlFor="role">Role</label>
            <div className="input-wrapper">
              <ShieldCheck size={15} className="input-icon" />
              <select
                id="role"
                value={role}
                onChange={(e) => setRole(e.target.value as 'CASHIER' | 'ADMIN')}
                className="select-input"
              >
                <option value="CASHIER">Cashier</option>
                <option value="ADMIN">Admin</option>
              </select>
              <ChevronDown size={14} className="select-arrow" />
            </div>
          </div>

          {/* Submit */}
          <button
            id="register-btn"
            className={`register-btn${loading ? ' loading' : ''}`}
            onClick={handleSubmit}
            disabled={loading}
          >
            {loading ? (
              <Loader2 size={18} className="spin-icon" />
            ) : (
              'Create Account'
            )}
          </button>
        </div>

        <p className="register-hint">
          Already have an account?{' '}
          <button onClick={() => router.push('/login')} className="hint-link">
            Sign in
          </button>
        </p>
      </div>

      <style>{`
        .register-bg {
          min-height: 100vh;
          background: linear-gradient(135deg, #f0f5f1 0%, #e8f0ea 50%, #dce8df 100%);
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 2rem 1.5rem;
          position: relative;
          overflow: hidden;
        }

        .blob {
          position: absolute;
          border-radius: 50%;
          filter: blur(80px);
          opacity: 0.3;
          pointer-events: none;
        }
        .blob-1 {
          width: 420px; height: 420px;
          background: radial-gradient(circle, #3a5a40 0%, transparent 70%);
          top: -120px; right: -80px;
          animation: float1 9s ease-in-out infinite;
        }
        .blob-2 {
          width: 300px; height: 300px;
          background: radial-gradient(circle, #5a8a62 0%, transparent 70%);
          bottom: -80px; left: -60px;
          animation: float2 11s ease-in-out infinite;
        }
        .blob-3 {
          width: 200px; height: 200px;
          background: radial-gradient(circle, #a3c4a8 0%, transparent 70%);
          top: 50%; left: 10%;
          animation: float1 13s ease-in-out infinite reverse;
        }
        @keyframes float1 {
          0%, 100% { transform: translate(0,0) scale(1); }
          50% { transform: translate(-20px, 30px) scale(1.05); }
        }
        @keyframes float2 {
          0%, 100% { transform: translate(0,0) scale(1); }
          50% { transform: translate(20px, -20px) scale(1.08); }
        }

        .register-card {
          background: rgba(255,255,255,0.88);
          backdrop-filter: blur(20px);
          -webkit-backdrop-filter: blur(20px);
          border: 1px solid rgba(58,90,64,0.12);
          border-radius: 1.5rem;
          padding: 2rem 2.5rem 2.25rem;
          width: 100%;
          max-width: 420px;
          box-shadow:
            0 4px 6px -1px rgba(58,90,64,0.06),
            0 20px 60px -12px rgba(58,90,64,0.18);
          position: relative;
          z-index: 10;
          animation: slideUp 0.5s cubic-bezier(0.16, 1, 0.3, 1);
        }
        @keyframes slideUp {
          from { opacity: 0; transform: translateY(24px); }
          to   { opacity: 1; transform: translateY(0); }
        }

        .back-btn {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          font-size: 0.8125rem;
          color: #5a7a5f;
          background: none;
          border: none;
          cursor: pointer;
          padding: 0;
          margin-bottom: 1.25rem;
          transition: color 0.15s;
          font-family: inherit;
        }
        .back-btn:hover { color: #3a5a40; }

        .register-logo {
          display: flex;
          justify-content: center;
          margin-bottom: 1rem;
        }
        .register-logo svg {
          filter: drop-shadow(0 4px 12px rgba(58,90,64,0.3));
        }

        .register-header {
          text-align: center;
          margin-bottom: 1.5rem;
        }
        .register-header h1 {
          font-size: 1.5rem;
          font-weight: 700;
          color: #1a2e1d;
          letter-spacing: -0.025em;
          margin: 0 0 0.25rem;
        }
        .register-header p {
          font-size: 0.8125rem;
          color: #5a7a5f;
          margin: 0;
          line-height: 1.5;
        }

        .register-form {
          display: flex;
          flex-direction: column;
          gap: 0.875rem;
        }

        .field-group {
          display: flex;
          flex-direction: column;
          gap: 0.3125rem;
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
        .input-wrapper input,
        .select-input {
          width: 100%;
          padding: 0.625rem 2.75rem 0.625rem 2.5rem;
          border: 1.5px solid #c3d6c7;
          border-radius: 0.75rem;
          font-size: 0.9rem;
          font-family: inherit;
          background: #fafcfa;
          color: #1a2e1d;
          outline: none;
          transition: border-color 0.2s, box-shadow 0.2s, background 0.2s;
          -webkit-appearance: none;
          appearance: none;
        }
        .input-wrapper input::placeholder {
          color: #a8c0ac;
        }
        .input-wrapper input:focus,
        .select-input:focus {
          border-color: #3a5a40;
          background: #ffffff;
          box-shadow: 0 0 0 3px rgba(58,90,64,0.12);
        }
        .select-input option {
          color: #1a2e1d;
        }

        .select-arrow {
          position: absolute;
          right: 0.875rem;
          color: #7a9a7f;
          pointer-events: none;
          flex-shrink: 0;
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

        .register-btn {
          margin-top: 0.375rem;
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
          gap: 8px;
          min-height: 48px;
        }
        .register-btn:hover:not(:disabled) {
          transform: translateY(-1px);
          box-shadow: 0 6px 20px rgba(58,90,64,0.4);
        }
        .register-btn:active:not(:disabled) { transform: translateY(0); }
        .register-btn:disabled { opacity: 0.7; cursor: not-allowed; }

        .spin-icon {
          animation: spin 0.7s linear infinite;
        }
        @keyframes spin { to { transform: rotate(360deg); } }

        .register-hint {
          text-align: center;
          font-size: 0.8125rem;
          color: #7a9a7f;
          margin-top: 1.25rem;
          margin-bottom: 0;
        }
        .hint-link {
          background: none;
          border: none;
          color: #3a5a40;
          font-weight: 600;
          cursor: pointer;
          padding: 0;
          font-family: inherit;
          font-size: inherit;
          text-decoration: underline;
          text-underline-offset: 2px;
          transition: color 0.15s;
        }
        .hint-link:hover { color: #2c4430; }
      `}</style>
    </div>
  );
}
