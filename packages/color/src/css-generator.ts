import { generateColors } from './index'
import type { ThemeMode } from './generator'
import { resolveMainColor } from './themes'

export {
  parseMainColor,
  resolveMainColor,
  resolveBrandThemeColor,
  brandThemeColors,
  isBrandThemeName,
} from './themes'
export type { BrandThemeName, BrandThemeConfig } from './themes'

function serializeVariables(selector: string, variables: Record<string, string>): string {
  const declarations = Object.entries(variables)
    .map(([name, value]) => `  ${name}: ${value};`)
    .join('\n')

  return `${selector} {\n${declarations}\n}`
}

export function generateThemeCss(mainColorOrTheme: string): string {
  const selectors: Record<ThemeMode, string> = {
    light: ':root',
    dark: '[data-theme="dark"]',
  }

  return (['light', 'dark'] as const)
    .map((mode) =>
      serializeVariables(
        selectors[mode],
        generateColors(mode, resolveMainColor(mainColorOrTheme, mode)),
      ),
    )
    .join('\n\n')
    .concat('\n')
}
