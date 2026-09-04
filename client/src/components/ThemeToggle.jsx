import { useTheme } from '../context/ThemeContext';

/* ============================================================
   THEME TOGGLE — Sun / Moon animated button
   Drop anywhere in a header: <ThemeToggle />
   ============================================================ */

export default function ThemeToggle({ size = 'md' }) {
  const { theme, toggle } = useTheme();
  const isDark = theme === 'dark';
  const base = size === 'sm'
    ? 'w-8 h-8 text-sm'
    : 'w-9 h-9 text-base';

  return (
    <button
      type="button"
      aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
      onClick={toggle}
      className={`${base} rounded-xl flex items-center justify-center transition-all duration-200
        bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300
        hover:bg-zinc-200 dark:hover:bg-zinc-700 active:scale-95 shrink-0`}
    >
      {isDark ? (
        /* Sun icon */
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4">
          <circle cx="12" cy="12" r="4" />
          <path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41" />
        </svg>
      ) : (
        /* Moon icon */
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4">
          <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
        </svg>
      )}
    </button>
  );
}
