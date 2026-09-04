import { useState, useEffect, useRef, useCallback } from 'react';
import { Link } from 'react-router-dom';
import ThemeToggle from '../components/ThemeToggle';
import { useTheme } from '../context/ThemeContext';
import logoDark from '../assets/logo/logo-horizontal-dark.svg';
import logoLight from '../assets/logo/logo-horizontal-light.svg';

/* ─── 1. Brand Logo & Identity ─── */
function HomeBrand({ withTagline = false }) {
  const { theme } = useTheme();
  return (
    <Link to="/" className="inline-flex flex-col group select-none">
      <img src={theme === 'dark' ? logoDark : logoLight} alt="OneCoolie" className="h-7 w-auto object-contain" />
      {withTagline && (
        <span className="text-[10px] font-medium text-zinc-400 tracking-wide mt-0.5 hidden min-[380px]:block">
          Making every journey easier
        </span>
      )}
    </Link>
  );
}

/* ─── 2. Top Navigation Bar (Header) ─── */
function HomeNavbar() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 15);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  // Close mobile drawer on escape key
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') setMobileMenuOpen(false);
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const navItems = [
    { label: 'Services', href: '#services' },
    { label: 'How it works', href: '#how-it-works' },
    { label: 'Safety', href: '#safety' },
    { label: 'Stations', href: '#stations' },
  ];

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-40 transition-all duration-200 ${
        scrolled
          ? 'bg-white/95 dark:bg-[#05080f]/95 backdrop-blur-md border-b border-zinc-200/80 dark:border-[#1f2734] shadow-xs py-2.5 sm:py-3'
          : 'bg-white/70 dark:bg-[#05080f]/70 sm:bg-transparent backdrop-blur-xs sm:backdrop-blur-none py-3 sm:py-4 border-b border-zinc-100/50 dark:border-[#1f2734]/50 sm:border-transparent'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between">
        {/* Logo (byte-identical) */}
        <div className="flex items-center gap-2">
          <HomeBrand withTagline={true} />
        </div>

        {/* Center Desktop Navigation Links */}
        <nav className="hidden md:flex items-center gap-7 lg:gap-9 text-sm font-medium text-zinc-600 dark:text-zinc-400">
          {navItems.map((item) => (
            <a
              key={item.label}
              href={item.href}
              className="hover:text-black dark:hover:text-white transition-colors py-1"
            >
              {item.label}
            </a>
          ))}
        </nav>

        {/* Right CTA Button & Theme Toggle */}
        <div className="hidden sm:flex items-center gap-3">
          <ThemeToggle size="sm" />
          <Link
            to="/auth"
            className="inline-flex items-center justify-center gap-1.5 bg-black text-white dark:bg-white dark:text-black dark:hover:bg-zinc-200 text-xs font-semibold px-4 py-2.5 rounded-full hover:bg-zinc-800 transition-all duration-150 shadow-xs cursor-pointer"
          >
            <span>Book OneCoolie</span>
            <span className="text-sm font-light">&rarr;</span>
          </Link>
        </div>

        {/* Mobile Actions */}
        <div className="flex sm:hidden items-center gap-2">
          <Link
            to="/auth"
            className="inline-flex items-center justify-center bg-black text-white dark:bg-white dark:text-black dark:hover:bg-zinc-200 text-[11px] font-semibold px-3 py-1.5 rounded-full hover:bg-zinc-800 transition-all shadow-xs"
          >
            Book &rarr;
          </Link>
          <button
            type="button"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-1.5 text-zinc-700 dark:text-zinc-300 hover:text-black dark:hover:text-white rounded-lg focus:outline-none focus:bg-zinc-100 dark:focus:bg-zinc-800 transition-colors"
            aria-label="Toggle mobile menu"
            aria-expanded={mobileMenuOpen}
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
              {mobileMenuOpen ? (
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
              )}
            </svg>
          </button>
        </div>
      </div>

      {/* Mobile Slide Drawer with Backdrop */}
      {mobileMenuOpen && (
        <>
          <div
            className="fixed inset-0 top-[52px] bg-black/40 backdrop-blur-xs z-30 sm:hidden animate-fade-in"
            onClick={() => setMobileMenuOpen(false)}
          />
          <div className="relative sm:hidden bg-white dark:bg-[#05080f] border-b border-zinc-200 dark:border-[#1f2734] px-5 py-4 space-y-4 shadow-xl animate-fade-in z-40">
            <div className="flex items-center justify-between pb-2 border-b border-zinc-100 dark:border-[#1f2734]">
              <span className="text-xs font-semibold text-zinc-600 dark:text-zinc-400">Appearance</span>
              <ThemeToggle size="sm" />
            </div>

            <nav className="flex flex-col space-y-2 text-sm font-medium text-zinc-700 dark:text-zinc-300">
              {navItems.map((item) => (
                <a
                  key={item.label}
                  href={item.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className="hover:text-black dark:hover:text-white py-2 border-b border-zinc-100 dark:border-[#1f2734] flex items-center justify-between min-h-[44px]"
                >
                  <span>{item.label}</span>
                  <span className="text-zinc-300 dark:text-zinc-600 text-xs">&rarr;</span>
                </a>
              ))}
            </nav>
            <div className="pt-2 flex flex-col gap-2">
              <Link
                to="/auth"
                onClick={() => setMobileMenuOpen(false)}
                className="w-full text-center bg-black text-white dark:bg-white dark:text-black dark:hover:bg-zinc-200 text-xs font-semibold py-3 rounded-full shadow-xs active:scale-[0.99] min-h-[44px] flex items-center justify-center"
              >
                Book OneCoolie &rarr;
              </Link>
              <Link
                to="/assistant-auth"
                onClick={() => setMobileMenuOpen(false)}
                className="w-full text-center bg-zinc-100 text-zinc-800 dark:bg-[#0a0f1c] dark:text-zinc-200 text-xs font-semibold py-2.5 rounded-full border border-zinc-200 dark:border-[#1f2734] active:scale-[0.99] min-h-[44px] flex items-center justify-center"
              >
                Assistant Portal
              </Link>
            </div>
          </div>
        </>
      )}
    </header>
  );
}

