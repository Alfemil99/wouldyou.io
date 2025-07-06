"use client";

export default function Footer() {
  return (
    <footer className="w-full py-6 text-center text-sm text-base-content/50">
      <p className="font-bold">WOULDYOU.IO</p>
      <p>Vote, share & see what the world thinks</p>
      <p className="mt-2">© {new Date().getFullYear()} WouldYou.IO</p>
    </footer>
  );
}
