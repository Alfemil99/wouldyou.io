import "./globals.css";
import { ReactNode } from "react";
import Script from "next/script"; // ✅ importér Script!
import Header from "@/components/Header";
import Footer from "@/components/Footer";

export const metadata = {
  title: "WOULDYOU.IO",
  description: "Vote, share & see what the world thinks!",
  icons: {
    icon: "/logo.svg",
  },
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" data-theme="dark">
      <head>
        {/* ✅ Ekstra meta hvis du vil */}
      </head>
      <body className="relative flex flex-col min-h-screen overflow-x-hidden bg-base-100 text-base-content">
        
        {/* === AdSense Script === */}
        <Script
          async
          src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-5747384081350738"
          crossOrigin="anonymous"
          strategy="afterInteractive"
        />

        {/* === Header === */}
        <Header />

        {/* === Main Content === */}
        <main className="relative z-10 flex-grow w-full max-w-7xl mx-auto px-4">
          {children}
        </main>

        {/* === Footer === */}
        <Footer />
      </body>
    </html>
  );
}
