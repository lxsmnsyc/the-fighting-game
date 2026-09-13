import { createStore } from 'solid-js/store';

/**
 * Player settings. They only change how the game looks, never its rules.
 */
export interface Options {
  /**
   * Cards and abilities shake when they trigger.
   */
  shake: boolean;
  /**
   * Damage and energy fly across the screen in battle.
   */
  projectiles: boolean;
  /**
   * Battles count down before they begin. Read when a run starts.
   */
  countdown: boolean;
}

const STORAGE_KEY = 'the-fighting-game:options';

const DEFAULT_OPTIONS: Options = {
  shake: true,
  projectiles: true,
  countdown: true,
};

const OPTION_KEYS: (keyof Options)[] = ['shake', 'projectiles', 'countdown'];

// Saved settings may miss keys or hold bad values, so defaults fill them
function loadOptions(): Options {
  const loaded = { ...DEFAULT_OPTIONS };
  try {
    const saved: unknown = JSON.parse(localStorage.getItem(STORAGE_KEY) ?? '{}');
    if (typeof saved === 'object' && saved != null) {
      for (const key of OPTION_KEYS) {
        const value: unknown = Reflect.get(saved, key);
        if (typeof value === 'boolean') {
          loaded[key] = value;
        }
      }
    }
  } catch {
    // Unreadable settings fall back to the defaults
  }
  return loaded;
}

const [options, setOptions] = createStore<Options>(loadOptions());

export function setOption(key: keyof Options, value: boolean): void {
  setOptions(key, value);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(options));
}

export default options;
