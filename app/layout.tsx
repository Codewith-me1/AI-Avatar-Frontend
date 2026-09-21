import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/components/auth/AuthProvider";
import { ToastProvider } from "@/components/widget/Toast";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  // Needed for the relative OG/Twitter image URLs below to resolve.
  metadataBase: new URL("https://avatarx.net"),
  title: "avatarx — Realtime AI Avatar Platform",
  description:
    "Deploy lifelike AI avatars for real-time conversations, in any language.",
  // Tab and home-screen icons come from app/favicon.ico, app/icon.png and
  // app/apple-icon.png — the file convention Next recommends over this config.
  openGraph: {
    title: "avatarx — Realtime AI Avatar Platform",
    description:
      "Deploy lifelike AI avatars for real-time conversations, in any language.",
    url: "/",
    siteName: "avatarx",
    images: [{ url: "/logo/og.png", width: 1200, height: 630, alt: "avatarx" }],
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "avatarx — Realtime AI Avatar Platform",
    description:
      "Deploy lifelike AI avatars for real-time conversations, in any language.",
    images: ["/logo/og.png"],
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="light">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased min-h-screen text-slate-800`}
      >
        <AuthProvider>
          <ToastProvider>{children}</ToastProvider>
        </AuthProvider>




      </body>
    </html>
  );
}
