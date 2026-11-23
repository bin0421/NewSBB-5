import SiteHeader from "@/components/SiteHeader";
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
  title: "사이트 A",
  description: "스프링부트, Next.js 연동",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="ko"
      className={`${geistSans.variable} ${geistMono.variable} antialiased`}
    >
      <body className="flex flex-col min-h-screen">
        <SiteHeader />
        <main className="flex-grow flex flex-col p-2">{children}</main>
        <footer className="text-center p-2">푸터</footer>
      </body>
    </html>
  );
}
