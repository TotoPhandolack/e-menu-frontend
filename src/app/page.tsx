"use client";

import dynamic from "next/dynamic";

// react-pageflip relies on browser DOM APIs; must be loaded client-side only
const FlipbookLanding = dynamic(
  () => import("@/components/landing/FlipbookLanding"),
  {
    ssr: false,
    loading: () => (
      <div
        style={{
          minHeight: "100dvh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "#f5f0e8",
          fontFamily: "serif",
          color: "#3d6b4f",
          fontSize: "18px",
          letterSpacing: "0.1em",
        }}
      >
        Opening the book…
      </div>
    ),
  }
);

export default function FlipbookPage() {
  return <FlipbookLanding />;
}
