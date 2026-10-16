import type { Metadata } from "next";
import { Anybody, Hanken_Grotesk } from "next/font/google";
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
  title: "Profile",
  description: "A thoughtful introduction and a closer look at my work.",
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
