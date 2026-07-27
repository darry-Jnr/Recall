interface NavbarProps {
  showAnalytics?: boolean;
  onToggleAnalytics?: () => void;
}

export function Navbar({ showAnalytics, onToggleAnalytics }: NavbarProps) {
  return (
    <nav className="relative z-10 w-full px-8 h-16 flex items-center">
      <span className="font-[var(--font-heading)] text-lg font-extrabold tracking-[0.15em] uppercase">
        RECALL
      </span>
      {onToggleAnalytics && (
        <div className="absolute left-1/2 -translate-x-1/2">
          <button
            onClick={onToggleAnalytics}
            className={`text-sm font-medium transition-all duration-200 ${
              showAnalytics
                ? "text-text-primary underline underline-offset-4"
                : "text-text-secondary hover:text-text-primary"
            }`}
          >
            Analytics
          </button>
        </div>
      )}
    </nav>
  );
}
