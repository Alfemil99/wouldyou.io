"use client";

export default function Footer() {
  return (
    <footer className="w-full bg-base-200 border-t border-base-300 mt-12">
      <div className="max-w-7xl mx-auto px-4 py-6 flex flex-col items-center text-center text-sm text-base-content/70">
        <h4 className="text-lg font-bold">WOULDYOU.IO</h4>
        <p className="opacity-80">Vote, share & see what the world thinks</p>
        <div className="mt-2 flex flex-wrap gap-4 text-xs">
          <a href="#" className="link link-hover opacity-60">Privacy</a>
          <a href="#" className="link link-hover opacity-60">Terms</a>
          <a href="#" className="link link-hover opacity-60">Contact</a>
        </div>
        <p className="mt-2 opacity-50">© {new Date().getFullYear()} WouldYou.IO</p>
      </div>
    </footer>
  );
}
