import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { headers } from "next/headers";
import "./globals.css";
import { auth, isAuthEnabled } from "@/lib/auth";
import { SignOutButton } from "./sign-out-button";
import { PWARegister } from "./pwa-register";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Study Kit",
  description: "Organize courses, sections, and study notes.",
  applicationName: "Study Kit",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "Study Kit",
  },
  icons: {
    icon: [
      { url: "/icon.svg", type: "image/svg+xml" },
      { url: "/favicon.ico", sizes: "48x48" },
    ],
    apple: [{ url: "/icon.svg", type: "image/svg+xml" }],
  },
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#ffffff" },
    { media: "(prefers-color-scheme: dark)", color: "#0a0a0a" },
  ],
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  let sessionEmail: string | null = null;
  if (isAuthEnabled && auth) {
    const session = await auth.api.getSession({ headers: await headers() });
    sessionEmail = session?.user?.email ?? null;
  }

  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <PWARegister />
        {sessionEmail && <SignOutButton email={sessionEmail} />}
        {children}
      </body>
    </html>
  );
}
