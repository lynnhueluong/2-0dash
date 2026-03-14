import type { Metadata } from "next";
import { Inter_Tight } from "next/font/google";
import "./globals.css";

const interTight = Inter_Tight({
  variable: "--font-inter-tight",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
});

export const metadata: Metadata = {
  title: "2.0 Dash",
  description: "AI-guided advancement process that produces your personalized Ambition Profile — matching you to hyper-specific tools and resources for exactly where you are in your career.",
  keywords: ["career advancement", "ambition profile", "career inventory", "professional development"],
  openGraph: {
    title: "2.0 Dash",
    description: "Your personal career data infrastructure.",
    url: "https://dash.the20.co",
    siteName: "2.0 Dash",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${interTight.variable} antialiased bg-white text-gray-900 min-h-screen`}>
        {children}
      </body>
    </html>
  );
}
