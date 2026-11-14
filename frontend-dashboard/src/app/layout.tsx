import "./globals.css";
import React from "react";
import { AmbientMotionBackground } from "@/components/AmbientMotionBackground";

const basePath = process.env.NEXT_PUBLIC_BASE_PATH || "";

export const metadata = {
  title: "Samuel Rencken | Trade Systems Studio: Deterministic CargoWise Pre-Audit Infrastructure",
  description:
    "High-throughput customs compliance and pre-payment freight audit infrastructure architected by Samuel Rencken. Intercepting 19 U.S.C. § 1592 penalties and 3% to 7% carrier overbilling before data enters CargoWise.",
  icons: {
    icon: `${basePath}/icon.svg`,
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark" suppressHydrationWarning>
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=5" />
        <link rel="icon" href={`${basePath}/icon.svg`} type="image/svg+xml" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&family=JetBrains+Mono:wght@400;500;600;700&family=Newsreader:ital,opsz,wght@0,6..72,400;0,6..72,500;1,6..72,400&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="antialiased bg-[#0B0F19] text-[#F8FAFC] selection:bg-blue-600 selection:text-white relative min-h-screen">
        <AmbientMotionBackground />
        <div className="relative z-10">
          {children}
        </div>
      </body>
    </html>
  );
}
