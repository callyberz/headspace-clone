import Conf from "conf";

interface AppConfig {
  defaultDuration: number;
  theme: string;
}

const config = new Conf<AppConfig>({
  projectName: "hs-meditate",
  defaults: {
    defaultDuration: 300,
    theme: "default",
  },
});

export function getConfig(): AppConfig {
  return {
    defaultDuration: config.get("defaultDuration"),
    theme: config.get("theme"),
  };
}

export function setConfig<K extends keyof AppConfig>(key: K, value: AppConfig[K]): void {
  config.set(key, value);
}

export { config };
