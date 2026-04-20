"use client";

import React, { useRef, useState, useCallback } from "react";
import HTMLFlipBook from "react-pageflip";
import Image from "next/image";
import Link from "next/link";

/* ──────────────────────────────────────────────────────────
   Individual Page wrapper – must forward ref for react-pageflip
────────────────────────────────────────────────────────── */
const Page = React.forwardRef<
  HTMLDivElement,
  { children: React.ReactNode; className?: string }
>(({ children, className = "" }, ref) => (
  <div ref={ref} className={`flip-page ${className}`}>
    {children}
  </div>
));
Page.displayName = "Page";

/* ──────────────────────────────────────────────────────────
   Decorative SVG corner flourish
────────────────────────────────────────────────────────── */
const CornerFlourish = ({ flip = false }: { flip?: boolean }) => (
  <svg
    width="80"
    height="80"
    viewBox="0 0 80 80"
    fill="none"
    className={`corner-flourish ${flip ? "corner-flip" : ""}`}
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      d="M4 4 Q 20 4, 20 20 Q 20 36, 36 36 Q 52 36, 52 52 Q 52 68, 68 68"
      stroke="#3d6b4f"
      strokeWidth="1.5"
      fill="none"
      strokeLinecap="round"
    />
    <path
      d="M4 4 Q 4 20, 20 20 Q 36 20, 36 36 Q 36 52, 52 52 Q 68 52, 68 68"
      stroke="#3d6b4f"
      strokeWidth="0.8"
      fill="none"
      strokeLinecap="round"
      opacity="0.5"
    />
    <circle cx="4" cy="4" r="3" fill="#3d6b4f" opacity="0.7" />
    <circle cx="20" cy="20" r="2" fill="#3d6b4f" opacity="0.5" />
    <circle cx="52" cy="52" r="2" fill="#3d6b4f" opacity="0.5" />
    <circle cx="68" cy="68" r="3" fill="#3d6b4f" opacity="0.7" />
  </svg>
);

/* ──────────────────────────────────────────────────────────
   Divider vine decoration
────────────────────────────────────────────────────────── */
const VineDivider = () => (
  <svg
    viewBox="0 0 200 20"
    width="200"
    height="20"
    className="vine-divider"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      d="M10 10 Q 50 2, 100 10 Q 150 18, 190 10"
      stroke="#3d6b4f"
      strokeWidth="1.2"
      fill="none"
    />
    <circle cx="10" cy="10" r="3" fill="#3d6b4f" opacity="0.6" />
    <circle cx="55" cy="5" r="2" fill="#5a8a6a" opacity="0.5" />
    <circle cx="100" cy="10" r="2.5" fill="#3d6b4f" opacity="0.6" />
    <circle cx="145" cy="15" r="2" fill="#5a8a6a" opacity="0.5" />
    <circle cx="190" cy="10" r="3" fill="#3d6b4f" opacity="0.6" />
    <path d="M55 5 Q 58 0, 62 4" stroke="#5a8a6a" strokeWidth="0.8" fill="none" />
    <path d="M145 15 Q 148 10, 152 13" stroke="#5a8a6a" strokeWidth="0.8" fill="none" />
  </svg>
);

/* ──────────────────────────────────────────────────────────
   Page line rule (like old books)
────────────────────────────────────────────────────────── */
const LineRule = () => (
  <div className="line-rule">
    <span />
    <span className="line-rule-diamond">◆</span>
    <span />
  </div>
);

