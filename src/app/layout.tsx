import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "AutoEditing Video - AI-Powered Video Editing",
  description: "Platform autoediting video dengan AI. Upload video background, frame, avatar AI, dan footage promo untuk proses editing otomatis melalui n8n.",
  keywords: ["AutoEditing", "Video Editing", "AI", "n8n", "Next.js", "TypeScript", "Tailwind CSS", "shadcn/ui"],
  authors: [{ name: "AutoEditing Team" }],
  icons: {
    icon: "/autoediting-logo.png",
  },
  openGraph: {
    title: "AutoEditing Video - AI-Powered Video Editing",
    description: "Platform autoediting video dengan AI dan integrasi n8n",
    url: "https://chat.z.ai",
    siteName: "AutoEditing",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "AutoEditing Video - AI-Powered Video Editing",
    description: "Platform autoediting video dengan AI dan integrasi n8n",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-background text-foreground`}
      >
        {children}
        <Toaster />
      </body>
    </html>
  );
}