// src/app/order-status/page.tsx
"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { useCartStore } from "@/stores/cart.store";

function OrderSuccessContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const table_id = searchParams.get("table_id");
  const token = searchParams.get("token");
  const qty = Number(searchParams.get("qty") ?? "0");
  const { clearCart } = useCartStore();

  // Track animation stages
  const [stage, setStage] = useState<"enter" | "check" | "text">("enter");

  useEffect(() => {
    clearCart();
    // Sequence: circle draws → checkmark draws → text fades in
    const t1 = setTimeout(() => setStage("check"), 300);
    const t2 = setTimeout(() => setStage("text"), 900);
    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleOk = () => {
    // Navigate back to the same table menu page
    if (token) {
      router.push(`/menu?token=${token}`);
    } else if (table_id) {
      router.push(`/menu?table_id=${table_id}`);
    } else {
      router.push("/");
    }
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "#f5f5f5",
        fontFamily: "'Inter', 'Segoe UI', sans-serif",
        padding: "16px",
      }}
    >
      {/* Card */}
      <div
        style={{
          background: "#ffffff",
          borderRadius: "24px",
          padding: "48px 40px 40px",
          maxWidth: "340px",
          width: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          boxShadow: "0 4px 32px rgba(0,0,0,0.08)",
        }}
      >
        {/* Animated circle + checkmark */}
        <div style={{ width: "120px", height: "120px", marginBottom: "24px" }}>
          <svg
            viewBox="0 0 120 120"
            width="120"
            height="120"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            {/* Background circle */}
            <circle cx="60" cy="60" r="54" stroke="#e8f5e9" strokeWidth="6" />

            {/* Animated green ring */}
            <circle
              cx="60"
              cy="60"
              r="54"
              stroke="#2e7d32"
              strokeWidth="6"
              strokeLinecap="round"
              strokeDasharray="339.3"
              strokeDashoffset={stage === "enter" ? 339.3 : 0}
              style={{
                transition:
                  "stroke-dashoffset 0.6s cubic-bezier(0.4,0,0.2,1)",
                transformOrigin: "50% 50%",
                transform: "rotate(-90deg)",
              }}
            />

            {/* Animated checkmark */}
            <polyline
              points="36,62 52,78 84,44"
              stroke="#2e7d32"
              strokeWidth="7"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeDasharray="80"
              strokeDashoffset={
                stage === "enter" || stage === "check" ? 80 : 0
              }
              style={{
                transition:
                  stage === "check"
                    ? "stroke-dashoffset 0s"
                    : "stroke-dashoffset 0.45s cubic-bezier(0.4,0,0.2,1) 0.05s",
              }}
            />
          </svg>
        </div>

        {/* Text block */}
        <div
          style={{
            textAlign: "center",
            width: "100%",
            opacity: stage === "text" ? 1 : 0,
            transform:
              stage === "text" ? "translateY(0)" : "translateY(10px)",
            transition: "opacity 0.4s ease, transform 0.4s ease",
          }}
        >
          <h1
            style={{
              fontSize: "22px",
              fontWeight: "700",
              color: "#2e7d32",
              marginBottom: "10px",
              letterSpacing: "-0.3px",
            }}
          >
            Oh Yeah!
          </h1>
          <p
            style={{
              fontSize: "15px",
              color: "#555",
              lineHeight: "1.6",
              marginBottom: "16px",
            }}
          >
            Your order is successful,
            <br />
            please wait a moment.
          </p>

          {/* Order summary pill */}
          {qty > 0 && (
            <div
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "6px",
                background: "#f0fdf4",
                border: "1.5px solid #bbf7d0",
                borderRadius: "99px",
                padding: "6px 16px",
                marginBottom: "24px",
                fontSize: "13px",
                color: "#15803d",
                fontWeight: 600,
              }}
            >
              🛒 ສັ່ງແລ້ວ {qty} ລາຍການ
            </div>
          )}

          {/* Ok button */}
          <div style={{ marginTop: qty > 0 ? 0 : "24px" }}>
            <button
              id="order-success-ok"
              onClick={handleOk}
              style={{
                background: "#2e7d32",
                color: "#ffffff",
                border: "none",
                borderRadius: "8px",
                padding: "10px 36px",
                fontSize: "15px",
                fontWeight: "600",
                cursor: "pointer",
                letterSpacing: "0.3px",
                transition: "background 0.18s, transform 0.1s",
              }}
              onMouseEnter={(e) =>
                ((e.currentTarget as HTMLButtonElement).style.background =
                  "#1b5e20")
              }
              onMouseLeave={(e) =>
                ((e.currentTarget as HTMLButtonElement).style.background =
                  "#2e7d32")
              }
              onMouseDown={(e) =>
                ((e.currentTarget as HTMLButtonElement).style.transform =
                  "scale(0.96)")
              }
              onMouseUp={(e) =>
                ((e.currentTarget as HTMLButtonElement).style.transform =
                  "scale(1)")
              }
            >
              Ok
            </button>
          </div>
        </div>
      </div>

      {/* Google Font */}
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700&display=swap');
      `}</style>
    </div>
  );
}

export default function OrderStatusPage() {
  return (
    <Suspense
      fallback={
        <div
          style={{
            minHeight: "100vh",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            background: "#f5f5f5",
          }}
        >
          <p style={{ color: "#999" }}>ກຳລັງໂຫຼດ...</p>
        </div>
      }
    >
      <OrderSuccessContent />
    </Suspense>
  );
}
