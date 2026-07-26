export function Hero() {
  return (
    <main className="relative z-10 flex-1 flex flex-col items-center justify-center text-center px-6">
      <h1 className="font-[var(--font-heading)] text-5xl md:text-7xl font-bold tracking-tight leading-[1.05] mb-5 max-w-4xl">
        Recall
      </h1>

      <p className="text-text-secondary text-lg leading-relaxed mb-10 max-w-xl">
        Your browsing memory, locally stored.
      </p>

      <a href="/search" className="h-12 px-12 rounded-full bg-surface-2 hover:bg-surface-3 text-text-primary font-[var(--font-heading)] text-[15px] font-semibold transition-colors inline-flex items-center border border-divider">
        Search History
      </a>
    </main>
  );
}
