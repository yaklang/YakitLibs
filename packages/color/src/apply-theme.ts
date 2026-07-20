import type { ThemeMode } from './generator'

export type ColorVariables = Record<string, string>

export function applyThemeColors(
  mode: ThemeMode,
  colors: ColorVariables,
  target: HTMLElement = document.documentElement,
): void {
  target.setAttribute('data-theme', mode)
  Object.entries(colors).forEach(([key, value]) => {
    target.style.setProperty(key, value)
  })
}
