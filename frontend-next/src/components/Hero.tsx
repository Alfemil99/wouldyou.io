"use client";

export default function Hero() {
  return (
    <section className="hero py-12 bg-base-100 text-center">
      <div className="hero-content flex flex-col items-center">
        <h1 className="text-4xl md:text-5xl font-bold mb-4">WOULDYOU.IO</h1>
        <p className="max-w-xl mb-6 text-base md:text-lg text-neutral-content">
          Vote, share & see what the world thinks — anytime, anywhere.
        </p>
        <button className="btn btn-primary">Start Polling</button>
      </div>
    </section>
  );
}
