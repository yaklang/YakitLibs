import {
  generateAllThemeColors,
  generateSingleThemeColor,
  getMixPercent,
  yakitThemeColors,
  whiteBackgroundColor,
  blackBackgroundColor,
} from './generator'
import {
  generateNeutralSemanticColors,
  generateBasicSemanticColors,
  generateSemanticColors,
  generateTagSemanticColors,
  generateStatusSemanticColors,
} from './component'
import type { ColorHex, ThemeColorName, ThemeColorResult, ThemeMode } from './generator'
import type { SemanticColorName, TagColorName, SemanticColorResult } from './component'

export * from './generator'
export * from './component'

const SEMANTIC_COLOR_NAMES: SemanticColorName[] = ['Main', 'Error', 'Warning', 'Success', 'Blue']
const TAG_COLOR_NAMES: TagColorName[] = [
  'Purple',
  'Magenta',
  'Lake-blue',
  'Cyan',
  'Green',
  'Red',
  'Orange',
  'Yellow',
  'Grey',
]

export type ColorVariables = Record<string, string>

export function generateAllSemanticColors(mode: ThemeMode = 'light'): SemanticColorResult {
  const result: SemanticColorResult = {}

  Object.assign(result, generateNeutralSemanticColors(mode))
  Object.assign(result, generateBasicSemanticColors(mode))
  Object.assign(result, generateStatusSemanticColors(mode))

  SEMANTIC_COLOR_NAMES.forEach((name) => {
    Object.assign(result, generateSemanticColors(name, mode))
  })

  TAG_COLOR_NAMES.forEach((name) => {
    Object.assign(result, generateTagSemanticColors(name, mode))
  })

  return result
}

export function generateColors(mode: ThemeMode = 'light', mainColorOverride?: ColorHex): ColorVariables {
  return {
    ...generateAllThemeColors(mode, mainColorOverride),
    ...generateAllSemanticColors(mode),
  }
}

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

export {
  generateAllThemeColors,
  generateSingleThemeColor,
  getMixPercent,
  yakitThemeColors,
  whiteBackgroundColor,
  blackBackgroundColor,
  generateNeutralSemanticColors,
  generateBasicSemanticColors,
  generateSemanticColors,
  generateTagSemanticColors,
  generateStatusSemanticColors,
  SEMANTIC_COLOR_NAMES,
  TAG_COLOR_NAMES,
}

export type { ColorHex, ThemeColorName, ThemeColorResult, ThemeMode, SemanticColorName, TagColorName, SemanticColorResult }
