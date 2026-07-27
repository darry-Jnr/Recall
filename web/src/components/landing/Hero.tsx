export function Hero() {
  return (
    <main className="relative z-10 flex-1 flex flex-col items-center text-center px-6 pt-16 md:pt-24">
      {/* Heading */}
      <h1 className="font-[var(--font-heading)] text-5xl md:text-7xl font-bold tracking-tight leading-[1.05] mb-5 max-w-4xl">
        Your browsing memory,
        <br />
        <span className="text-accent">locally stored.</span>
      </h1>

      <p className="text-text-secondary text-lg leading-relaxed mb-10 max-w-xl">
        Recall remembers every page you visit so you never lose track.
        Search your history with AI, filter and delete what you don&apos;t need.
      </p>

      {/* Buttons */}
      <div className="flex items-center gap-4 mb-16">
        <a
          href="/search"
          className="h-12 px-8 rounded-full bg-accent hover:bg-accent-hover text-white font-[var(--font-heading)] text-[15px] font-semibold transition-colors inline-flex items-center gap-2 shadow-lg shadow-accent/20"
        >
          Enter Recall
        </a>
        <a
          href="#"
          className="h-12 px-8 rounded-full bg-surface-2 hover:bg-surface-3 text-text-primary font-[var(--font-heading)] text-[15px] font-semibold transition-colors inline-flex items-center gap-2 border border-divider"
        >
          <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
            <polyline points="7 10 12 15 17 10" />
            <line x1="12" y1="15" x2="12" y2="3" />
          </svg>
          Install Extension
        </a>
      </div>

      {/* Video */}
      <div className="w-full max-w-4xl mx-auto px-4">
        <div className="rounded-2xl overflow-hidden border border-divider shadow-2xl shadow-black/40 bg-surface-1">
          <video
            autoPlay
            loop
            muted
            playsInline
            className="w-full h-auto block"
            poster=""
          >
            <source src="/demo.mp4" type="video/mp4" />
          </video>
        </div>
      </div>
    </main>
  );
}
