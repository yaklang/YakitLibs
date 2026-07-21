import { createHash } from 'crypto'
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'fs'
import { basename, dirname, extname, join, resolve } from 'path'
import { generateThemeCss } from './css-generator'

export interface WriteThemeCssOptions {
  mainColor: string
  output: string
}

export interface WriteThemeCssResult {
  output: string
  written: boolean
}

export interface WriteHashedThemeCssOptions extends WriteThemeCssOptions {
  manifest?: string
}

export interface ThemeCssManifest {
  file: string
  integrity: string
}

export interface WriteHashedThemeCssResult extends WriteThemeCssResult {
  hash: string
  integrity: string
  manifest: string
  manifestWritten: boolean
}

function writeFileIfChanged(output: string, content: string): boolean {
  if (existsSync(output) && readFileSync(output, 'utf8') === content) {
    return false
  }

  mkdirSync(dirname(output), { recursive: true })
  writeFileSync(output, content, 'utf8')
  return true
}

export function writeThemeCss(options: WriteThemeCssOptions): WriteThemeCssResult {
  const output = resolve(options.output)
  const written = writeFileIfChanged(output, generateThemeCss(options.mainColor))

  return { output, written }
}

export function writeHashedThemeCss(options: WriteHashedThemeCssOptions): WriteHashedThemeCssResult {
  const requestedOutput = resolve(options.output)
  const css = generateThemeCss(options.mainColor)
  const digest = createHash('sha256').update(css)
  const hash = digest.copy().digest('hex').slice(0, 12)
  const integrity = `sha256-${digest.digest('base64')}`
  const extension = extname(requestedOutput) || '.css'
  const stem = basename(requestedOutput, extname(requestedOutput))
  const output = join(dirname(requestedOutput), `${stem}.${hash}${extension}`)
  const manifest = resolve(options.manifest ?? join(dirname(requestedOutput), `${stem}-manifest.json`))
  const manifestValue: ThemeCssManifest = {
    file: basename(output),
    integrity,
  }
  const manifestContent = `${JSON.stringify(manifestValue, null, 2)}\n`
  const written = writeFileIfChanged(output, css)
  const manifestWritten = writeFileIfChanged(manifest, manifestContent)

  return { output, written, hash, integrity, manifest, manifestWritten }
}
