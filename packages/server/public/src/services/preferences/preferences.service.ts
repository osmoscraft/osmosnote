import type { WindowRefService } from "../window-reference/window.service";

export interface Preferences {
  spellcheck: boolean;
}

const DEFAULT_PREFERENCES: Preferences = {
  spellcheck: true,
};

const STORAGE_KEY = "s2-preferences";

export class PreferencesService {
  constructor(private windowRef: WindowRefService) {}

  getPreferences(): Preferences {
    let preferencesString = this.windowRef.window.localStorage.getItem(STORAGE_KEY);
    if (preferencesString === null) {
      this.resetPreferences();
      preferencesString = this.windowRef.window.localStorage.getItem(STORAGE_KEY)!;
    }

    let preferences: Preferences;

    try {
      preferences = JSON.parse(preferencesString);
    } catch (error) {
      console.error(error);
      this.resetPreferences();
      preferencesString = this.windowRef.window.localStorage.getItem(STORAGE_KEY)!;
      preferences = JSON.parse(preferencesString);
    }

    return preferences;
  }

  updatePreferences(update: Partial<Preferences>): Preferences {
    const existing = this.getPreferences();
    const updated: Preferences = { ...existing, ...update };

    this.windowRef.window.localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    return updated;
  }

  private resetPreferences() {
    this.windowRef.window.localStorage.setItem(STORAGE_KEY, JSON.stringify(DEFAULT_PREFERENCES));
  }
}
