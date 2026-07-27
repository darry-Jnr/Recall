import Link from "next/link";

const steps = [
  {
    num: "01",
    title: "Download & Unzip",
    desc: "Download the extension archive from GitHub and extract the zip folder onto your computer.",
    icon: (
      <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
        <polyline points="7 10 12 15 17 10" />
        <line x1="12" y1="15" x2="12" y2="3" />
      </svg>
    ),
  },
  {
    num: "02",
    title: "Enable Developer Mode",
    desc: "Open chrome://extensions in a new tab and toggle Developer Mode on in the top-right corner.",
    icon: (
      <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="3" />
        <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
      </svg>
    ),
  },
  {
    num: "03",
    title: "Load Unpacked",
    desc: 'Click "Load unpacked" in the top-left corner and select the extracted extension folder.',
    icon: (
      <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z" />
      </svg>
    ),
  },
];

export default function InstallPage() {
  return (
    <div className="min-h-screen bg-canvas flex flex-col">
      {/* Top bar */}
      <nav className="w-full px-8 h-16 flex items-center">
        <Link
          href="/"
          className="flex items-center gap-2 text-sm font-medium text-text-secondary hover:text-text-primary transition-colors duration-200"
        >
          <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="19" y1="12" x2="5" y2="12" />
            <polyline points="12 19 5 12 12 5" />
          </svg>
          Back to Home
        </Link>
      </nav>

      {/* Content */}
      <main className="flex-1 flex items-center justify-center px-6 py-12">
        <div className="w-full max-w-2xl">
          {/* Header */}
          <div className="text-center mb-12">
            <h1 className="font-[var(--font-heading)] text-4xl md:text-5xl font-bold tracking-tight text-text-primary mb-4">
              Install Recall Extension
            </h1>
            <p className="text-text-secondary text-lg">
              Follow these 3 simple steps to load the extension in Developer Mode.
            </p>
          </div>

          {/* Download CTA */}
          <div className="flex justify-center mb-12">
            <a
              href="https://github.com/darry-Jnr/Recall/archive/refs/heads/main.zip"
              target="_blank"
              rel="noopener noreferrer"
              className="h-12 px-8 rounded-full bg-accent hover:bg-accent-hover text-white font-[var(--font-heading)] text-[15px] font-semibold transition-colors inline-flex items-center gap-2 shadow-lg shadow-accent/20"
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                <polyline points="7 10 12 15 17 10" />
                <line x1="12" y1="15" x2="12" y2="3" />
              </svg>
              Download Extension
            </a>
          </div>

          {/* Steps */}
          <div className="space-y-4">
            {steps.map((step) => (
              <div
                key={step.num}
                className="flex gap-5 p-6 rounded-2xl bg-surface-2 border border-divider"
              >
                <div className="shrink-0 w-12 h-12 rounded-xl bg-accent/10 flex items-center justify-center text-accent">
                  {step.icon}
                </div>
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xs font-mono text-accent font-semibold">Step {step.num}</span>
                  </div>
                  <h3 className="text-base font-semibold text-text-primary mb-1">
                    {step.title}
                  </h3>
                  <p className="text-sm text-text-secondary leading-relaxed">
                    {step.desc}
                  </p>
                </div>
              </div>
            ))}
          </div>

          {/* Done note */}
          <p className="text-center text-text-muted text-xs mt-8">
            That&apos;s it! The Recall icon will appear in your Chrome toolbar.
          </p>
        </div>
      </main>
    </div>
  );
}
