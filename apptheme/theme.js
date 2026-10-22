/**
 * Urdu PhotoCraft - Theme Engine
 * Manages dynamic app-wide themes (Dark Studio, Royal Gold, Midnight Emerald)
 */

export const THEMES = {
  STUDIO: 'studio-dark',
  GOLD: 'royal-gold',
  EMERALD: 'midnight-emerald'
};

const THEME_STORAGE_KEY = 'urdu_photocraft_theme_v2';

export class AppTheme {
  constructor() {
    this.currentTheme = localStorage.getItem(THEME_STORAGE_KEY) || THEMES.STUDIO;
    this.applyTheme(this.currentTheme);
  }

  applyTheme(themeName) {
    if (themeName === THEMES.STUDIO) {
      document.documentElement.removeAttribute('data-theme');
    } else {
      document.documentElement.setAttribute('data-theme', themeName);
    }
    this.currentTheme = themeName;
    localStorage.setItem(THEME_STORAGE_KEY, themeName);
    
    // Dispatch custom DOM event
    window.dispatchEvent(new CustomEvent('apptheme:changed', { detail: { theme: themeName } }));
  }

  getCurrentTheme() {
    return this.currentTheme;
  }

  cycleTheme() {
    if (this.currentTheme === THEMES.STUDIO) {
      this.applyTheme(THEMES.GOLD);
    } else if (this.currentTheme === THEMES.GOLD) {
      this.applyTheme(THEMES.EMERALD);
    } else {
      this.applyTheme(THEMES.STUDIO);
    }
    return this.currentTheme;
  }
}

export const themeManager = new AppTheme();
