import type { Metadata, Viewport } from "next";
import { Outfit, Noto_Sans_Lao, Caveat, Roboto_Mono } from "next/font/google";
import localFont from "next/font/local";
import "./globals.css";
import "react-toastify/dist/ReactToastify.css";
import { ToastContainer } from "react-toastify";
import AuthSessionProvider from "@/components/sessionProvider";

const outfit = Outfit({
  variable: "--font-outfit",
  subsets: ["latin"],
  weight: ["100", "200", "300", "400", "500", "600", "700", "800", "900"],
  display: "swap",
});

const phetsarath = localFont({
  variable: "--font-phetsarath",
  display: "swap",
  src: [
    { path: "./fonts/Phetsarath-400.woff2", weight: "400", style: "normal" },
    { path: "./fonts/Phetsarath-700.woff2", weight: "700", style: "normal" },
  ],
});

const notoSansLao = Noto_Sans_Lao({
  variable: "--font-noto-lao",
  subsets: ["lao"],
  weight: ["400", "700"],
  display: "swap",
});

const caveat = Caveat({
  variable: "--font-caveat-var",
  subsets: ["latin"],
  weight: ["400", "600", "700"],
  display: "swap",
});

const robotoMono = Roboto_Mono({
  variable: "--font-roboto-mono",
  subsets: ["latin"],
  weight: ["400", "500", "700"],
  style: ["normal", "italic"],
  display: "swap",
});

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
};

export const metadata: Metadata = {
  title: "E-Menu",
  description: "Digital restaurant menu",
  icons: {
    icon: "/images/logo.png",
    shortcut: "/images/logo.png",
    apple: "/images/logo.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${outfit.variable} ${phetsarath.variable} ${notoSansLao.variable} ${caveat.variable} ${robotoMono.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col" suppressHydrationWarning>
        <AuthSessionProvider>{children}</AuthSessionProvider>
        <ToastContainer position="top-right" autoClose={3000} />
      </body>
    </html>
  );
}
