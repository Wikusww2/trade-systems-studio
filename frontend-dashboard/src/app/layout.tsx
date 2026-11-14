import "./globals.css";
import React from "react";

const basePath = process.env.NEXT_PUBLIC_BASE_PATH || "";

export const metadata = {
  title: "Samuel | Autonomous TradeTech Systems Studio",
  description:
    "Autonomous Trade Intelligence & Customs Defense Systems architected by Samuel. Defending global importers against 7-figure 19 U.S.C. § 1592 penalties and intercepting 5%–15% in carrier overbilling.",
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
    <html lang="en" suppressHydrationWarning>
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=5" />
        <link rel="icon" href={`${basePath}/icon.svg`} type="image/svg+xml" />
      </head>
      <body className="antialiased selection:bg-sky-500 selection:text-white">
        {children}
      </body>
    </html>
  );
}
