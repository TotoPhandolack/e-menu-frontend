'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createRestaurant } from '@/lib/api';
import { toast } from 'sonner';
import {
  Store,
  MapPin,
  Compass,
  Loader2,
  ArrowLeft,
  Map,
} from 'lucide-react';

const DEFAULT_RADIUS = 1000;

export default function RestaurantRegisterPage() {
  const router = useRouter();

  const [name, setName] = useState('');
  const [address, setAddress] = useState('');
  const [latitude, setLatitude] = useState('');
  const [longitude, setLongitude] = useState('');
  const [radius, setRadius] = useState(DEFAULT_RADIUS.toString());
  const [loading, setLoading] = useState(false);
  const [geoLoading, setGeoLoading] = useState(false);

  const handleGetLocation = async () => {
    setGeoLoading(true);
    try {
      const position = await new Promise<GeolocationCoordinates>((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(
          (pos) => resolve(pos.coords),
          reject,
          { enableHighAccuracy: true, timeout: 10000 }
        );
      });
      setLatitude(position.latitude.toFixed(6));
      setLongitude(position.longitude.toFixed(6));
      toast.success('Location fetched successfully');
    } catch (err) {
      toast.error('Failed to get location. Please enable location access.');
    } finally {
      setGeoLoading(false);
    }
  };

  const handleMockLocation = () => {
    setLatitude('13.736666');
    setLongitude('100.523333');
    toast.success('Mock location set (Bangkok, Thailand)');
  };

  const handleSubmit = async () => {
    if (!name.trim() || !address.trim() || !latitude || !longitude) {
      toast.error('Please fill in all required fields');
      return;
    }

    const lat = parseFloat(latitude);
    const lng = parseFloat(longitude);
    const rad = parseInt(radius, 10);

    if (isNaN(lat) || isNaN(lng) || isNaN(rad)) {
      toast.error('Invalid coordinate or radius values');
      return;
    }

    if (lat < -90 || lat > 90) {
      toast.error('Latitude must be between -90 and 90');
      return;
    }

    if (lng < -180 || lng > 180) {
      toast.error('Longitude must be between -180 and 180');
      return;
    }

    if (rad < 10) {
      toast.error('Radius must be at least 10 meters');
      return;
    }

    setLoading(true);
    try {
      const response = await createRestaurant({
        name: name.trim(),
        address: address.trim(),
        latitude: lat,
        longitude: lng,
        radius_meters: rad,
      });
      toast.success(`Restaurant "${response.data.name}" registered successfully!`);
      router.push('/register');
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } };
      toast.error(error.response?.data?.message ?? 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="register-bg">
      <div className="blob blob-1" />
      <div className="blob blob-2" />
      <div className="blob blob-3" />

      <div className="register-card">
        <button onClick={() => router.back()} className="back-btn">
          <ArrowLeft size={14} />
          Back
        </button>

        <div className="register-logo">
          <svg width="32" height="32" viewBox="0 0 28 28" fill="none">
            <rect width="28" height="28" rx="8" fill="#3a5a40" />
            <path d="M8 20 Q14 8 20 20" stroke="white" strokeWidth="2.2" strokeLinecap="round" fill="none" />
            <circle cx="14" cy="10" r="2" fill="white" />
          </svg>
        </div>

        <div className="register-header">
          <h1>Register Restaurant</h1>
          <p>Set up your restaurant details and location</p>
        </div>

        <div className="register-form">
          <div className="field-group">
            <label htmlFor="name">Restaurant Name *</label>
            <div className="input-wrapper">
              <Store size={15} className="input-icon" />
              <input
                id="name"
                type="text"
                placeholder="e.g., The Italian Corner"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>
          </div>

          <div className="field-group">
            <label htmlFor="address">Address *</label>
            <div className="input-wrapper">
              <MapPin size={15} className="input-icon" />
              <input
                id="address"
                type="text"
                placeholder="123 Main St, City, Country"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
              />
            </div>
          </div>

          <div className="coords-section">
            <div style={{ display: 'flex', gap: '0.875rem' }}>
              <div className="field-group" style={{ flex: 1 }}>
                <label htmlFor="latitude">Latitude *</label>
                <div className="input-wrapper">
                  <Compass size={15} className="input-icon" />
                  <input
                    id="latitude"
                    type="number"
                    step="0.000001"
                    placeholder="e.g., 13.7563"
                    value={latitude}
                    onChange={(e) => setLatitude(e.target.value)}
                  />
                </div>
              </div>

              <div className="field-group" style={{ flex: 1 }}>
                <label htmlFor="longitude">Longitude *</label>
                <div className="input-wrapper">
                  <Compass size={15} className="input-icon" />
                  <input
                    id="longitude"
                    type="number"
                    step="0.000001"
                    placeholder="e.g., 100.5018"
                    value={longitude}
                    onChange={(e) => setLongitude(e.target.value)}
                  />
                </div>
              </div>
            </div>

            <button
              type="button"
              className="geo-btn"
              onClick={handleGetLocation}
              disabled={geoLoading || loading}
            >
              {geoLoading ? (
                <Loader2 size={14} className="spin-icon" />
              ) : (
                <Map size={14} />
              )}
              {geoLoading ? 'Getting location...' : 'Use current location'}
            </button>

            <button
              type="button"
              className="geo-btn mock-btn"
              onClick={handleMockLocation}
              disabled={loading}
              title="Bangkok, Thailand test location"
            >
              <Map size={14} />
              Use Mock Location (Testing)
            </button>
          </div>

          <div className="field-group">
            <label htmlFor="radius">Service Radius (meters) *</label>
            <div className="input-wrapper">
              <MapPin size={15} className="input-icon" />
              <input
                id="radius"
                type="number"
                min="10"
                step="100"
                placeholder="e.g., 1000"
                value={radius}
                onChange={(e) => setRadius(e.target.value)}
              />
            </div>
            <p className="field-hint">Minimum 10 meters. Default is 1000 meters.</p>
          </div>

          <button
            className={`register-btn${loading ? ' loading' : ''}`}
            onClick={handleSubmit}
            disabled={loading}
          >
            {loading ? (
              <Loader2 size={18} className="spin-icon" />
            ) : (
              'Register Restaurant'
            )}
          </button>
        </div>

        <p className="register-hint">
          Created a restaurant?{' '}
          <button onClick={() => router.push('/register')} className="hint-link">
            Register an admin account
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
          width: 420px;
          height: 420px;
          background: radial-gradient(circle, #3a5a40 0%, transparent 70%);
          top: -120px;
          right: -80px;
          animation: float1 9s ease-in-out infinite;
        }
        .blob-2 {
          width: 300px;
          height: 300px;
          background: radial-gradient(circle, #5a8a62 0%, transparent 70%);
          bottom: -80px;
          left: -60px;
          animation: float2 11s ease-in-out infinite;
        }
        .blob-3 {
          width: 200px;
          height: 200px;
          background: radial-gradient(circle, #a3c4a8 0%, transparent 70%);
          top: 50%;
          left: 10%;
          animation: float1 13s ease-in-out infinite reverse;
        }

        @keyframes float1 {
          0%, 100% {
            transform: translate(0, 0) scale(1);
          }
          50% {
            transform: translate(-20px, 30px) scale(1.05);
          }
        }

        @keyframes float2 {
          0%, 100% {
            transform: translate(0, 0) scale(1);
          }
          50% {
            transform: translate(20px, -20px) scale(1.08);
          }
        }

        .register-card {
          background: rgba(255, 255, 255, 0.88);
          backdrop-filter: blur(20px);
          -webkit-backdrop-filter: blur(20px);
          border: 1px solid rgba(58, 90, 64, 0.12);
          border-radius: 1.5rem;
          padding: 2rem 2.5rem 2.25rem;
          width: 100%;
          max-width: 500px;
          box-shadow: 0 4px 6px -1px rgba(58, 90, 64, 0.06),
            0 20px 60px -12px rgba(58, 90, 64, 0.18);
          position: relative;
          z-index: 10;
          animation: slideUp 0.5s cubic-bezier(0.16, 1, 0.3, 1);
        }

        @keyframes slideUp {
          from {
            opacity: 0;
            transform: translateY(24px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
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

        .back-btn:hover {
          color: #3a5a40;
        }

        .register-logo {
          display: flex;
          justify-content: center;
          margin-bottom: 1rem;
        }

        .register-logo svg {
          filter: drop-shadow(0 4px 12px rgba(58, 90, 64, 0.3));
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

        .field-hint {
          font-size: 0.75rem;
          color: #7a9a7f;
          margin: 0.25rem 0 0;
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
          padding: 0.625rem 0.875rem 0.625rem 2.5rem;
          border: 1.5px solid #c3d6c7;
          border-radius: 0.75rem;
          font-size: 0.9rem;
          font-family: inherit;
          background: #fafcfa;
          color: #1a2e1d;
          outline: none;
          transition: border-color 0.2s, box-shadow 0.2s, background 0.2s;
        }

        .input-wrapper input::placeholder {
          color: #a8c0ac;
        }

        .input-wrapper input:focus {
          border-color: #3a5a40;
          background: #ffffff;
          box-shadow: 0 0 0 3px rgba(58, 90, 64, 0.12);
        }

        .input-wrapper input::-webkit-outer-spin-button,
        .input-wrapper input::-webkit-inner-spin-button {
          -webkit-appearance: none;
          margin: 0;
        }

        .input-wrapper input[type='number'] {
          -moz-appearance: textfield;
        }

        .coords-section {
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
        }

        .geo-btn {
          width: 100%;
          padding: 0.625rem 0.875rem;
          background: rgba(58, 90, 64, 0.08);
          border: 1.5px solid #c3d6c7;
          border-radius: 0.75rem;
          font-size: 0.85rem;
          font-weight: 500;
          color: #3a5a40;
          font-family: inherit;
          cursor: pointer;
          transition: all 0.2s;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 0.5rem;
        }

        .geo-btn:hover:not(:disabled) {
          background: rgba(58, 90, 64, 0.12);
          border-color: #3a5a40;
        }

        .geo-btn:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        .mock-btn {
          background: rgba(168, 85, 247, 0.08);
          border-color: #ddd6fe;
          color: #7c3aed;
          font-size: 0.8rem;
        }

        .mock-btn:hover:not(:disabled) {
          background: rgba(168, 85, 247, 0.12);
          border-color: #7c3aed;
        }

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
          box-shadow: 0 4px 14px rgba(58, 90, 64, 0.35);
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          min-height: 48px;
        }

        .register-btn:hover:not(:disabled) {
          transform: translateY(-1px);
          box-shadow: 0 6px 20px rgba(58, 90, 64, 0.4);
        }

        .register-btn:active:not(:disabled) {
          transform: translateY(0);
        }

        .register-btn:disabled {
          opacity: 0.7;
          cursor: not-allowed;
        }

        .spin-icon {
          animation: spin 0.7s linear infinite;
        }

        @keyframes spin {
          to {
            transform: rotate(360deg);
          }
        }

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

        .hint-link:hover {
          color: #2c4430;
        }
      `}</style>
    </div>
  );
}
