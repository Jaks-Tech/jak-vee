import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Jak & Vee | Forever Us",
  description:
    "A private romantic web space for Jak and Vee to keep memories, photos, notes, links, and conversations.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full antialiased">
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
