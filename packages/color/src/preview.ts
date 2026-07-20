import { applyThemeColors as applyThemeColorsBase } from './apply-theme'
import { darkColors, lightColors } from './precomputed/colors'
import type { ColorVariables } from './precomputed/colors'
import type { ThemeMode } from './generator'

export type { ColorVariables, ThemeMode }

export { lightColors, darkColors }

const colorsByMode: Record<ThemeMode, ColorVariables> = {
  light: lightColors,
  dark: darkColors,
}

/** Return pre-computed color variables for the given theme mode (zero runtime calculation). */
export function getColors(mode: ThemeMode = 'light'): ColorVariables {
  return colorsByMode[mode]
}

/** Alias of {@link getColors} for drop-in replacement of the runtime `generateColors`. */
export function generateColors(mode: ThemeMode = 'light'): ColorVariables {
  return getColors(mode)
}

export function applyThemeColors(
  mode: ThemeMode,
  colors: ColorVariables = getColors(mode),
  target?: HTMLElement,
): void {
  applyThemeColorsBase(mode, colors, target)
}
