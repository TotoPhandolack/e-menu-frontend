export interface ThemePreset {
  key: string;
  label: string;
  primary: string;
  primaryForeground: string;
  /**
   * Brand-tinted TEXT on a light surface. Never assume `primary` is safe for
   * text — a light accent like the default gold is ~1.35:1 on white. Every
   * value here clears 4.5:1 on both #FFFFFF and the #FCFAF8 canvas.
   */
  primaryStrong: string;
  ring: string;
  dot: string;
}

export const THEME_PRESETS: ThemePreset[] = [
  {
    key: "default",
    label: "Default",
    // Warm Canvas gold. Light accent, so the foreground is ink, not white.
    primary: "oklch(0.9001 0.131 91.36)",
    primaryForeground: "oklch(0.1835 0.0327 297.47)",
    primaryStrong: "oklch(0.52 0.115 75)",
    ring: "oklch(0.655 0.13 91.36)",
    dot: "#FEDB71",
  },
  {
    key: "forest",
    label: "Forest",
    primary: "oklch(0.38 0.067 148)",
    primaryForeground: "oklch(0.985 0 0)",
    primaryStrong: "oklch(0.38 0.067 148)",
    ring: "oklch(0.38 0.067 148)",
    dot: "#3a5a40",
  },
  {
    key: "blue",
    label: "Blue",
    primary: "oklch(0.546 0.245 264)",
    primaryForeground: "oklch(0.985 0 0)",
    primaryStrong: "oklch(0.546 0.245 264)",
    ring: "oklch(0.546 0.245 264)",
    dot: "#3b82f6",
  },
  {
    key: "green",
    label: "Green",
    primary: "oklch(0.527 0.154 150)",
    primaryForeground: "oklch(0.985 0 0)",
    primaryStrong: "oklch(0.527 0.154 150)",
    ring: "oklch(0.527 0.154 150)",
    dot: "#22c55e",
  },
  {
    key: "orange",
    label: "Orange",
    primary: "oklch(0.65 0.2 55)",
    primaryForeground: "oklch(0.985 0 0)",
    primaryStrong: "oklch(0.58 0.2 55)",
    ring: "oklch(0.65 0.2 55)",
    dot: "#f97316",
  },
  {
    key: "purple",
    label: "Purple",
    primary: "oklch(0.491 0.27 292)",
    primaryForeground: "oklch(0.985 0 0)",
    primaryStrong: "oklch(0.491 0.27 292)",
    ring: "oklch(0.491 0.27 292)",
    dot: "#a855f7",
  },
  {
    key: "rose",
    label: "Rose",
    primary: "oklch(0.59 0.24 15)",
    primaryForeground: "oklch(0.985 0 0)",
    primaryStrong: "oklch(0.59 0.24 15)",
    ring: "oklch(0.59 0.24 15)",
    dot: "#f43f5e",
  },
  {
    key: "teal",
    label: "Teal",
    primary: "oklch(0.55 0.15 195)",
    primaryForeground: "oklch(0.985 0 0)",
    primaryStrong: "oklch(0.53 0.15 195)",
    ring: "oklch(0.55 0.15 195)",
    dot: "#14b8a6",
  },
  {
    key: "amber",
    label: "Amber",
    primary: "oklch(0.68 0.18 75)",
    primaryForeground: "oklch(0.2 0 0)",
    primaryStrong: "oklch(0.57 0.18 75)",
    ring: "oklch(0.68 0.18 75)",
    dot: "#f59e0b",
  },
];

export function applyTheme(themeKey: string) {
  const preset = THEME_PRESETS.find((p) => p.key === themeKey) ?? THEME_PRESETS[0];
  const root = document.documentElement;
  root.style.setProperty("--primary", preset.primary);
  root.style.setProperty("--primary-foreground", preset.primaryForeground);
  root.style.setProperty("--primary-strong", preset.primaryStrong);
  root.style.setProperty("--ring", preset.ring);
}