/* ─── 3. Hero Section with Image Slider ─── */
const HERO_SLIDES = [
  { src: '/images/hero-slide-1.jpg', alt: 'OneCoolie verified assistants helping passengers at the station' },
  { src: '/images/hero-slide-2.jpg', alt: 'Wheelchair assistance and senior citizen escort at Indian railway platform' },
  { src: '/images/hero-slide-3.jpg', alt: 'Luggage porter carrying bags from platform to train coach' },
];

function HomeHero() {
  const [current, setCurrent] = useState(0);
  const [paused, setPaused] = useState(false);
  const touchStartX = useRef(null);

  const goTo = useCallback((i) => setCurrent((i + HERO_SLIDES.length) % HERO_SLIDES.length), []);
  const next = useCallback(() => goTo(current + 1), [current, goTo]);
  const prev = useCallback(() => goTo(current - 1), [current, goTo]);

  // Auto-advance every 4s
  useEffect(() => {
    if (paused) return;
    const id = setInterval(() => setCurrent((c) => (c + 1) % HERO_SLIDES.length), 4000);
    return () => clearInterval(id);
  }, [paused]);

  // Touch swipe handlers
  const onTouchStart = (e) => { touchStartX.current = e.touches[0].clientX; };
  const onTouchEnd = (e) => {
    if (touchStartX.current === null) return;
    const dx = e.changedTouches[0].clientX - touchStartX.current;
    if (Math.abs(dx) > 40) { dx < 0 ? next() : prev(); }
    touchStartX.current = null;
  };

  return (
    <section className="relative pt-20 sm:pt-32 pb-8 sm:pb-20 px-4 sm:px-6 lg:px-8 bg-white dark:bg-[#05080f] overflow-hidden">
      {/* ── Soft Neutral Organic Wave Backdrop ── */}
      <div className="absolute top-0 right-0 bottom-0 w-full lg:w-[62%] pointer-events-none overflow-hidden select-none z-0">
        <svg viewBox="0 0 1000 700" fill="none" preserveAspectRatio="none" className="absolute inset-0 w-full h-full">
          <path d="M 220 0 C 80 130, 140 230, 40 370 C -30 490, 70 610, 180 700 L 1000 700 L 1000 0 Z" fill="url(#hero-wave)" />
          <defs>
            <linearGradient id="hero-wave" x1="1000" y1="0" x2="0" y2="700" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="var(--oc-bg-alt)" stopOpacity="0.95" />
              <stop offset="45%" stopColor="var(--oc-bg-alt)" stopOpacity="0.75" />
              <stop offset="85%" stopColor="var(--oc-bg-alt)" stopOpacity="0.4" />
              <stop offset="100%" stopColor="var(--oc-bg-main)" stopOpacity="0" />
            </linearGradient>
          </defs>
        </svg>
        <div className="absolute top-0 right-0 w-[550px] h-[450px] bg-gradient-to-bl from-zinc-200/30 dark:from-zinc-800/20 via-zinc-100/20 dark:via-zinc-900/10 to-transparent blur-3xl pointer-events-none" />
      </div>

      <div className="max-w-7xl mx-auto grid lg:grid-cols-12 gap-6 sm:gap-8 lg:gap-14 items-center relative z-10">
        {/* Left Column */}
        <div className="lg:col-span-6 space-y-4 sm:space-y-7">
          <div>
            <span className="inline-flex items-center gap-2 px-3 sm:px-4 py-1.5 rounded-full bg-zinc-100/90 dark:bg-[#0a0f1c] border border-zinc-200/80 dark:border-[#1f2734] text-zinc-800 dark:text-zinc-200 text-xs font-semibold max-w-full">
              <span className="flex items-center gap-1.5 shrink-0">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                <span>Pan India Railway Assistance</span>
              </span>
              <span className="hidden sm:inline text-zinc-300 dark:text-zinc-700 font-light">|</span>
              <span className="hidden sm:inline text-zinc-500 dark:text-zinc-400 font-normal truncate">Trusted. Safe. Hassle-Free.</span>
            </span>
          </div>

          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black tracking-tight text-zinc-950 dark:text-white leading-[1.12]">
            Go anywhere<br />
            by rail with<br />
            <span className="text-blue-600">OneCoolie.</span>
          </h1>

          <p className="text-sm sm:text-base lg:text-lg text-zinc-600 dark:text-zinc-400 max-w-xl leading-relaxed font-normal">
            Verified services, wheelchair escort and on-demand assistance — for a smoother, safer, and stress-free journey.
          </p>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5 sm:gap-4 pt-1">
            <Link
              to="/auth"
              className="inline-flex items-center justify-center gap-2 bg-black text-white hover:bg-zinc-800 dark:bg-white dark:text-black dark:hover:bg-zinc-200 active:scale-[0.98] text-sm font-bold px-7 py-3.5 rounded-full shadow-sm transition-all duration-150 cursor-pointer text-center w-full sm:w-auto min-h-[48px]"
            >
              <span>Book Assistance</span>
              <span className="text-base font-light">&rarr;</span>
            </Link>

            <a
              href="#how-it-works"
              className="inline-flex items-center justify-center gap-2.5 bg-white dark:bg-[#0a0f1c] hover:bg-zinc-50 dark:hover:bg-[#0d1420] active:scale-[0.98] text-zinc-900 dark:text-white text-sm font-bold px-6 py-3.5 rounded-full border border-zinc-200/90 dark:border-[#1f2734] shadow-2xs transition-all duration-150 cursor-pointer text-center w-full sm:w-auto min-h-[48px]"
            >
              <div className="w-5 h-5 rounded-full bg-blue-600 text-white flex items-center justify-center text-[10px]">
                ▶
              </div>
              <span>How It Works</span>
            </a>
          </div>

          {/* Micro Trust Bar */}
          <div className="pt-4 sm:pt-5 grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-4 border-t border-zinc-200/70 dark:border-[#1f2734] mt-2">
            <div className="flex items-center gap-2 sm:gap-2.5 p-2 sm:p-0 rounded-xl bg-zinc-50/70 sm:bg-transparent dark:bg-zinc-900/40 border border-zinc-100 dark:border-zinc-800 sm:border-0">
              <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-zinc-100 dark:bg-zinc-800/60 text-blue-600 border border-zinc-200 dark:border-zinc-700/60 flex items-center justify-center shrink-0">
                <svg className="w-3.5 h-3.5 sm:w-4 sm:h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
              </div>
              <span className="text-[11px] font-semibold text-zinc-700 dark:text-zinc-300 leading-tight">
                Verified<br />Assistants
              </span>
            </div>
            <div className="flex items-center gap-2 sm:gap-2.5 p-2 sm:p-0 rounded-xl bg-zinc-50/70 sm:bg-transparent dark:bg-zinc-900/40 border border-zinc-100 dark:border-zinc-800 sm:border-0">
              <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-zinc-100 dark:bg-zinc-800/60 text-blue-600 border border-zinc-200 dark:border-zinc-700/60 flex items-center justify-center shrink-0 font-bold text-xs">
                ₹
              </div>
              <span className="text-[11px] font-semibold text-zinc-700 dark:text-zinc-300 leading-tight">
                Transparent<br />Pricing
              </span>
            </div>
            <div className="flex items-center gap-2 sm:gap-2.5 p-2 sm:p-0 rounded-xl bg-zinc-50/70 sm:bg-transparent dark:bg-zinc-900/40 border border-zinc-100 dark:border-zinc-800 sm:border-0">
              <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-zinc-100 dark:bg-zinc-800/60 text-blue-600 border border-zinc-200 dark:border-zinc-700/60 flex items-center justify-center shrink-0">
                <svg className="w-3.5 h-3.5 sm:w-4 sm:h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                  <circle cx="12" cy="12" r="10" />
                  <polyline points="12 6 12 12 16 14" />
                </svg>
              </div>
              <span className="text-[11px] font-semibold text-zinc-700 dark:text-zinc-300 leading-tight">
                On-Demand<br />Service
              </span>
            </div>
            <div className="flex items-center gap-2 sm:gap-2.5 p-2 sm:p-0 rounded-xl bg-zinc-50/70 sm:bg-transparent dark:bg-zinc-900/40 border border-zinc-100 dark:border-zinc-800 sm:border-0">
              <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-zinc-100 dark:bg-zinc-800/60 text-blue-600 border border-zinc-200 dark:border-zinc-700/60 flex items-center justify-center shrink-0">
                <svg className="w-3.5 h-3.5 sm:w-4 sm:h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>
              <span className="text-[11px] font-semibold text-zinc-700 dark:text-zinc-300 leading-tight">
                Across<br />Major Stations
              </span>
            </div>
          </div>
        </div>

        {/* Right Column: Hero Slider */}
        <div className="lg:col-span-6 relative z-10 flex items-center justify-center mt-2 lg:mt-0">
          <div
            className="relative w-full rounded-2xl sm:rounded-[36px] overflow-hidden border-2 sm:border-[3px] border-white/95 dark:border-[#1f2734] shadow-[0_15px_40px_-10px_rgba(0,0,0,0.08)] bg-white dark:bg-[#0a0f1c] select-none"
            onMouseEnter={() => setPaused(true)}
            onMouseLeave={() => setPaused(false)}
            onTouchStart={onTouchStart}
            onTouchEnd={onTouchEnd}
          >
            {/* Fixed aspect container */}
            <div className="relative w-full" style={{ aspectRatio: '4/3' }}>
              {HERO_SLIDES.map((slide, i) => (
                <img
                  key={slide.src}
                  src={slide.src}
                  alt={slide.alt}
                  className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-700 ${i === current ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
                  loading={i === 0 ? 'eager' : 'lazy'}
                />
              ))}
            </div>

            {/* Prev / Next Arrows */}
            <button
              type="button"
              onClick={prev}
              aria-label="Previous slide"
              className="absolute left-2 sm:left-3 top-1/2 -translate-y-1/2 w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-white/80 dark:bg-black/60 backdrop-blur-sm flex items-center justify-center text-zinc-800 dark:text-white hover:bg-white dark:hover:bg-black/80 transition-all shadow-md z-20 cursor-pointer"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" /></svg>
            </button>
            <button
              type="button"
              onClick={next}
              aria-label="Next slide"
              className="absolute right-2 sm:right-3 top-1/2 -translate-y-1/2 w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-white/80 dark:bg-black/60 backdrop-blur-sm flex items-center justify-center text-zinc-800 dark:text-white hover:bg-white dark:hover:bg-black/80 transition-all shadow-md z-20 cursor-pointer"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" /></svg>
            </button>

            {/* Dots */}
            <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex items-center gap-1.5 z-20">
              {HERO_SLIDES.map((_, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => goTo(i)}
                  aria-label={`Go to slide ${i + 1}`}
                  className={`rounded-full transition-all duration-300 cursor-pointer ${i === current ? 'w-6 h-2 bg-white shadow-md' : 'w-2 h-2 bg-white/50 hover:bg-white/70'}`}
                />
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ─── 4. Our Services Section (100% Fidelity to Reference with Ultra-High Resolution Cards) ─── */
function HomeServices() {
  const scrollRef = useRef(null);

  const scroll = (direction) => {
    if (scrollRef.current) {
      const { scrollLeft, clientWidth } = scrollRef.current;
      const scrollAmount = clientWidth * 0.75;
      scrollRef.current.scrollTo({
        left: direction === 'left' ? scrollLeft - scrollAmount : scrollLeft + scrollAmount,
        behavior: 'smooth',
      });
    }
  };

  const services = [
    {
      id: 'luggage-porter',
      title: 'Luggage Porter',
      image: '/images/service-card-luggage.jpg',
      alt: 'Luggage Porter - Baggage handling from concourse directly to your coach berth. Safe handling, Trained assistants, Hassle-free travel. Book Assistance.',
    },
    {
      id: 'seat-escort',
      title: 'Seat Escort',
      image: '/images/service-card-escort.jpg',
      alt: 'Seat Escort - We accompany you to your seat for a safe and comfortable journey. Coach guidance, Seat confirmation, Extra support. Book Assistance.',
    },
    {
      id: 'wheelchair-care',
      title: 'Wheelchair Care',
      image: '/images/service-card-wheelchair.jpg',
      alt: 'Wheelchair Care - Dedicated mobility assistance for senior citizens and patients. Trained and sensitive staff, Safe and comfortable, End-to-end support. Book Assistance.',
    },
    {
      id: 'exit-transfer',
      title: 'Exit Transfer',
      image: '/images/service-card-transfer.jpg',
      alt: 'Exit Transfer - Coach-to-curb escorting to app cabs and station exits. Guided till station exit, Help with cabs and autos, Smooth onward journey. Book Assistance.',
    },
  ];

  return (
    <section id="services" className="py-10 sm:py-20 px-4 sm:px-6 lg:px-8 bg-[#f5f6f8] dark:bg-[#0a0f1c] border-t border-zinc-200/80 dark:border-[#1f2734] scroll-mt-20">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8 sm:mb-12">
          <div>
            <div className="flex items-center gap-2 mb-2 sm:mb-2.5">
              <span className="text-xs font-bold uppercase tracking-widest text-zinc-500 dark:text-zinc-400 font-mono">
                OUR SERVICES
              </span>
              <span className="w-7 h-[2px] bg-blue-600 rounded-full inline-block" />
            </div>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight text-zinc-950 dark:text-white leading-[1.15]">
              Assistance for <span className="text-blue-600">every journey.</span>
            </h2>
          </div>

          <div className="flex items-center gap-4 sm:gap-6">
            <div className="text-xs sm:text-sm text-zinc-500 dark:text-zinc-400 text-right leading-snug hidden md:block">
              <p>Transparent, regulated tariffs with zero</p>
              <p>platform bargaining.</p>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => scroll('left')}
                aria-label="Scroll services left"
                className="w-9 h-9 rounded-full border border-zinc-200 dark:border-[#1f2734] hover:border-black dark:hover:border-white flex items-center justify-center text-zinc-600 dark:text-zinc-400 hover:text-black dark:hover:text-white transition-colors cursor-pointer bg-white dark:bg-[#0d1420] shadow-2xs active:scale-95"
              >
                &lsaquo;
              </button>
              <button
                type="button"
                onClick={() => scroll('right')}
                aria-label="Scroll services right"
                className="w-9 h-9 rounded-full border border-zinc-200 dark:border-[#1f2734] hover:border-black dark:hover:border-white flex items-center justify-center text-zinc-600 dark:text-zinc-400 hover:text-black dark:hover:text-white transition-colors cursor-pointer bg-white dark:bg-[#0d1420] shadow-2xs active:scale-95"
              >
                &rsaquo;
              </button>
            </div>
          </div>
        </div>

        {/* 4 Service Cards Matching User Design with Razor-Sharp Clarity */}
        <div
          ref={scrollRef}
          className="flex lg:grid lg:grid-cols-4 gap-4 sm:gap-6 overflow-x-auto scroll-smooth scrollbar-none snap-x snap-mandatory pb-4 lg:pb-0 -mx-4 px-4 sm:mx-0 sm:px-0"
        >
          {services.map((s) => (
            <Link
              key={s.id}
              to="/auth"
              aria-label={`Book ${s.title}`}
              className="w-[84vw] max-w-[340px] sm:w-[320px] lg:w-full shrink-0 lg:shrink snap-center block group focus:outline-hidden focus-visible:ring-2 focus-visible:ring-blue-600 rounded-[22px] sm:rounded-[26px] transition-all duration-300 hover:-translate-y-2 hover:shadow-xl"
            >
              <div className="overflow-hidden rounded-[22px] sm:rounded-[26px] bg-white dark:bg-[#0d1420] shadow-xs border border-zinc-200/80 dark:border-[#1f2734] transition-all duration-300 group-hover:border-blue-400">
                <img
                  src={s.image}
                  alt={s.alt}
                  className="w-full h-auto block object-contain transition-transform duration-300 group-hover:scale-[1.015]"
                  loading="eager"
                  decoding="async"
                />
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ─── 5. How It Works + Pilot Hub Stations Section ─── */
function HomeHowItWorks() {
  const [stationsModalOpen, setStationsModalOpen] = useState(false);

  const steps = [
    {
      num: '01',
      icon: (
        <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
          <rect x="5" y="2" width="14" height="20" rx="3" ry="3" />
          <line x1="12" y1="18" x2="12.01" y2="18" />
        </svg>
      ),
      iconBg: 'bg-zinc-100 dark:bg-zinc-800/60 border border-zinc-200 dark:border-zinc-700/60',
      title: 'Request in Seconds',
      desc: 'Select your station and train coach in the booking interface.',
    },
    {
      num: '02',
      icon: (
        <svg className="w-5 h-5 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
        </svg>
      ),
      iconBg: 'bg-zinc-100 dark:bg-zinc-800/60 border border-zinc-200 dark:border-zinc-700/60',
      title: 'Meet at Your Coach',
      desc: 'Your verified assistant meets you right at your carriage door.',
    },
    {
      num: '03',
      icon: (
        <svg className="w-5 h-5 text-emerald-600" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
          <polyline points="20 6 9 17 4 12" />
        </svg>
      ),
      iconBg: 'bg-zinc-100 dark:bg-zinc-800/60 border border-zinc-200 dark:border-zinc-700/60',
      title: 'Board Hands-Free',
      desc: 'Luggage is safely loaded to your berth with zero hassle.',
    },
  ];

  const stations = [
    { name: 'Kazipet Junction', division: 'Secunderabad Division', code: 'KZJ' },
    { name: 'Warangal', division: 'Secunderabad Division', code: 'WL' },
    { name: 'Vijayawada Junction', division: 'Vijayawada Division', code: 'BZA' },
    { name: 'Secunderabad Junction', division: 'Secunderabad Division', code: 'SC' },
  ];

  return (
    <section id="how-it-works" className="py-10 sm:py-20 px-4 sm:px-6 lg:px-8 bg-white dark:bg-[#05080f] border-t border-zinc-200/80 dark:border-[#1f2734] scroll-mt-20">
      <div className="max-w-7xl mx-auto">
        <div className="mb-6 sm:mb-12">
          <span className="text-xs font-bold uppercase tracking-widest text-zinc-500 dark:text-zinc-400 font-mono block mb-1.5 sm:mb-2">
            HOW IT WORKS
          </span>
          <h2 className="text-2xl sm:text-4xl font-black tracking-tight text-zinc-950 dark:text-white">
            How OneCoolie works.
          </h2>
          <p className="text-xs sm:text-sm text-zinc-500 dark:text-zinc-400 mt-1 font-normal">
            Three simple steps from arrival to smooth departure.
          </p>
        </div>

        <div className="grid lg:grid-cols-12 gap-5 lg:gap-8 items-stretch">
          {/* 3 Step Process Cards */}
          <div className="lg:col-span-7 grid sm:grid-cols-3 gap-3 sm:gap-4 items-stretch">
            {steps.map((step, idx) => (
              <div
                key={step.num}
                className="relative p-4 sm:p-5 rounded-2xl sm:rounded-3xl bg-white dark:bg-[#0a0f1c] border border-zinc-200/90 dark:border-[#1f2734] shadow-2xs hover:shadow-xs transition-all flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center gap-2.5 mb-3 sm:mb-5">
                    <div className={`w-9 h-9 rounded-xl ${step.iconBg} flex items-center justify-center shrink-0`}>
                      {step.icon}
                    </div>
                    <span className="text-xl font-black font-mono text-blue-600">
                      {step.num}
                    </span>
                  </div>

                  <h3 className="text-sm font-bold text-zinc-950 dark:text-white mb-1 leading-snug">
                    {step.title}
                  </h3>

                  <p className="text-[11px] sm:text-xs text-zinc-500 dark:text-zinc-400 leading-relaxed font-normal">
                    {step.desc}
                  </p>
                </div>

                {idx < 2 && (
                  <div className="hidden sm:flex absolute -right-3 top-1/2 -translate-y-1/2 z-10 w-6 h-6 rounded-full bg-white dark:bg-[#0a0f1c] border border-zinc-200 dark:border-[#1f2734] shadow-2xs items-center justify-center text-blue-600 text-[11px] font-bold pointer-events-none">
                    &rarr;
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Pilot Hub Stations Showcase Card */}
          <div
            id="stations"
            className="lg:col-span-5 relative rounded-2xl sm:rounded-3xl overflow-hidden bg-gradient-to-br from-zinc-100/90 via-zinc-50/60 to-white dark:from-[#0a0f1c] dark:via-[#0d1420] dark:to-[#05080f] border border-zinc-200/90 dark:border-[#1f2734] shadow-2xs p-4.5 sm:p-7 flex flex-col justify-between group scroll-mt-24"
          >
            <div className="absolute top-0 left-0 right-0 h-28 sm:h-auto sm:bottom-0 sm:left-auto sm:w-2/5 overflow-hidden pointer-events-none opacity-90">
              <img
                src="/images/station-hub-bg.jpg"
                alt="Indian Railway Heritage Station Clock Tower"
                className="w-full h-full object-cover object-center sm:object-left group-hover:scale-103 transition-transform duration-700"
                loading="lazy"
              />
              <div className="absolute inset-0 bg-gradient-to-b sm:bg-gradient-to-r from-transparent sm:from-zinc-100/95 sm:via-zinc-100/75 to-zinc-100/90 sm:to-transparent dark:from-transparent dark:sm:from-zinc-950/95 dark:sm:via-zinc-950/75 dark:to-zinc-950/95 dark:sm:to-transparent" />
            </div>

            <div className="relative z-10 max-w-full sm:max-w-[62%] pt-20 sm:pt-0">
              <h3 className="text-base sm:text-lg font-bold text-zinc-950 dark:text-white mb-0.5">
                Pilot Hub Stations
              </h3>
              <p className="text-[11px] text-zinc-500 dark:text-zinc-400 mb-3 sm:mb-5 leading-snug">
                Active operations across South Central Railway.
              </p>

              <div className="space-y-2 sm:space-y-2.5">
                {stations.map((st) => (
                  <div
                    key={st.code}
                    className="flex items-center justify-between gap-2 p-2 sm:p-1.5 rounded-xl bg-white/75 sm:bg-white/50 dark:bg-zinc-900/70 dark:sm:bg-zinc-900/50 border border-zinc-200/60 dark:border-zinc-800/60 sm:border-0 shadow-2xs sm:shadow-none"
                  >
                    <div className="flex flex-col min-w-0">
                      <span className="text-xs font-bold text-zinc-950 dark:text-white truncate">
                        {st.name}
                      </span>
                      <span className="text-[10px] text-zinc-500 dark:text-zinc-400 truncate">
                        {st.division}
                      </span>
                    </div>
                    <span className="px-2 py-0.5 rounded-md bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-[10px] font-mono font-bold text-zinc-800 dark:text-zinc-200 shrink-0">
                      {st.code}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <div className="relative z-10 pt-3.5 sm:pt-5 mt-3 border-t border-zinc-200/60 dark:border-[#1f2734]">
              <button
                type="button"
                onClick={() => setStationsModalOpen(true)}
                className="inline-flex items-center gap-1.5 text-xs font-bold text-blue-600 hover:text-blue-700 py-0.5"
              >
                <span>View all stations</span>
                <span>&rarr;</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Stations Modal */}
      {stationsModalOpen && (
        <div role="dialog" aria-modal="true" className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4" onClick={() => setStationsModalOpen(false)}>
          <div className="bg-white dark:bg-zinc-900 rounded-2xl w-full max-w-lg overflow-hidden border border-zinc-200 dark:border-zinc-700 shadow-2xl" onClick={(e) => e.stopPropagation()}>
            <div className="h-32 w-full relative">
              <img src="/images/station-hub-bg.jpg" alt="Pilot hub station" className="w-full h-full object-cover" />
              <button type="button" onClick={() => setStationsModalOpen(false)} className="absolute top-3 right-3 w-9 h-9 rounded-full bg-black/60 text-white text-sm font-bold">✕</button>
            </div>
            <div className="p-5 space-y-2">
              {stations.map((st) => (
                <div key={st.code} className="flex items-center justify-between p-3 rounded-xl bg-zinc-100 dark:bg-zinc-800/70">
                  <div><p className="text-sm font-bold">{st.name}</p><p className="text-[11px] text-zinc-500">{st.division}</p></div>
                  <span className="text-xs font-mono font-bold text-blue-600 dark:text-blue-400">{st.code}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </section>
  );
}

/* ─── 6. Safety First Section (3x2 Grid + Modal Dialog) ─── */
function HomeSafety() {
  const [safetyModalOpen, setSafetyModalOpen] = useState(false);

  const safetyCards = [
    {
      icon: (
        <svg className="w-4 h-4 sm:w-5 sm:h-5 text-emerald-600" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
        </svg>
      ),
      iconBg: 'bg-zinc-100 dark:bg-zinc-800/60 border border-zinc-200 dark:border-zinc-700/60',
      title: '100% KYC Verification',
      desc: 'Aadhaar & background check',
    },
    {
      icon: (
        <svg className="w-4 h-4 sm:w-5 sm:h-5 text-blue-600" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
        </svg>
      ),
      iconBg: 'bg-zinc-100 dark:bg-zinc-800/60 border border-zinc-200 dark:border-zinc-700/60',
      title: 'Encrypted OTP',
      desc: 'Secure in-person verification',
    },
    {
      icon: (
        <svg className="w-4 h-4 sm:w-5 sm:h-5 text-blue-600" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
          <path strokeLinecap="round" strokeLinejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
      ),
      iconBg: 'bg-zinc-100 dark:bg-zinc-800/60 border border-zinc-200 dark:border-zinc-700/60',
      title: '24/7 Station SOS',
      desc: 'Live trip telemetry & alerts',
    },
    {
      icon: (
        <svg className="w-4 h-4 sm:w-5 sm:h-5 text-emerald-600" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
        </svg>
      ),
      iconBg: 'bg-zinc-100 dark:bg-zinc-800/60 border border-zinc-200 dark:border-zinc-700/60',
      title: 'Trained & Verified Assistants',
      desc: 'Professional and courteous',
    },
    {
      icon: (
        <span className="w-4 h-4 sm:w-5 sm:h-5 rounded-full flex items-center justify-center text-blue-600 font-bold text-xs sm:text-sm">
          ₹
        </span>
      ),
      iconBg: 'bg-zinc-100 dark:bg-zinc-800/60 border border-zinc-200 dark:border-zinc-700/60',
      title: 'Transparent Pricing',
      desc: 'No platform bargaining',
    },
    {
      icon: (
        <svg className="w-4 h-4 sm:w-5 sm:h-5 text-blue-600" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
        </svg>
      ),
      iconBg: 'bg-zinc-100 dark:bg-zinc-800/60 border border-zinc-200 dark:border-zinc-700/60',
      title: 'Reliable Support',
      desc: 'Always here for you',
    },
  ];

  return (
    <section id="safety" className="py-10 sm:py-20 px-4 sm:px-6 lg:px-8 bg-[#f5f6f8] dark:bg-[#0a0f1c] border-t border-zinc-200/80 dark:border-[#1f2734] scroll-mt-20">
      <div className="max-w-7xl mx-auto">
        <div className="grid lg:grid-cols-12 gap-6 sm:gap-8 lg:gap-14 items-center">
          <div className="lg:col-span-5 space-y-3.5 sm:space-y-5">
            <span className="text-xs font-bold uppercase tracking-widest text-zinc-500 dark:text-zinc-400 font-mono block">
              SAFETY FIRST
            </span>

            <h2 className="text-2xl sm:text-4xl font-black tracking-tight text-zinc-950 dark:text-white leading-[1.15]">
              Safety engineered<br />
              into every dispatch.
            </h2>

            <p className="text-sm sm:text-base text-zinc-600 dark:text-zinc-400 leading-relaxed font-normal">
              Every passenger and assistant interaction is protected by government ID verification, encrypted handshakes, and 24/7 supervisor oversight.
            </p>

            <div className="pt-1 sm:pt-2">
              <button
                type="button"
                onClick={() => setSafetyModalOpen(true)}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full border border-zinc-300 dark:border-zinc-700 hover:border-black dark:hover:border-white active:scale-[0.98] text-xs font-bold text-zinc-900 dark:text-white transition-all cursor-pointer shadow-2xs min-h-[44px]"
              >
                <span>Learn about our safety</span>
                <span>&rarr;</span>
              </button>
            </div>
          </div>

          <div className="lg:col-span-7 grid grid-cols-2 sm:grid-cols-3 gap-2 sm:gap-4">
            {safetyCards.map((card) => (
              <div
                key={card.title}
                className="p-3 sm:p-4 rounded-xl sm:rounded-2xl bg-white dark:bg-[#0d1420] border border-zinc-200/80 dark:border-[#1f2734] hover:bg-zinc-50 dark:hover:bg-[#141c28] hover:shadow-2xs transition-all flex flex-col justify-between min-h-[105px] sm:min-h-[120px]"
              >
                <div className={`w-8 h-8 sm:w-9 sm:h-9 rounded-xl ${card.iconBg} flex items-center justify-center mb-2 sm:mb-3 shadow-2xs shrink-0`}>
                  {card.icon}
                </div>
                <div>
                  <h3 className="text-[11px] sm:text-xs font-bold text-zinc-950 dark:text-white leading-tight mb-0.5 sm:mb-1">
                    {card.title}
                  </h3>
                  <p className="text-[10px] sm:text-[11px] text-zinc-500 dark:text-zinc-400 leading-tight">
                    {card.desc}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {safetyModalOpen && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4 sm:p-6 animate-fade-in"
          onClick={() => setSafetyModalOpen(false)}
        >
          <div
            className="bg-white dark:bg-[#0a0f1c] rounded-2xl sm:rounded-3xl p-5 sm:p-8 w-full max-w-lg shadow-2xl border border-zinc-200 dark:border-[#1f2734] max-h-[85vh] overflow-y-auto animate-scale-in text-zinc-900 dark:text-white"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                <span className="text-xs font-bold uppercase tracking-wider font-mono text-zinc-500 dark:text-zinc-400">
                  OneCoolie Security Protocol
                </span>
              </div>
              <button
                type="button"
                onClick={() => setSafetyModalOpen(false)}
                className="text-zinc-400 hover:text-black dark:hover:text-white p-1 text-sm font-bold cursor-pointer"
              >
                ✕
              </button>
            </div>

            <h3 className="text-xl font-bold text-zinc-950 dark:text-white mb-3">
              Government-Verified Identity &amp; Platform Safeguards
            </h3>

            <div className="space-y-3 text-xs sm:text-sm text-zinc-600 dark:text-zinc-300 leading-relaxed">
              <p>
                Every assistant undergoes biometric Aadhaar verification, clean railway police background clearances, and in-person platform training before dispatch.
              </p>
              <p>
                Your private booking generates a one-time 6-digit cryptographic OTP. Platform escort begins only after mutual code handshake at your train carriage door.
              </p>
              <p>
                Station supervisor telemetry continuously monitors trip handoffs across major pilot junctions.
              </p>
            </div>

            <div className="mt-6 pt-4 border-t border-zinc-100 dark:border-[#1f2734] flex justify-end">
              <button
                type="button"
                onClick={() => setSafetyModalOpen(false)}
                className="px-5 py-2.5 bg-black text-white hover:bg-zinc-800 dark:bg-white dark:text-black dark:hover:bg-zinc-200 text-xs font-bold rounded-full active:scale-[0.98] cursor-pointer min-h-[44px]"
              >
                Close Details
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}

/* ─── 7. Bharat Moves Together Panoramic CTA Banner ─── */
function HomeCTA() {
  return (
    <section className="py-10 sm:py-20 px-4 sm:px-6 lg:px-8 bg-white dark:bg-[#05080f] border-t border-zinc-200/80 dark:border-[#1f2734]">
      <div className="max-w-7xl mx-auto">
        <div className="relative rounded-2xl sm:rounded-[36px] overflow-hidden bg-gradient-to-r from-zinc-100 via-zinc-50 to-zinc-100 dark:from-[#0a0f1c] dark:via-[#0d1420] dark:to-[#0a0f1c] border border-zinc-200/80 dark:border-[#1f2734] shadow-md p-5 sm:p-10 lg:p-12 min-h-[280px] flex flex-col justify-between group">
          <img
            src="/images/banner-bharat-moves.jpg"
            alt="Bharat Moves Together with OneCoolie"
            className="absolute inset-0 w-full h-full object-cover object-right opacity-80 group-hover:scale-102 transition-transform duration-700 pointer-events-none"
            loading="lazy"
          />

          {/* Solid mobile gradient overlay for maximum text contrast on narrow phone screens */}
          <div className="absolute inset-0 bg-gradient-to-b from-zinc-100/95 via-zinc-100/90 to-zinc-200/90 dark:from-[#0a0f1c]/95 dark:via-[#0a0f1c]/90 dark:to-[#05080f]/90 sm:bg-gradient-to-r sm:from-zinc-100/95 sm:via-zinc-100/85 sm:to-transparent dark:sm:from-[#0a0f1c]/95 dark:sm:via-[#0a0f1c]/85 dark:sm:to-transparent pointer-events-none" />

          {/* TOP RIGHT: Bharat Moves Together Badge (tricolor kept as-is) */}
          <div className="relative sm:absolute sm:top-6 sm:right-8 z-20 self-start sm:self-auto mb-5 sm:mb-0 pointer-events-none">
            <div className="p-2 sm:p-3 rounded-2xl bg-white/95 dark:bg-[#0d1420]/95 backdrop-blur-md border border-zinc-200/80 dark:border-[#1f2734] shadow-xs inline-block">
              <span className="font-serif italic font-extrabold text-zinc-900 dark:text-white text-xs sm:text-base tracking-tight block">
                Bharat
              </span>
              <span className="font-serif italic font-extrabold text-blue-600 text-xs sm:text-base tracking-tight block">
                Moves Together
              </span>
              <div className="flex h-1 w-full rounded-full overflow-hidden mt-1">
                <span className="w-1/3 bg-orange-500" />
                <span className="w-1/3 bg-white border border-zinc-200" />
                <span className="w-1/3 bg-emerald-600" />
              </div>
            </div>
          </div>

          <div className="relative z-10 grid md:grid-cols-12 gap-5 sm:gap-8 items-center max-w-3xl">
            {/* Traveler Assistance */}
            <div className="md:col-span-6 space-y-2">
              <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-zinc-500 dark:text-zinc-400 block">
                TRAVELER ASSISTANCE
              </span>

              <h3 className="text-lg sm:text-2xl font-black tracking-tight text-zinc-950 dark:text-white leading-tight">
                Travel lighter on your next train.
              </h3>

              <p className="text-xs sm:text-sm text-zinc-600 dark:text-zinc-300 leading-relaxed font-normal">
                Book a verified station service in under 60 seconds.
              </p>

              <div className="pt-1.5">
                <Link
                  to="/auth"
                  className="inline-flex items-center justify-center gap-2 bg-black text-white hover:bg-zinc-800 dark:bg-white dark:text-black dark:hover:bg-zinc-200 active:scale-[0.98] text-xs sm:text-sm font-bold px-6 py-3 rounded-full shadow-sm transition-all duration-150 w-full sm:w-auto text-center min-h-[46px]"
                >
                  <span>Book OneCoolie</span>
                  <span className="text-sm font-light">&rarr;</span>
                </Link>
              </div>
            </div>

            {/* Assistant Network */}
            <div className="md:col-span-6 space-y-2 pt-5 border-t border-zinc-300/60 dark:border-zinc-700/60 md:border-t-0 md:pt-0 md:pl-6 md:border-l md:border-zinc-300/80 dark:md:border-zinc-700/80">
              <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-zinc-500 dark:text-zinc-400 block">
                ASSISTANT NETWORK
              </span>

              <h3 className="text-lg sm:text-2xl font-black tracking-tight text-zinc-950 dark:text-white leading-tight">
                Work as a Station Service
              </h3>

              <p className="text-xs sm:text-sm text-zinc-600 dark:text-zinc-300 leading-relaxed font-normal">
                Earn with flexible hours and daily payouts.
              </p>

              <div className="pt-1.5">
                <Link
                  to="/assistant-auth"
                  className="inline-flex items-center justify-center gap-2 bg-white hover:bg-zinc-50 dark:bg-[#0a0f1c] dark:hover:bg-[#0d1420] active:scale-[0.98] text-zinc-950 dark:text-white text-xs sm:text-sm font-bold px-6 py-3 rounded-full shadow-sm border border-zinc-200 dark:border-[#1f2734] transition-all duration-150 w-full sm:w-auto text-center min-h-[46px]"
                >
                  <span>Join as Assistant</span>
                  <span className="text-sm font-light">&rarr;</span>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ─── 8. Footer Section ─── */
function HomeFooter() {
  const footerLinks = [
    { label: 'Services', href: '#services' },
    { label: 'How it works', href: '#how-it-works' },
    { label: 'Safety', href: '#safety' },
    { label: 'Stations', href: '#stations' },
  ];

  return (
    <footer className="bg-[#f5f6f8] dark:bg-[#05080f] border-t border-zinc-200/80 dark:border-[#1f2734] py-8 sm:py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6 sm:gap-8">
        <div className="flex items-center gap-2">
          <HomeBrand withTagline={true} />
        </div>

        <nav className="flex flex-wrap items-center justify-center gap-4 sm:gap-7 text-xs sm:text-sm font-medium text-zinc-600 dark:text-zinc-400">
          {footerLinks.map((link) => (
            <a
              key={link.label}
              href={link.href}
              className="hover:text-black dark:hover:text-white transition-colors py-1 px-1 min-h-[44px] flex items-center"
            >
              {link.label}
            </a>
          ))}
        </nav>

        <div className="flex flex-col sm:flex-row items-center gap-3 sm:gap-6 text-xs text-zinc-500 dark:text-zinc-400 text-center sm:text-left">
          <span>
            &copy; {new Date().getFullYear()} OneCoolie under MoveSphere Technologies. All rights reserved.
          </span>

          <div className="flex items-center gap-4 text-zinc-600 dark:text-zinc-400">
            <a
              href="https://linkedin.com"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="OneCoolie on LinkedIn"
              className="hover:text-black dark:hover:text-white transition-colors p-1 min-h-[44px] flex items-center"
            >
              <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z" />
              </svg>
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}

/* ─── 9. Main Home Page Export ─── */
export default function HomePage() {
  useEffect(() => {
    document.title = 'OneCoolie — Making Every Journey Easier';
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="min-h-screen bg-white dark:bg-[#05080f] text-zinc-900 dark:text-white selection:bg-black selection:text-white dark:selection:bg-white dark:selection:text-black font-sans antialiased overflow-x-hidden transition-colors duration-200">
      <HomeNavbar />
      <main id="main-content">
        <HomeHero />
        <HomeServices />
        <HomeHowItWorks />
        <HomeSafety />
        <HomeCTA />
      </main>
      <HomeFooter />
    </div>
  );
}