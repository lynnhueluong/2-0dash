import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "2.0 Collective | Your Career Data Infrastructure",
  description: "AI-guided advancement process that produces your personalized Ambition Profile — matching you to hyper-specific tools and resources for exactly where you are in your career.",
  keywords: ["career advancement", "ambition profile", "career inventory", "professional development"],
  openGraph: {
    title: "2.0 Collective",
    description: "Your personal career data infrastructure.",
    url: "https://dash.the20.co",
    siteName: "2.0 Collective",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased bg-[#0A0A0A] text-[#FAFAFA] min-h-screen`}>
        {children}
      </body>
    </html>
  );
}
