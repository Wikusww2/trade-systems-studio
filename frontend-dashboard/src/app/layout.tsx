import "./globals.css";
import "../styles/typography.css";
import React from "react";
import { AmbientMotionBackground } from "@/components/AmbientMotionBackground";
import { MotionProvider } from "@/components/MotionProvider";

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
          href="https://fonts.googleapis.com/css2?family=Inter:opsz,wght@14..32,300..800&family=JetBrains+Mono:wght@300..700&family=Newsreader:ital,opsz,wght@0,6..72,400..600;1,6..72,400..600&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="antialiased bg-canvas-dark text-ink-primary font-sans selection:bg-cobalt-600 selection:text-canvas-stone relative min-h-screen">
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:fixed focus:top-2 focus:left-2 focus:z-50 focus:px-4 focus:py-2 focus:bg-cobalt-600 focus:text-canvas-stone focus:rounded focus:outline-none focus:ring-2 focus:ring-ink-primary"
        >
          Skip to main content
        </a>
        <AmbientMotionBackground />
        <MotionProvider>
          <div className="relative z-10">
            {children}
          </div>
        </MotionProvider>
      </body>
    </html>
  );
}
