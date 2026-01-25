'use client';

export default function Footer() {
  return (
    <footer className="mt-auto py-4 border-t border-[var(--border)] bg-[var(--glass-bg)]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-[var(--foreground-secondary)]">
          <span>Muallif: Ergashev Muhammadsodiq</span>
          <span>Tel: +998(99) 752-05-65</span>
        </div>
      </div>
    </footer>
  );
}
