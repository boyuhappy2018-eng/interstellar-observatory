import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Interstellar — A Relativistic Observatory",
  description: "An interactive GPU-ray-traced black hole observatory.",
  other: {
    "codex-preview": "development",
  },
  icons: {
    icon: "/favicon.svg",
    shortcut: "/favicon.svg",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased">{children}</body>
    </html>
  );
}
