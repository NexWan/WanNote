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
    const content = await readTextFile(CONFIG_FILE_NAME, {
      baseDir: BaseDirectory.AppConfig,
    });
    return JSON.parse(content) as AppSettings;
  } else {
    await mkdir('', { recursive: true, baseDir: BaseDirectory.AppConfig });
    await writeTextFile(CONFIG_FILE_NAME, JSON.stringify(defaultSettings, null, 2), {
      baseDir: BaseDirectory.AppConfig,
    });

    return defaultSettings;
  }
}
