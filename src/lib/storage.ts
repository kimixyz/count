import { GeneratorConfig } from './questionGenerator';

const STORAGE_KEY = 'kousuan_config';

export function saveConfig(config: GeneratorConfig): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(config));
  } catch {
    // ignore storage errors
  }
}

export function loadConfig(): GeneratorConfig | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as GeneratorConfig;
  } catch {
    return null;
  }
}
