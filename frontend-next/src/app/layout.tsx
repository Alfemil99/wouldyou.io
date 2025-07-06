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
    <html lang="en" data-theme="forest">
      <body className="flex flex-col min-h-screen">
        {/* DaisyUI Header */}
        <Header />

        {/* Main Content */}
        <main className="flex-grow">
          {children}
        </main>

        {/* DaisyUI Footer */}
        <Footer />

      </body>
    </html>
  );
}
