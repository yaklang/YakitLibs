import type { ColorHex, ThemeMode } from './generator'

export type BrandThemeName = 'Main' | 'Web' | 'Gold' | 'Memfit' | 'Irify'

export type BrandThemeConfig = ColorHex | Record<ThemeMode, ColorHex>

export const brandThemeColors: Record<BrandThemeName, BrandThemeConfig> = {
  Main: '#F17F30',
  Web: '#E76800',
  Gold: '#B49434',
  Memfit: {
    light: '#2E63B3',
    dark: '#5E9DEA',
  },
  Irify: {
    light: '#6A44A9',
    dark: '#B081FF',
  },
}

const HEX_COLOR_PATTERN = /^#(?:[\da-f]{3}|[\da-f]{6})$/i

export function isBrandThemeName(value: string): value is BrandThemeName {
  return Object.prototype.hasOwnProperty.call(brandThemeColors, value)
}

export function parseMainColor(mainColor: string): ColorHex {
  const normalized = mainColor.trim()

  if (!HEX_COLOR_PATTERN.test(normalized)) {
    throw new TypeError(`Invalid main color "${mainColor}". Expected a 3 or 6 digit hex color, for example "#1677ff".`)
  }

  return normalized as ColorHex
}

export function resolveBrandThemeColor(themeName: BrandThemeName, mode: ThemeMode = 'light'): ColorHex {
  const config = brandThemeColors[themeName]
  return typeof config === 'string' ? config : config[mode]
}

export function resolveMainColor(mainColorOrTheme: string, mode: ThemeMode = 'light'): ColorHex {
  const normalized = mainColorOrTheme.trim()

  if (isBrandThemeName(normalized)) {
    return resolveBrandThemeColor(normalized, mode)
  }

  return parseMainColor(normalized)
}