/* ──────────────────────────────────────────────────────────
   Main Flipbook Landing
────────────────────────────────────────────────────────── */
export default function FlipbookLanding() {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const bookRef = useRef<any>(null);
  const [currentPage, setCurrentPage] = useState(0);
  const [totalPages] = useState(8);
  const [isFlipping, setIsFlipping] = useState(false);

  const goNext = useCallback(() => {
    if (bookRef.current && !isFlipping) {
      bookRef.current.pageFlip().flipNext();
    }
  }, [isFlipping]);

  const goPrev = useCallback(() => {
    if (bookRef.current && !isFlipping) {
      bookRef.current.pageFlip().flipPrev();
    }
  }, [isFlipping]);

  const onFlip = useCallback((e: { data: number }) => {
    setCurrentPage(e.data);
  }, []);

  const onChangeState = useCallback((e: { data: string }) => {
    setIsFlipping(e.data === "flipping");
  }, []);

  return (
    <>
      {/* Google Fonts */}
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Caveat:wght@400;500;600;700&family=Dancing+Script:wght@400;500;600;700&family=IM+Fell+English:ital@0;1&family=Playfair+Display:ital,wght@0,400;0,600;1,400&display=swap');

        /* ── Root scene ── */
        .flipbook-scene {
          min-height: 100dvh;
          width: 100%;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          background: #f5f0e8;
          background-image:
            radial-gradient(ellipse at 20% 20%, rgba(61,107,79,0.06) 0%, transparent 60%),
            radial-gradient(ellipse at 80% 80%, rgba(61,107,79,0.08) 0%, transparent 60%),
            url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%233d6b4f' fill-opacity='0.03'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E");
          padding: 20px 16px 60px;
          position: relative;
          overflow: hidden;
        }

        /* Ambient botanical rings */
        .flipbook-scene::before {
          content: '';
          position: fixed;
          top: -150px; left: -150px;
          width: 400px; height: 400px;
          border: 1px solid rgba(61,107,79,0.12);
          border-radius: 50%;
          pointer-events: none;
        }
        .flipbook-scene::after {
          content: '';
          position: fixed;
          bottom: -100px; right: -100px;
          width: 300px; height: 300px;
          border: 1px solid rgba(61,107,79,0.10);
          border-radius: 50%;
          pointer-events: none;
        }

        /* ── Top header ── */
        .scene-tagline {
          font-family: 'Caveat', cursive;
          font-size: clamp(13px, 2vw, 17px);
          color: #5a8a6a;
          letter-spacing: 0.25em;
          text-transform: uppercase;
          margin-bottom: 12px;
          opacity: 0.9;
        }

        /* ── Book shadow stage ── */
        .book-stage {
          position: relative;
          filter: drop-shadow(0 20px 60px rgba(61,107,79,0.25)) drop-shadow(0 4px 16px rgba(0,0,0,0.15));
        }

        /* ── React-pageflip container ── */
        .stf__parent {
          border-radius: 2px;
        }

        /* ── Individual flip page ── */
        .flip-page {
          width: 100%;
          height: 100%;
          background: #fefcf7;
          position: relative;
          overflow: hidden;
          box-sizing: border-box;
        }

        /* Aged paper texture overlay */
        .flip-page::before {
          content: '';
          position: absolute;
          inset: 0;
          background-image:
            url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='300' height='300'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3CfeColorMatrix type='saturate' values='0'/%3E%3C/filter%3E%3Crect width='300' height='300' filter='url(%23noise)' opacity='0.04'/%3E%3C/svg%3E");
          pointer-events: none;
          z-index: 1;
        }

        /* Left page spine shadow */
        .flip-page.page-left::after {
          content: '';
          position: absolute;
          top: 0; right: 0;
          width: 30px;
          height: 100%;
          background: linear-gradient(to left, rgba(0,0,0,0.06), transparent);
          pointer-events: none;
          z-index: 2;
        }

        /* Right page spine shadow */
        .flip-page.page-right::after {
          content: '';
          position: absolute;
          top: 0; left: 0;
          width: 30px;
          height: 100%;
          background: linear-gradient(to right, rgba(0,0,0,0.08), transparent);
          pointer-events: none;
          z-index: 2;
        }

        /* ── Page inner content ── */
        .page-inner {
          position: relative;
          z-index: 3;
          height: 100%;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          padding: 28px 24px;
          text-align: center;
          box-sizing: border-box;
        }

        /* ── Corner flourishes ── */
        .corner-flourish {
          position: absolute;
          z-index: 4;
          opacity: 0.65;
        }
        .corner-flip {
          transform: rotate(180deg);
        }
        .corner-tl { top: 8px; left: 8px; }
        .corner-br { bottom: 8px; right: 8px; }

        /* ── Vine divider ── */
        .vine-divider { display: block; margin: 10px auto; opacity: 0.7; }

        /* ── Line rule ── */
        .line-rule {
          display: flex;
          align-items: center;
          gap: 10px;
          width: 80%;
          margin: 8px auto;
        }
        .line-rule span {
          flex: 1;
          height: 1px;
          background: linear-gradient(to right, transparent, #3d6b4f, transparent);
          opacity: 0.5;
        }
        .line-rule-diamond {
          color: #3d6b4f;
          font-size: 8px;
          opacity: 0.7;
          flex: none;
        }

        /* ── Typography ── */
        .font-handwriting { font-family: 'Caveat', cursive; }
        .font-dancing { font-family: 'Dancing Script', cursive; }
        .font-fell { font-family: 'IM Fell English', serif; }
        .font-playfair { font-family: 'Playfair Display', serif; }

        .page-number {
          font-family: 'IM Fell English', serif;
          font-size: 11px;
          color: #8aaa96;
          position: absolute;
          bottom: 16px;
          left: 50%;
          transform: translateX(-50%);
          z-index: 5;
          letter-spacing: 0.1em;
        }

        /* ── Cover page specific ── */
        .cover-page {
          background: #ffffff;
        }
        .cover-border {
          position: absolute;
          inset: 12px;
          border: 1.5px solid rgba(61,107,79,0.35);
          pointer-events: none;
          z-index: 4;
        }
        .cover-border-inner {
          position: absolute;
          inset: 17px;
          border: 0.5px solid rgba(61,107,79,0.2);
          pointer-events: none;
          z-index: 4;
        }

        /* ── Decorative heading underline ── */
        .heading-underline {
          width: 60px;
          height: 1.5px;
          background: linear-gradient(to right, transparent, #3d6b4f, transparent);
          margin: 6px auto;
        }

        /* ── Menu item row ── */
        .menu-item-row {
          display: flex;
          justify-content: space-between;
          align-items: baseline;
          width: 100%;
          gap: 6px;
          padding: 3px 0;
          border-bottom: 1px dotted rgba(61,107,79,0.25);
        }
        .menu-item-name {
          font-family: 'Caveat', cursive;
          font-size: 14px;
          color: #2d4e39;
          text-align: left;
          flex: 1;
        }
        .menu-item-price {
          font-family: 'IM Fell English', serif;
          font-size: 12px;
          color: #5a8a6a;
          white-space: nowrap;
        }

        /* ── Info block ── */
        .info-icon {
          font-size: 22px;
          margin-bottom: 4px;
        }

        /* ── CTA button ── */
        .cta-btn {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          padding: 10px 28px;
          background: #3d6b4f;
          color: #fefcf7;
          font-family: 'Dancing Script', cursive;
          font-size: 17px;
          font-weight: 600;
          border-radius: 2px;
          text-decoration: none;
          border: 1.5px solid #2d5040;
          box-shadow: 2px 3px 0 #2d5040, inset 0 1px 0 rgba(255,255,255,0.1);
          transition: transform 0.15s, box-shadow 0.15s;
          position: relative;
          z-index: 10;
          cursor: pointer;
          letter-spacing: 0.03em;
        }
        .cta-btn:hover {
          transform: translate(-1px, -1px);
          box-shadow: 3px 4px 0 #2d5040, inset 0 1px 0 rgba(255,255,255,0.1);
        }
        .cta-btn:active {
          transform: translate(1px, 1px);
          box-shadow: 1px 2px 0 #2d5040;
        }

        /* ── Navigation bar ── */
        .nav-bar {
          display: flex;
          align-items: center;
          gap: 20px;
          margin-top: 18px;
        }
        .nav-btn {
          width: 40px; height: 40px;
          border: 1.5px solid #3d6b4f;
          background: rgba(255,252,247,0.9);
          border-radius: 50%;
          cursor: pointer;
          display: flex; align-items: center; justify-content: center;
          font-size: 16px;
          color: #3d6b4f;
          transition: all 0.2s;
          backdrop-filter: blur(4px);
          user-select: none;
        }
        .nav-btn:hover { background: #3d6b4f; color: #fefcf7; }
        .nav-btn:disabled { opacity: 0.35; cursor: not-allowed; }
        .nav-btn:disabled:hover { background: rgba(255,252,247,0.9); color: #3d6b4f; }

        .page-indicator {
          font-family: 'IM Fell English', serif;
          font-size: 13px;
          color: #5a8a6a;
          letter-spacing: 0.08em;
          min-width: 80px;
          text-align: center;
        }

        /* ── Hint text ── */
        .hint-text {
          font-family: 'Caveat', cursive;
          font-size: 13px;
          color: #8aaa96;
          margin-top: 8px;
          letter-spacing: 0.05em;
          animation: hintPulse 2.5s ease-in-out infinite;
        }
        @keyframes hintPulse {
          0%, 100% { opacity: 0.6; }
          50% { opacity: 1; }
        }

        /* Tags / badge */
        .page-tag {
          display: inline-block;
          padding: 2px 10px;
          background: rgba(61,107,79,0.08);
          border: 1px solid rgba(61,107,79,0.25);
          border-radius: 1px;
          font-family: 'Caveat', cursive;
          font-size: 11px;
          color: #3d6b4f;
          letter-spacing: 0.2em;
          text-transform: uppercase;
          margin-bottom: 6px;
        }

        /* Stamp-like circle element */
        .stamp {
          width: 70px; height: 70px;
          border-radius: 50%;
          border: 2px solid rgba(61,107,79,0.4);
          display: flex; align-items: center; justify-content: center;
          flex-direction: column;
          margin: 8px auto;
          background: rgba(61,107,79,0.05);
          font-family: 'IM Fell English', serif;
          color: #3d6b4f;
        }

        /* Responsive */
        @media (max-width: 640px) {
          .page-inner { padding: 18px 14px; }
          .corner-flourish { width: 55px; height: 55px; }
        }
      `}</style>

      <section className="flipbook-scene">
        {/* Top tagline */}
        <p className="scene-tagline">— est. 2024 — Welcome to —</p>

        {/* Book */}
        <div className="book-stage">
          <HTMLFlipBook
            ref={bookRef}
            width={320}
            height={460}
            size="fixed"
            minWidth={260}
            maxWidth={400}
            minHeight={360}
            maxHeight={560}
            showCover={true}
            drawShadow={true}
            flippingTime={900}
            usePortrait={true}
            startZIndex={10}
            autoSize={false}
            maxShadowOpacity={0.45}
            mobileScrollSupport={false}
            clickEventForward={true}
            useMouseEvents={true}
            swipeDistance={30}
            showPageCorners={true}
            disableFlipByClick={false}
            onFlip={onFlip}
            onChangeState={onChangeState}
            className=""
            style={{}}
            startPage={0}
          >
            {/* ── PAGE 0 – COVER (Left hard cover) ── */}
            <Page className="cover-page">
              <div className="cover-border" />
              <div className="cover-border-inner" />
              <div className="corner-flourish corner-tl">
                <CornerFlourish />
              </div>
              <div className="corner-flourish corner-br">
                <CornerFlourish flip />
              </div>
              <div className="page-inner">
                <div className="page-tag">Cafe &amp; Bar</div>
                <div
                  style={{
                    position: "relative",
                    display: "inline-block",
                    padding: "10px",
                    border: "1.5px solid rgba(61,107,79,0.35)",
                  }}
                >
                  <Image
                    src="/somsa.jpg"
                    alt="SOMSA Cafe & Bar Logo"
                    width={160}
                    height={160}
                    style={{ objectFit: "contain", display: "block" }}
                    priority
                  />
                </div>
                <VineDivider />
                <p
                  style={{
                    fontFamily: "'Caveat', cursive",
                    fontSize: "13px",
                    color: "#5a8a6a",
                    letterSpacing: "0.2em",
                    textTransform: "uppercase",
                    marginTop: "4px",
                  }}
                >
                  Our Story & Menu
                </p>
                <div className="heading-underline" style={{ marginTop: "10px" }} />
                <p
                  style={{
                    fontFamily: "'IM Fell English', serif",
                    fontStyle: "italic",
                    fontSize: "11px",
                    color: "#8aaa96",
                    marginTop: "10px",
                    letterSpacing: "0.05em",
                  }}
                >
                  Turn the page to begin ›
                </p>
              </div>
            </Page>

            {/* ── PAGE 1 – Title page (Right) ── */}
            <Page className="page-right">
              <div className="corner-flourish corner-tl">
                <CornerFlourish />
              </div>
              <div className="corner-flourish corner-br">
                <CornerFlourish flip />
              </div>
              <div className="page-inner" style={{ gap: "6px" }}>
                <span
                  style={{
                    fontFamily: "'Caveat', cursive",
                    fontSize: "11px",
                    color: "#8aaa96",
                    letterSpacing: "0.25em",
                    textTransform: "uppercase",
                  }}
                >
                  Welcome to
                </span>
                <h1
                  style={{
                    fontFamily: "'Dancing Script', cursive",
                    fontSize: "42px",
                    fontWeight: 700,
                    color: "#2d4e39",
                    margin: "0",
                    lineHeight: "1.1",
                  }}
                >
                  Somsa
                </h1>
                <p
                  style={{
                    fontFamily: "'IM Fell English', serif",
                    fontSize: "13px",
                    color: "#5a8a6a",
                    letterSpacing: "0.3em",
                    textTransform: "uppercase",
                    margin: "0",
                  }}
                >
                  Cafe &amp; Bar
                </p>
                <LineRule />
                <p
                  style={{
                    fontFamily: "'Caveat', cursive",
                    fontSize: "15px",
                    color: "#3d5040",
                    lineHeight: "1.6",
                    maxWidth: "240px",
                    margin: "4px 0",
                  }}
                >
                  A place where every cup tells a story and every bite carries a memory.
                </p>
                <VineDivider />
                <div className="stamp">
                  <span style={{ fontSize: "9px", letterSpacing: "0.1em" }}>SINCE</span>
                  <span style={{ fontSize: "18px", fontWeight: 600 }}>2024</span>
                </div>
              </div>
              <span className="page-number">i</span>
            </Page>

            {/* ── PAGE 2 – Our Story (Left) ── */}
            <Page className="page-left">
              <div className="corner-flourish corner-tl">
                <CornerFlourish />
              </div>
              <div className="corner-flourish corner-br">
                <CornerFlourish flip />
              </div>
              <div className="page-inner" style={{ gap: "8px" }}>
                <div className="page-tag">Our Story</div>
                <h2
                  style={{
                    fontFamily: "'Dancing Script', cursive",
                    fontSize: "28px",
                    fontWeight: 600,
                    color: "#2d4e39",
                    margin: "4px 0",
                  }}
                >
                  A Labour of Love
                </h2>
                <div className="heading-underline" />
                <p
                  style={{
                    fontFamily: "'Caveat', cursive",
                    fontSize: "14.5px",
                    color: "#3d4a40",
                    lineHeight: "1.7",
                    maxWidth: "250px",
                    textAlign: "left",
                  }}
                >
                  Somsa was born from a dream to create a sanctuary — where handcrafted coffee meets artisan bites in an atmosphere that feels like home.
                </p>
                <VineDivider />
                <p
                  style={{
                    fontFamily: "'IM Fell English', serif",
                    fontStyle: "italic",
                    fontSize: "12.5px",
                    color: "#5a8a6a",
                    lineHeight: "1.6",
                    maxWidth: "240px",
                    textAlign: "left",
                  }}
                >
                  "Good food shared with good people is the greatest gift of all."
                </p>
                <p
                  style={{
                    fontFamily: "'Caveat', cursive",
                    fontSize: "11px",
                    color: "#8aaa96",
                    textAlign: "right",
                    alignSelf: "flex-end",
                    marginRight: "20px",
                  }}
                >
                  — The Somsa Family
                </p>
              </div>
              <span className="page-number">1</span>
            </Page>

            {/* ── PAGE 3 – Atmosphere (Right) ── */}
            <Page className="page-right">
              <div className="corner-flourish corner-tl">
                <CornerFlourish />
              </div>
              <div className="corner-flourish corner-br">
                <CornerFlourish flip />
              </div>
              <div className="page-inner" style={{ gap: "10px" }}>
                <div className="page-tag">The Atmosphere</div>
                <h2
                  style={{
                    fontFamily: "'Dancing Script', cursive",
                    fontSize: "26px",
                    fontWeight: 600,
                    color: "#2d4e39",
                    margin: "4px 0",
                  }}
                >
                  Every Corner, a Story
                </h2>
                <div className="heading-underline" />
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "1fr 1fr",
                    gap: "10px",
                    width: "100%",
                    margin: "8px 0",
                  }}
                >
                  {[
                    { icon: "🌿", title: "Garden Terrace", desc: "Dine among lush greenery" },
                    { icon: "☕", title: "Craft Coffee", desc: "Single-origin beans" },
                    { icon: "🕯️", title: "Candlelit Evenings", desc: "Warm & intimate nights" },
                    { icon: "🎵", title: "Live Music", desc: "Fri & Sat evenings" },
                  ].map((item) => (
                    <div
                      key={item.title}
                      style={{
                        border: "1px solid rgba(61,107,79,0.2)",
                        borderRadius: "2px",
                        padding: "8px 6px",
                        background: "rgba(61,107,79,0.03)",
                      }}
                    >
                      <div className="info-icon">{item.icon}</div>
                      <p style={{ fontFamily: "'Dancing Script', cursive", fontSize: "13px", color: "#2d4e39", margin: "2px 0", fontWeight: 600 }}>{item.title}</p>
                      <p style={{ fontFamily: "'Caveat', cursive", fontSize: "11px", color: "#7a9a84", margin: 0 }}>{item.desc}</p>
                    </div>
                  ))}
                </div>
                <VineDivider />
              </div>
              <span className="page-number">2</span>
            </Page>

            {/* ── PAGE 4 – Drinks Menu (Left) ── */}
            <Page className="page-left">
              <div className="corner-flourish corner-tl">
                <CornerFlourish />
              </div>
              <div className="corner-flourish corner-br">
                <CornerFlourish flip />
              </div>
              <div className="page-inner" style={{ gap: "6px" }}>
                <div className="page-tag">Beverages</div>
                <h2
                  style={{
                    fontFamily: "'Dancing Script', cursive",
                    fontSize: "26px",
                    fontWeight: 600,
                    color: "#2d4e39",
                    margin: "2px 0",
                  }}
                >
                  Craft Drinks
                </h2>
                <div className="heading-underline" />
                <div style={{ width: "100%", padding: "0 8px" }}>
                  {[
                    { name: "Signature Cold Brew", price: "85฿" },
                    { name: "Honey Lavender Latte", price: "90฿" },
                    { name: "Matcha Ceremonial", price: "95฿" },
                    { name: "Forest Berry Soda", price: "75฿" },
                    { name: "Vintage Lemon Press", price: "70฿" },
                    { name: "Handcrafted Chai", price: "80฿" },
                  ].map((item) => (
                    <div key={item.name} className="menu-item-row">
                      <span className="menu-item-name">{item.name}</span>
                      <span className="menu-item-price">{item.price}</span>
                    </div>
                  ))}
                </div>
                <VineDivider />
                <p
                  style={{
                    fontFamily: "'IM Fell English', serif",
                    fontStyle: "italic",
                    fontSize: "10px",
                    color: "#8aaa96",
                  }}
                >
                  All beverages crafted with care
                </p>
              </div>
              <span className="page-number">3</span>
            </Page>

            {/* ── PAGE 5 – Food Menu (Right) ── */}
            <Page className="page-right">
              <div className="corner-flourish corner-tl">
                <CornerFlourish />
              </div>
              <div className="corner-flourish corner-br">
                <CornerFlourish flip />
              </div>
              <div className="page-inner" style={{ gap: "6px" }}>
                <div className="page-tag">Cuisine</div>
                <h2
                  style={{
                    fontFamily: "'Dancing Script', cursive",
                    fontSize: "26px",
                    fontWeight: 600,
                    color: "#2d4e39",
                    margin: "2px 0",
                  }}
                >
                  Garden Bites
                </h2>
                <div className="heading-underline" />
                <div style={{ width: "100%", padding: "0 8px" }}>
                  {[
                    { name: "Avocado Toast & Herbs", price: "120฿" },
                    { name: "Eggs Benedict Garden", price: "145฿" },
                    { name: "Mushroom Bruschetta", price: "110฿" },
                    { name: "Smoked Salmon Plate", price: "165฿" },
                    { name: "Granola & Coconut Bowl", price: "95฿" },
                    { name: "Afternoon Tea Set", price: "199฿" },
                  ].map((item) => (
                    <div key={item.name} className="menu-item-row">
                      <span className="menu-item-name">{item.name}</span>
                      <span className="menu-item-price">{item.price}</span>
                    </div>
                  ))}
                </div>
                <VineDivider />
                <p
                  style={{
                    fontFamily: "'IM Fell English', serif",
                    fontStyle: "italic",
                    fontSize: "10px",
                    color: "#8aaa96",
                  }}
                >
                  Seasonal ingredients, daily fresh
                </p>
              </div>
              <span className="page-number">4</span>
            </Page>

            {/* ── PAGE 6 – Visit Us (Left) ── */}
            <Page className="page-left">
              <div className="corner-flourish corner-tl">
                <CornerFlourish />
              </div>
              <div className="corner-flourish corner-br">
                <CornerFlourish flip />
              </div>
              <div className="page-inner" style={{ gap: "10px" }}>
                <div className="page-tag">Find Us</div>
                <h2
                  style={{
                    fontFamily: "'Dancing Script', cursive",
                    fontSize: "26px",
                    fontWeight: 600,
                    color: "#2d4e39",
                    margin: "4px 0",
                  }}
                >
                  Come Visit
                </h2>
                <LineRule />
                {[
                  { icon: "📍", label: "Location", value: "123 Garden Lane,\nChiang Mai 50200" },
                  { icon: "🕐", label: "Hours", value: "Mon–Fri  8am – 9pm\nSat–Sun  9am – 10pm" },
                  { icon: "📞", label: "Reserve", value: "+66 53 123 456" },
                  { icon: "✉️", label: "Email", value: "hello@somsacafe.com" },
                ].map((info) => (
                  <div
                    key={info.label}
                    style={{
                      display: "flex",
                      alignItems: "flex-start",
                      gap: "10px",
                      textAlign: "left",
                      width: "100%",
                    }}
                  >
                    <span style={{ fontSize: "16px", marginTop: "2px" }}>{info.icon}</span>
                    <div>
                      <p style={{ fontFamily: "'Caveat', cursive", fontSize: "10px", color: "#8aaa96", margin: 0, letterSpacing: "0.15em", textTransform: "uppercase" }}>{info.label}</p>
                      <p style={{ fontFamily: "'IM Fell English', serif", fontSize: "12px", color: "#3d4a40", margin: "1px 0 0", whiteSpace: "pre-line", lineHeight: "1.5" }}>{info.value}</p>
                    </div>
                  </div>
                ))}
                <VineDivider />
              </div>
              <span className="page-number">5</span>
            </Page>

            {/* ── PAGE 7 – CTA Back Cover (Right hard) ── */}
            <Page className="cover-page page-right">
              <div className="cover-border" />
              <div className="cover-border-inner" />
              <div className="corner-flourish corner-tl">
                <CornerFlourish />
              </div>
              <div className="corner-flourish corner-br">
                <CornerFlourish flip />
              </div>
              <div className="page-inner" style={{ gap: "14px" }}>
                <Image
                  src="/somsa.jpg"
                  alt="SOMSA"
                  width={90}
                  height={90}
                  style={{ objectFit: "contain", opacity: 0.8 }}
                />
                <h2
                  style={{
                    fontFamily: "'Dancing Script', cursive",
                    fontSize: "24px",
                    fontWeight: 700,
                    color: "#2d4e39",
                    margin: "0",
                  }}
                >
                  Ready to Order?
                </h2>
                <p
                  style={{
                    fontFamily: "'Caveat', cursive",
                    fontSize: "14px",
                    color: "#5a8a6a",
                    marginBottom: "4px",
                  }}
                >
                  Scan the QR at your table or browse our full digital menu
                </p>
                <Link href="/menu" className="cta-btn">
                  <span>🍃</span>
                  <span>View Full Menu</span>
                </Link>
                <VineDivider />
                <p
                  style={{
                    fontFamily: "'IM Fell English', serif",
                    fontStyle: "italic",
                    fontSize: "11px",
                    color: "#8aaa96",
                  }}
                >
                  Thank you for being our guest
                </p>
              </div>
            </Page>
          </HTMLFlipBook>
        </div>

        {/* Navigation */}
        <nav className="nav-bar">
          <button
            className="nav-btn"
            onClick={goPrev}
            disabled={currentPage === 0}
            aria-label="Previous page"
          >
            ‹
          </button>
          <span className="page-indicator">
            {currentPage === 0
              ? "Cover"
              : `${currentPage} / ${totalPages - 2}`}
          </span>
          <button
            className="nav-btn"
            onClick={goNext}
            disabled={currentPage >= totalPages - 1}
            aria-label="Next page"
          >
            ›
          </button>
        </nav>

        <p className="hint-text">✦ Click or drag the corner to turn the page ✦</p>
      </section>
    </>
  );
}
