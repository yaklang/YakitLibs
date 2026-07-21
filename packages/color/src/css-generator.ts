import { generateColors } from './index'
import type { ColorHex, ThemeMode } from './generator'

const HEX_COLOR_PATTERN = /^#(?:[\da-f]{3}|[\da-f]{6})$/i

export function parseMainColor(mainColor: string): ColorHex {
  const normalized = mainColor.trim()

  if (!HEX_COLOR_PATTERN.test(normalized)) {
    throw new TypeError(`Invalid main color "${mainColor}". Expected a 3 or 6 digit hex color, for example "#1677ff".`)
  }

  return normalized as ColorHex
}

function serializeVariables(selector: string, variables: Record<string, string>): string {
  const declarations = Object.entries(variables)
    .map(([name, value]) => `  ${name}: ${value};`)
    .join('\n')

  return `${selector} {\n${declarations}\n}`
}

export function generateThemeCss(mainColor: string): string {
  const parsedMainColor = parseMainColor(mainColor)
  const selectors: Record<ThemeMode, string> = {
    light: ':root',
    dark: '[data-theme="dark"]',
  }

  return (['light', 'dark'] as const)
    .map((mode) => serializeVariables(selectors[mode], generateColors(mode, parsedMainColor)))
    .join('\n\n')
    .concat('\n')
}
