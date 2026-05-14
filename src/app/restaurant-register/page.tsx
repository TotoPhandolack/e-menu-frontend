"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createRestaurant } from "@/lib/api";
import { toast } from "sonner";
import { Store, MapPin, Compass, Loader2, ArrowLeft, Map } from "lucide-react";

const DEFAULT_RADIUS = 1000;

export default function RestaurantRegisterPage() {
  const router = useRouter();

  const [name, setName] = useState("");
  const [address, setAddress] = useState("");
  const [latitude, setLatitude] = useState("");
  const [longitude, setLongitude] = useState("");
  const [radius, setRadius] = useState(DEFAULT_RADIUS.toString());
  const [loading, setLoading] = useState(false);
  const [geoLoading, setGeoLoading] = useState(false);

  const handleGetLocation = async () => {
    setGeoLoading(true);
    try {
      const position = await new Promise<GeolocationCoordinates>(
        (resolve, reject) => {
          navigator.geolocation.getCurrentPosition(
            (pos) => resolve(pos.coords),
            reject,
            { enableHighAccuracy: true, timeout: 10000 },
          );
        },
      );
      setLatitude(position.latitude.toFixed(6));
      setLongitude(position.longitude.toFixed(6));
      toast.success("Location fetched successfully");
    } catch (err) {
      toast.error("Failed to get location. Please enable location access.");
    } finally {
      setGeoLoading(false);
    }
  };

  const handleMockLocation = () => {
    setLatitude("13.736666");
    setLongitude("100.523333");
    toast.success("Mock location set (Bangkok, Thailand)");
  };

  const handleSubmit = async () => {
    if (!name.trim() || !address.trim() || !latitude || !longitude) {
      toast.error("Please fill in all required fields");
      return;
    }

    const lat = parseFloat(latitude);
    const lng = parseFloat(longitude);
    const rad = parseInt(radius, 10);

    if (isNaN(lat) || isNaN(lng) || isNaN(rad)) {
      toast.error("Invalid coordinate or radius values");
      return;
    }

    if (lat < -90 || lat > 90) {
      toast.error("Latitude must be between -90 and 90");
      return;
    }

    if (lng < -180 || lng > 180) {
      toast.error("Longitude must be between -180 and 180");
      return;
    }

    if (rad < 10) {
      toast.error("Radius must be at least 10 meters");
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
      toast.success(
        `Restaurant "${response.data.name}" registered successfully!`,
      );
      router.push("/register");
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } };
      toast.error(error.response?.data?.message ?? "Registration failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#f0f5f1] via-[#e8f0ea] to-[#dce8df] flex items-center justify-center p-6 md:p-8 relative overflow-hidden">
      {/* Blob backgrounds */}
      <div className="absolute w-[420px] h-[420px] bg-gradient-to-br from-[#3a5a40] to-transparent rounded-full blur-[80px] opacity-30 pointer-events-none -top-[120px] -right-20 animate-float1" />
      <div className="absolute w-[300px] h-[300px] bg-gradient-to-br from-[#5a8a62] to-transparent rounded-full blur-[80px] opacity-30 pointer-events-none -bottom-20 -left-16 animate-float2" />
      <div className="absolute w-[200px] h-[200px] bg-gradient-to-br from-[#a3c4a8] to-transparent rounded-full blur-[80px] opacity-30 pointer-events-none top-1/2 left-1/10 animate-float1-reverse" />

      <div className="bg-white/88 backdrop-blur-xl rounded-3xl p-8 md:p-10 w-full max-w-md shadow-lg relative z-10 animate-slideUp border border-[#3a5a40]/10">
        <button
          onClick={() => router.back()}
          className="inline-flex items-center gap-1.5 text-xs font-medium text-[#5a7a5f] hover:text-[#3a5a40] transition-colors mb-5"
        >
          <ArrowLeft size={14} />
          Back
        </button>

        <div className="flex justify-center mb-4">
          <svg
            width="32"
            height="32"
            viewBox="0 0 28 28"
            fill="none"
            className="drop-shadow-[0_4px_12px_rgba(58,90,64,0.3)]"
          >
            <rect width="28" height="28" rx="8" fill="#3a5a40" />
            <path
              d="M8 20 Q14 8 20 20"
              stroke="white"
              strokeWidth="2.2"
              strokeLinecap="round"
              fill="none"
            />
            <circle cx="14" cy="10" r="2" fill="white" />
          </svg>
        </div>

        <div className="text-center mb-6">
          <h1 className="text-2xl font-bold text-[#1a2e1d] tracking-tight mb-1">
            Register Restaurant
          </h1>
          <p className="text-xs text-[#5a7a5f] leading-relaxed">
            Set up your restaurant details and location
          </p>
        </div>

        <div className="space-y-3.5">
          <div className="space-y-1">
            <label
              htmlFor="name"
              className="block text-xs font-medium text-[#2c4430]"
            >
              Restaurant Name *
            </label>
            <div className="relative flex items-center">
              <Store
                size={15}
                className="absolute left-3.5 text-[#7a9a7f] pointer-events-none"
              />
              <input
                id="name"
                type="text"
                placeholder="e.g., The Italian Corner"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full pl-10 pr-3.5 py-2.5 border-2 border-[#c3d6c7] rounded-xl text-sm bg-[#fafcfa] text-[#1a2e1d] placeholder-[#a8c0ac] focus:outline-none focus:border-[#3a5a40] focus:bg-white focus:shadow-[0_0_0_3px_rgba(58,90,64,0.12)] transition-all"
              />
            </div>
          </div>

          <div className="space-y-1">
            <label
              htmlFor="address"
              className="block text-xs font-medium text-[#2c4430]"
            >
              Address *
            </label>
            <div className="relative flex items-center">
              <MapPin
                size={15}
                className="absolute left-3.5 text-[#7a9a7f] pointer-events-none"
              />
              <input
                id="address"
                type="text"
                placeholder="123 Main St, City, Country"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                className="w-full pl-10 pr-3.5 py-2.5 border-2 border-[#c3d6c7] rounded-xl text-sm bg-[#fafcfa] text-[#1a2e1d] placeholder-[#a8c0ac] focus:outline-none focus:border-[#3a5a40] focus:bg-white focus:shadow-[0_0_0_3px_rgba(58,90,64,0.12)] transition-all"
              />
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex gap-3.5">
              <div className="space-y-1 flex-1">
                <label
                  htmlFor="latitude"
                  className="block text-xs font-medium text-[#2c4430]"
                >
                  Latitude *
                </label>
                <div className="relative flex items-center">
                  <Compass
                    size={15}
                    className="absolute left-3.5 text-[#7a9a7f] pointer-events-none"
                  />
                  <input
                    id="latitude"
                    type="number"
                    step="0.000001"
                    placeholder="e.g., 13.7563"
                    value={latitude}
                    onChange={(e) => setLatitude(e.target.value)}
                    className="w-full pl-10 pr-3.5 py-2.5 border-2 border-[#c3d6c7] rounded-xl text-sm bg-[#fafcfa] text-[#1a2e1d] placeholder-[#a8c0ac] focus:outline-none focus:border-[#3a5a40] focus:bg-white focus:shadow-[0_0_0_3px_rgba(58,90,64,0.12)] transition-all"
                  />
                </div>
              </div>

              <div className="space-y-1 flex-1">
                <label
                  htmlFor="longitude"
                  className="block text-xs font-medium text-[#2c4430]"
                >
                  Longitude *
                </label>
                <div className="relative flex items-center">
                  <Compass
                    size={15}
                    className="absolute left-3.5 text-[#7a9a7f] pointer-events-none"
                  />
                  <input
                    id="longitude"
                    type="number"
                    step="0.000001"
                    placeholder="e.g., 100.5018"
                    value={longitude}
                    onChange={(e) => setLongitude(e.target.value)}
                    className="w-full pl-10 pr-3.5 py-2.5 border-2 border-[#c3d6c7] rounded-xl text-sm bg-[#fafcfa] text-[#1a2e1d] placeholder-[#a8c0ac] focus:outline-none focus:border-[#3a5a40] focus:bg-white focus:shadow-[0_0_0_3px_rgba(58,90,64,0.12)] transition-all"
                  />
                </div>
              </div>
            </div>

            <button
              type="button"
              onClick={handleGetLocation}
              disabled={geoLoading || loading}
              className="w-full px-3.5 py-2.5 text-sm font-medium bg-[#3a5a40]/8 text-[#3a5a40] border-2 border-[#c3d6c7] rounded-xl hover:enabled:bg-[#3a5a40]/12 hover:enabled:border-[#3a5a40] disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2"
            >
              {geoLoading ? (
                <Loader2 size={14} className="animate-spin-custom" />
              ) : (
                <Map size={14} />
              )}
              {geoLoading ? "Getting location..." : "Use current location"}
            </button>

            <button
              type="button"
              onClick={handleMockLocation}
              disabled={loading}
              title="Bangkok, Thailand test location"
              className="w-full px-3.5 py-2.5 text-xs font-medium bg-purple-500/8 text-purple-700 border-2 border-purple-200 rounded-xl hover:enabled:bg-purple-500/12 hover:enabled:border-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2"
            >
              <Map size={14} />
              Use Mock Location (Testing)
            </button>
          </div>

          <div className="space-y-1">
            <label
              htmlFor="radius"
              className="block text-xs font-medium text-[#2c4430]"
            >
              Service Radius (meters) *
            </label>
            <div className="relative flex items-center">
              <MapPin
                size={15}
                className="absolute left-3.5 text-[#7a9a7f] pointer-events-none"
              />
              <input
                id="radius"
                type="number"
                min="10"
                step="100"
                placeholder="e.g., 1000"
                value={radius}
                onChange={(e) => setRadius(e.target.value)}
                className="w-full pl-10 pr-3.5 py-2.5 border-2 border-[#c3d6c7] rounded-xl text-sm bg-[#fafcfa] text-[#1a2e1d] placeholder-[#a8c0ac] focus:outline-none focus:border-[#3a5a40] focus:bg-white focus:shadow-[0_0_0_3px_rgba(58,90,64,0.12)] transition-all"
              />
            </div>
            <p className="text-xs text-[#7a9a7f] mt-1">
              Minimum 10 meters. Default is 1000 meters.
            </p>
          </div>

          <button
            onClick={handleSubmit}
            disabled={loading}
            className="w-full mt-1.5 px-3.5 py-3.5 text-sm font-semibold text-white bg-gradient-to-br from-[#3a5a40] to-[#2c4430] border-none rounded-xl hover:enabled:-translate-y-0.5 hover:enabled:shadow-[0_6px_20px_rgba(58,90,64,0.4)] enabled:shadow-[0_4px_14px_rgba(58,90,64,0.35)] active:enabled:translate-y-0 disabled:opacity-70 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2 min-h-12"
          >
            {loading ? (
              <Loader2 size={18} className="animate-spin-custom" />
            ) : (
              "Register Restaurant"
            )}
          </button>
        </div>

        <p className="text-center text-xs text-[#7a9a7f] mt-5">
          Created a restaurant?{" "}
          <button
            onClick={() => router.push("/register")}
            className="text-[#3a5a40] font-semibold underline underline-offset-2 hover:text-[#2c4430] transition-colors"
          >
            Register an admin account
          </button>
        </p>
      </div>
    </div>
  );
}
