import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { headers } from "next/headers";
import "./globals.css";
import { auth, isAuthEnabled } from "@/lib/auth";
import { SignOutButton } from "./sign-out-button";

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
        {sessionEmail && <SignOutButton email={sessionEmail} />}
        {children}
      </body>
    </html>
  );
}
