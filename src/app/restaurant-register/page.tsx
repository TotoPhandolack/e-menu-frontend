"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createRestaurant } from "@/lib/api";
import { toast } from "react-toastify";
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
      toast.success("ດຶງຕຳແໜ່ງສຳເລັດແລ້ວ");
    } catch (err) {
      toast.error("ດຶງຕຳແໜ່ງບໍ່ສຳເລັດ. ກະລຸນາເປີດການເຂົ້າເຖິງຕຳແໜ່ງ.");
    } finally {
      setGeoLoading(false);
    }
  };

  const handleMockLocation = () => {
    setLatitude("13.736666");
    setLongitude("100.523333");
    toast.success("ຕັ້ງຕຳແໜ່ງຈຳລອງແລ້ວ (Bangkok, Thailand)");
  };

  const handleSubmit = async () => {
    if (!name.trim() || !address.trim() || !latitude || !longitude) {
      toast.error("ກະລຸນາຕື່ມຂໍ້ມູນທີ່ຈຳເປັນທັງໝົດ");
      return;
    }

    const lat = parseFloat(latitude);
    const lng = parseFloat(longitude);
    const rad = parseInt(radius, 10);

    if (isNaN(lat) || isNaN(lng) || isNaN(rad)) {
      toast.error("ຄ່າພິກັດ ຫຼື ລັດສະໝີບໍ່ຖືກຕ້ອງ");
      return;
    }

    if (lat < -90 || lat > 90) {
      toast.error("ເສັ້ນຂະໜານຕ້ອງຢູ່ລະຫວ່າງ -90 ແລະ 90");
      return;
    }

    if (lng < -180 || lng > 180) {
      toast.error("ເສັ້ນແວງຕ້ອງຢູ່ລະຫວ່າງ -180 ແລະ 180");
      return;
    }

    if (rad < 10) {
      toast.error("ລັດສະໝີຕ້ອງຢ່າງໜ້ອຍ 10 ແມັດ");
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
    <div className="min-h-screen bg-gradient-to-br from-background via-accent to-muted flex items-center justify-center p-6 md:p-8 relative overflow-hidden">
      {/* Blob backgrounds */}
      <div className="absolute w-[420px] h-[420px] bg-gradient-to-br from-primary to-transparent rounded-full blur-[80px] opacity-30 pointer-events-none -top-[120px] -right-20 animate-float1" />
      <div className="absolute w-[300px] h-[300px] bg-gradient-to-br from-primary-strong/40 to-transparent rounded-full blur-[80px] opacity-30 pointer-events-none -bottom-20 -left-16 animate-float2" />
      <div className="absolute w-[200px] h-[200px] bg-gradient-to-br from-accent to-transparent rounded-full blur-[80px] opacity-30 pointer-events-none top-1/2 left-1/10 animate-float1-reverse" />

      <div className="bg-card/88 backdrop-blur-xl rounded-3xl p-8 md:p-10 w-full max-w-md shadow-lg relative z-10 animate-slideUp border border-border">
        <button
          onClick={() => router.back()}
          className="inline-flex items-center gap-1.5 text-xs font-medium text-muted-foreground hover:text-foreground transition-colors mb-5"
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
            className="drop-shadow-[0_4px_12px_var(--primary)]"
          >
            <rect width="28" height="28" rx="8" fill="var(--foreground)" />
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
          <h1 className="text-2xl font-bold text-foreground tracking-tight mb-1">
            Register Restaurant
          </h1>
          <p className="text-xs text-muted-foreground leading-relaxed">
            Set up your restaurant details and location
          </p>
        </div>

        <div className="space-y-3.5">
          <div className="space-y-1">
            <label
              htmlFor="name"
              className="block text-xs font-medium text-foreground"
            >
              Restaurant Name *
            </label>
            <div className="relative flex items-center">
              <Store
                size={15}
                className="absolute left-3.5 text-muted-foreground pointer-events-none"
              />
              <input
                id="name"
                type="text"
                placeholder="e.g., The Italian Corner"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full pl-10 pr-3.5 py-2.5 border-2 border-input rounded-xl text-sm bg-background text-foreground placeholder-muted-foreground focus:outline-none focus:border-ring focus:bg-card focus:shadow-[0_0_0_3px_color-mix(in_oklch,var(--ring)_45%,transparent)] transition-all"
              />
            </div>
          </div>

          <div className="space-y-1">
            <label
              htmlFor="address"
              className="block text-xs font-medium text-foreground"
            >
              Address *
            </label>
            <div className="relative flex items-center">
              <MapPin
                size={15}
                className="absolute left-3.5 text-muted-foreground pointer-events-none"
              />
              <input
                id="address"
                type="text"
                placeholder="123 Main St, City, Country"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                className="w-full pl-10 pr-3.5 py-2.5 border-2 border-input rounded-xl text-sm bg-background text-foreground placeholder-muted-foreground focus:outline-none focus:border-ring focus:bg-card focus:shadow-[0_0_0_3px_color-mix(in_oklch,var(--ring)_45%,transparent)] transition-all"
              />
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex gap-3.5">
              <div className="space-y-1 flex-1">
                <label
                  htmlFor="latitude"
                  className="block text-xs font-medium text-foreground"
                >
                  Latitude *
                </label>
                <div className="relative flex items-center">
                  <Compass
                    size={15}
                    className="absolute left-3.5 text-muted-foreground pointer-events-none"
                  />
                  <input
                    id="latitude"
                    type="number"
                    step="0.000001"
                    placeholder="e.g., 13.7563"
                    value={latitude}
                    onChange={(e) => setLatitude(e.target.value)}
                    className="w-full pl-10 pr-3.5 py-2.5 border-2 border-input rounded-xl text-sm bg-background text-foreground placeholder-muted-foreground focus:outline-none focus:border-ring focus:bg-card focus:shadow-[0_0_0_3px_color-mix(in_oklch,var(--ring)_45%,transparent)] transition-all"
                  />
                </div>
              </div>

              <div className="space-y-1 flex-1">
                <label
                  htmlFor="longitude"
                  className="block text-xs font-medium text-foreground"
                >
                  Longitude *
                </label>
                <div className="relative flex items-center">
                  <Compass
                    size={15}
                    className="absolute left-3.5 text-muted-foreground pointer-events-none"
                  />
                  <input
                    id="longitude"
                    type="number"
                    step="0.000001"
                    placeholder="e.g., 100.5018"
                    value={longitude}
                    onChange={(e) => setLongitude(e.target.value)}
                    className="w-full pl-10 pr-3.5 py-2.5 border-2 border-input rounded-xl text-sm bg-background text-foreground placeholder-muted-foreground focus:outline-none focus:border-ring focus:bg-card focus:shadow-[0_0_0_3px_color-mix(in_oklch,var(--ring)_45%,transparent)] transition-all"
                  />
                </div>
              </div>
            </div>

            <button
              type="button"
              onClick={handleGetLocation}
              disabled={geoLoading || loading}
              className="w-full px-3.5 py-2.5 text-sm font-medium bg-muted text-foreground border-2 border-input rounded-xl hover:enabled:bg-accent hover:enabled:border-primary/50 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2"
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
              className="w-full px-3.5 py-2.5 text-xs font-medium bg-primary/8 text-primary-strong border-2 border-border rounded-xl hover:enabled:bg-accent hover:enabled:border-primary/50 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2"
            >
              <Map size={14} />
              Use Mock Location (Testing)
            </button>
          </div>

          <div className="space-y-1">
            <label
              htmlFor="radius"
              className="block text-xs font-medium text-foreground"
            >
              Service Radius (meters) *
            </label>
            <div className="relative flex items-center">
              <MapPin
                size={15}
                className="absolute left-3.5 text-muted-foreground pointer-events-none"
              />
              <input
                id="radius"
                type="number"
                min="10"
                step="100"
                placeholder="e.g., 1000"
                value={radius}
                onChange={(e) => setRadius(e.target.value)}
                className="w-full pl-10 pr-3.5 py-2.5 border-2 border-input rounded-xl text-sm bg-background text-foreground placeholder-muted-foreground focus:outline-none focus:border-ring focus:bg-card focus:shadow-[0_0_0_3px_color-mix(in_oklch,var(--ring)_45%,transparent)] transition-all"
              />
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Minimum 10 meters. Default is 1000 meters.
            </p>
          </div>

          <button
            onClick={handleSubmit}
            disabled={loading}
            className="w-full mt-1.5 px-3.5 py-3.5 text-sm font-semibold text-primary-foreground bg-primary hover:enabled:bg-primary/90 border-none rounded-xl hover:enabled:-translate-y-0.5 hover:enabled:shadow-[0_6px_20px_color-mix(in_oklch,var(--primary)_60%,transparent)] enabled:shadow-[0_4px_14px_color-mix(in_oklch,var(--primary)_50%,transparent)] active:enabled:translate-y-0 disabled:opacity-70 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2 min-h-12"
          >
            {loading ? (
              <Loader2 size={18} className="animate-spin-custom" />
            ) : (
              "Register Restaurant"
            )}
          </button>
        </div>

        <p className="text-center text-xs text-muted-foreground mt-5">
          Created a restaurant?{" "}
          <button
            onClick={() => router.push("/register")}
            className="text-primary-strong font-semibold underline underline-offset-2 hover:text-foreground transition-colors"
          >
            Register an admin account
          </button>
        </p>
      </div>
    </div>
  );
}
