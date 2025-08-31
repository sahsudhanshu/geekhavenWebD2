import React, { createContext, useContext, useEffect } from 'react';
import { getFrontSeed, getPlatformFeePercent, generateColor, type SeedInfo } from '../utils/seed';

interface SeedPalette {
  accent: string;
  accentHover: string;
  accentFg: string;
  accentSubtle: string;
  accentRing: string;
}

interface SeedThemeContextValue extends SeedPalette {
  seedInfo: SeedInfo | null;
  feePercent: number;
  missingSeed: boolean;
}

const SeedThemeContext = createContext<SeedThemeContextValue | undefined>(undefined);

function lighten(hex: string, amount: number): string {
  const num = parseInt(hex.replace('#', ''), 16);
  let r = (num >> 16) & 0xff;
  let g = (num >> 8) & 0xff;
  let b = num & 0xff;
  r = Math.min(255, Math.round(r + (255 - r) * amount));
  g = Math.min(255, Math.round(g + (255 - g) * amount));
  b = Math.min(255, Math.round(b + (255 - b) * amount));
  return `#${[r, g, b].map(v => v.toString(16).padStart(2, '0')).join('')}`;
}

function darken(hex: string, amount: number): string {
  const num = parseInt(hex.replace('#', ''), 16);
  let r = (num >> 16) & 0xff;
  let g = (num >> 8) & 0xff;
  let b = num & 0xff;
  r = Math.max(0, Math.round(r * (1 - amount)));
  g = Math.max(0, Math.round(g * (1 - amount)));
  b = Math.max(0, Math.round(b * (1 - amount)));
  return `#${[r, g, b].map(v => v.toString(16).padStart(2, '0')).join('')}`;
}

function buildPalette(seed: string): SeedPalette {
  const base = generateColor(seed);
  return {
    accent: base,
    accentHover: darken(base, 0.15),
    accentFg: '#ffffff',
    accentSubtle: lighten(base, 0.75),
    accentRing: lighten(base, 0.35)
  };
}

export const SeedThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const seedInfo = getFrontSeed();
  const missingSeed = !seedInfo;

  if (missingSeed) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-6 bg-red-50 dark:bg-red-950 p-6 text-center">
        <h1 className="text-3xl font-bold text-red-700 dark:text-red-300">Assignment Seed Missing</h1>
        <p className="max-w-md text-red-800 dark:text-red-200 text-sm leading-relaxed">
          The required environment variable <code className="font-mono">VITE_FRONT_ASSIGNMENT_SEED</code> is not set.<br />
          Define it in <code className="font-mono">.env</code> (e.g. <code className="font-mono">VITE_FRONT_ASSIGNMENT_SEED=FRONT25-XXXX</code>) and restart the dev server.<br />
          Application intentionally halted per assignment spec.
        </p>
        <p className="text-xs text-red-500/80">Set the seed then refresh.</p>
      </div>
    );
  }

  const palette = buildPalette(seedInfo.seed);
  const feePercent = getPlatformFeePercent();

  useEffect(() => {
    const root = document.documentElement;
    root.style.setProperty('--seed-accent', palette.accent);
    root.style.setProperty('--seed-accent-hover', palette.accentHover);
    root.style.setProperty('--seed-accent-fg', palette.accentFg);
    root.style.setProperty('--seed-accent-subtle', palette.accentSubtle);
    root.style.setProperty('--seed-accent-ring', palette.accentRing);
  // Also map global accent tokens so broader UI picks up the seed color (user requested global application)
  root.style.setProperty('--accent', palette.accent);
  root.style.setProperty('--accent-foreground', palette.accentFg);
  root.style.setProperty('--primary', palette.accent);
  root.style.setProperty('--primary-foreground', palette.accentFg);
  }, [palette]);

  const value: SeedThemeContextValue = { ...palette, seedInfo, feePercent, missingSeed: false };
  return <SeedThemeContext.Provider value={value}>{children}</SeedThemeContext.Provider>;
};

export function useSeedTheme() {
  const ctx = useContext(SeedThemeContext);
  if (!ctx) throw new Error('useSeedTheme must be used within SeedThemeProvider');
  return ctx;
}
