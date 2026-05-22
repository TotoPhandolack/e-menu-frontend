import type { Metadata, Viewport } from "next";
import { Outfit, Phetsarath } from "next/font/google";
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

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
};

export const metadata: Metadata = {
  title: "E-Menu",
  description: "Digital restaurant menu",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${outfit.variable} ${phetsarath.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col" suppressHydrationWarning>
        {children} <Toaster />
      </body>
    </html>
  );
}
