import { SiteConfig } from '../types';

interface ThemeInjectorProps {
  config: SiteConfig;
}

export default function ThemeInjector({ config }: ThemeInjectorProps) {
  // Pre-configured theme parameters
  const themes = {
    sapphire: {
      gold: '#029bfa',
      goldSoft: '#0082db',
      luxuryBg: '#021e3b',
      luxurySec: '#011426',
      luxuryBorder: '#033766',
      luxuryCard: 'rgba(2, 155, 250, 0.05)',
    },
    amber: {
      gold: '#e5c158',
      goldSoft: '#cda12f',
      luxuryBg: '#1c1917',
      luxurySec: '#0c0a09',
      luxuryBorder: '#44403c',
      luxuryCard: 'rgba(229, 193, 88, 0.05)',
    },
    emerald: {
      gold: '#d4af37',
      goldSoft: '#aa8412',
      luxuryBg: '#064e3b',
      luxurySec: '#022c22',
      luxuryBorder: '#14532d',
      luxuryCard: 'rgba(6, 78, 59, 0.05)',
    },
    crimson: {
      gold: '#cca43b',
      goldSoft: '#b0821a',
      luxuryBg: '#450a0a',
      luxurySec: '#2d0606',
      luxuryBorder: '#7f1d1d',
      luxuryCard: 'rgba(127, 29, 29, 0.05)',
    },
    obsidian: {
      gold: '#f59e0b',
      goldSoft: '#d97706',
      luxuryBg: '#121214',
      luxurySec: '#1a1a1e',
      luxuryBorder: '#2e2e33',
      luxuryCard: 'rgba(245, 158, 11, 0.05)',
    },
  };

  const fonts = {
    jakarta_playfair: {
      sans: '"Plus Jakarta Sans", "Inter", ui-sans-serif, system-ui, sans-serif',
      serif: '"Playfair Display", Georgia, serif',
      cinzel: '"Playfair Display", serif',
    },
    inter_cinzel: {
      sans: '"Inter", ui-sans-serif, system-ui, sans-serif',
      serif: '"Cinzel", "Times New Roman", serif',
      cinzel: '"Cinzel", serif',
    },
    outfit_bodoni: {
      sans: '"Plus Jakarta Sans", "Inter", sans-serif',
      serif: '"Cinzel", Georgia, serif',
      cinzel: '"Cinzel", serif',
    },
  };

  const currentTheme = themes[config.themePreset] || themes.sapphire;
  const currentFonts = fonts[config.fontPreset] || fonts.jakarta_playfair;

  const styleContent = `
    :root {
      --color-gold: ${currentTheme.gold} !important;
      --color-gold-soft: ${currentTheme.goldSoft} !important;
      --color-luxury-bg: ${currentTheme.luxuryBg} !important;
      --color-luxury-sec: ${currentTheme.luxurySec} !important;
      --color-luxury-border: ${currentTheme.luxuryBorder} !important;
      --color-luxury-card: ${currentTheme.luxuryCard} !important;
      
      --font-sans: ${currentFonts.sans} !important;
      --font-serif: ${currentFonts.serif} !important;
      --font-cinzel: ${currentFonts.cinzel} !important;
    }
  `;

  return <style dangerouslySetInnerHTML={{ __html: styleContent }} />;
}
