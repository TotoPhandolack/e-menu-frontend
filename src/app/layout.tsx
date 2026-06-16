import type { Metadata, Viewport } from "next";
import { Outfit, Phetsarath, Noto_Sans_Lao, Caveat, Roboto_Mono } from "next/font/google";
import "./globals.css";
import "react-toastify/dist/ReactToastify.css";
import { Toaster } from "sonner";

const outfit = Outfit({
  variable: "--font-outfit",
  subsets: ["latin"],
  weight: ["100", "200", "300", "400", "500", "600", "700", "800", "900"],
  display: "swap",
});

const phetsarath = Phetsarath({
  variable: "--font-phetsarath",
  subsets: ["lao"],
  weight: ["400", "700"],
  display: "swap",
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
    icon: "/images/icon.png",
    shortcut: "/images/icon.png",
    apple: "/images/icon.png",
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
        {children} <Toaster />
      </body>
    </html>
  );
}
