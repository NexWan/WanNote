import {
  writeTextFile,
  readTextFile,
  exists,
  BaseDirectory,
  mkdir
} from '@tauri-apps/plugin-fs';

export type AppSettings = {
  firstTimeSetup: boolean;
  theme: 'night';
  font: string;
  lastOpenedProject?: string; // Optional field to store the last opened project path
};

const CONFIG_FILE_NAME = 'settings.json';

const defaultSettings: AppSettings = {
  firstTimeSetup: true,
  theme: 'night',
  font: 'Fredoka',
};

export async function loadOrCreateSettings(): Promise<AppSettings> {
  const fileExists = await exists(CONFIG_FILE_NAME, {
    baseDir: BaseDirectory.AppConfig,
  });

  if (fileExists) {
    try {
      const content = await readTextFile(CONFIG_FILE_NAME, {
        baseDir: BaseDirectory.AppConfig,
      });
      
      const parsed = JSON.parse(content) as AppSettings;
      
      // Validate that required properties exist
      if (typeof parsed.firstTimeSetup !== 'boolean' || 
          typeof parsed.theme !== 'string' || 
          typeof parsed.font !== 'string') {
        throw new Error('Invalid settings structure');
      }
      
      return parsed;
    } catch (error) {
      console.warn('Settings file corrupted, recreating with defaults:', error);
      // If JSON parsing fails or structure is invalid, recreate with defaults
      await writeTextFile(CONFIG_FILE_NAME, JSON.stringify(defaultSettings, null, 2), {
        baseDir: BaseDirectory.AppConfig,
      });
      return defaultSettings;
    }
  } else {
    await mkdir('', { recursive: true, baseDir: BaseDirectory.AppConfig });
    await writeTextFile(CONFIG_FILE_NAME, JSON.stringify(defaultSettings, null, 2), {
      baseDir: BaseDirectory.AppConfig,
    });

    return defaultSettings;
  }
}

export async function saveSettings(settings: AppSettings): Promise<void> {
  await writeTextFile(CONFIG_FILE_NAME, JSON.stringify(settings, null, 2), {
    baseDir: BaseDirectory.AppConfig,
  });
}