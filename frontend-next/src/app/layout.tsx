import "./globals.css";
import { ReactNode } from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

export const metadata = {
  title: "WouldYou.IO",
  description: "Vote, share & see what the world thinks!",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" data-theme="dark">
      <body className="relative flex flex-col min-h-screen overflow-x-hidden bg-base-100 text-base-content">
        
        {/* === Radial Glow === */}
        <div className="pointer-events-none absolute inset-0 -z-10 overflow-visible">
          <div className="absolute left-1/3 top-1/4 h-[600px] w-[600px] rounded-full 
            bg-gradient-radial from-primary/30 via-secondary/20 to-transparent 
            blur-3xl opacity-40 animate-pulse" />
          <div className="absolute right-1/4 bottom-0 h-[400px] w-[400px] rounded-full 
            bg-gradient-radial from-secondary/30 via-accent/20 to-transparent 
            blur-3xl opacity-30 animate-pulse" />
        </div>

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
