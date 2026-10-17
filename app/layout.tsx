import type { Metadata } from "next";
import { Anybody, Hanken_Grotesk } from "next/font/google";
import { getSiteUrl } from "@/lib/seo/site-url";
import "./globals.css";

const anybody = Anybody({
  subsets: ["latin"],
  variable: "--font-anybody",
});

const hankenGrotesk = Hanken_Grotesk({
  subsets: ["latin"],
  variable: "--font-hanken-grotesk",
});

export const metadata: Metadata = {
  metadataBase: getSiteUrl(),
  title: {
    default: "Vrajesh Darji | Full-stack developer",
    template: "%s | Vrajesh Darji",
  },
  description: "Vrajesh Darji is a full-stack developer building thoughtful digital experiences and strengthening his security practice.",
  alternates: { canonical: "/" },
  openGraph: {
    type: "website",
    siteName: "Vrajesh Darji",
    title: "Vrajesh Darji | Full-stack developer",
    description: "Thoughtful digital experiences, selected work, and a little about how they are made.",
    url: "/",
    images: [{ url: "/opengraph-image", width: 1200, height: 630, alt: "Vrajesh Darji, full-stack developer" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Vrajesh Darji | Full-stack developer",
    description: "Thoughtful digital experiences and selected work.",
    images: ["/opengraph-image"],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${anybody.variable} ${hankenGrotesk.variable}`}>
        {children}
      </body>
    </html>
  );
}
