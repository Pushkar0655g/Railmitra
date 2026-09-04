import { Link } from 'react-router-dom';
import { useTheme } from '../context/ThemeContext';

import logoHorizontalDark  from '../assets/logo/logo-horizontal-dark.svg';
import logoHorizontalLight from '../assets/logo/logo-horizontal-light.svg';
import iconColor           from '../assets/logo/icon-color.svg';

/* ============================================================
   BRAND COMPONENT — Theme-aware SVG Logo
   dark theme  → logo-horizontal-dark.svg  (light-coloured wordmark)
   light theme → logo-horizontal-light.svg (dark-coloured wordmark)
   badge-only  → icon-color.svg
   ============================================================ */

export default function Brand({ sub, dark: forceDark, iconOnly = false, noLink = false }) {
  const { theme } = useTheme();
  // forceDark prop overrides theme detection (used on black header backgrounds)
  const isDark = forceDark !== undefined ? forceDark : theme === 'dark';

  const content = (
    <>
      {iconOnly ? (
        /* Badge/icon only — always coloured */
        <img
          src={iconColor}
          alt="OneCoolie"
          className="w-9 h-9 object-contain transition-transform duration-200 group-hover:scale-105"
        />
      ) : (
        /* Full horizontal wordmark — switches by theme */
        <img
          src={isDark ? logoHorizontalDark : logoHorizontalLight}
          alt="OneCoolie"
          className="h-8 w-auto object-contain transition-transform duration-200 group-hover:scale-[1.02]"
        />
      )}

      {sub && (
        <span
          className={`text-[10px] font-mono font-medium tracking-wide px-2 py-0.5 rounded-full border transition-colors ${
            isDark
              ? 'bg-[#0a0f1c] text-[#94a3b8] border-[#1a1f2e]'
              : 'bg-[#f5f5f7] text-[#6b7280] border-[#e5e5e7]'
          }`}
        >
          {sub}
        </span>
      )}
    </>
  );

  const className = "inline-flex items-center gap-2.5 group select-none shrink-0";

  if (noLink) {
    return <div className={className}>{content}</div>;
  }

  return (
    <Link to="/" className={className}>
      {content}
    </Link>
  );
}