import { ThemeMode } from '../types';

const THEME_MODE_KEY = 'theme_mode';

export class AppPreferencesService {
  loadThemeMode(): ThemeMode {
    try {
      const mode = localStorage.getItem(THEME_MODE_KEY);
      if (mode === 'dark' || mode === 'light') {
        return mode;
      }
      // Check system preference
      if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
        return 'dark';
      }
      return 'light';
    } catch {
      return 'light';
    }
  }

  saveThemeMode(mode: ThemeMode): void {
    try {
      localStorage.setItem(THEME_MODE_KEY, mode);
    } catch (e) {
      console.error('Failed to save theme mode:', e);
    }
  }
}

export const appPreferencesService = new AppPreferencesService();
