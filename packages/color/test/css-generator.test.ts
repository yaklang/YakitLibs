import assert from 'node:assert/strict'
import { mkdtempSync, readFileSync, rmSync, statSync, utimesSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import test from 'node:test'
import { generateThemeCss, parseMainColor, resolveMainColor } from '../src/css-generator'
import { brandThemeColors } from '../src/themes'
import { writeHashedThemeCss, writeThemeCss } from '../src/node'

test('generateThemeCss creates light and dark variables from a custom Main color', () => {
  const css = generateThemeCss('#1677ff')

  assert.match(css, /^:root \{/)
  assert.match(css, /--yakit-colors-Main-60: #2d85ff;/)
  assert.match(css, /\[data-theme="dark"\] \{/)
  assert.match(css, /--yakit-colors-Main-70: #227eff;/)
  assert.match(css, /--Colors-Use-Main-Primary: var\(--yakit-colors-Main-60\);/)
})

test('parseMainColor trims valid colors and rejects unsafe values', () => {
  assert.equal(parseMainColor('  #abc  '), '#abc')
  assert.throws(() => parseMainColor('red'), /Invalid main color/)
  assert.throws(() => parseMainColor('#123456; color: red'), /Invalid main color/)
})

test('resolveMainColor accepts preset brand themes', () => {
  assert.equal(resolveMainColor('Main'), brandThemeColors.Main)
  assert.equal(resolveMainColor('Web'), brandThemeColors.Web)
  assert.equal(resolveMainColor('Gold'), brandThemeColors.Gold)
  assert.equal(resolveMainColor('Memfit', 'light'), '#2E63B3')
  assert.equal(resolveMainColor('Memfit', 'dark'), '#5E9DEA')
  assert.equal(resolveMainColor('Irify', 'dark'), '#B081FF')
  assert.equal(resolveMainColor('  #E76800  '), '#E76800')
})

test('generateThemeCss supports preset Web and Gold themes', () => {
  const webCss = generateThemeCss('Web')
  const goldCss = generateThemeCss('Gold')

  assert.equal(webCss, generateThemeCss('#E76800'))
  assert.equal(goldCss, generateThemeCss('#B49434'))
  assert.notEqual(webCss, goldCss)
})

test('dark mode Main Primary uses level 60 for brand themes', () => {
  for (const themeName of ['Main', 'Web', 'Gold', 'Memfit', 'Irify'] as const) {
    const css = generateThemeCss(themeName)
    const darkSection = css.split('[data-theme="dark"]')[1]

    assert.match(darkSection, /--Colors-Use-Main-Primary: var\(--yakit-colors-Main-60\);/)
    assert.doesNotMatch(darkSection, /--Colors-Use-Main-Primary: var\(--yakit-colors-Main-70\);/)
  }
})

test('Memfit and Irify use different base colors in light and dark CSS', () => {
  const memfitCss = generateThemeCss('Memfit')
  const irifyCss = generateThemeCss('Irify')

  assert.notEqual(memfitCss.match(/:root \{[\s\S]*?--yakit-colors-Main-60: ([^;]+);/)?.[1], memfitCss.match(/\[data-theme="dark"\] \{[\s\S]*?--yakit-colors-Main-60: ([^;]+);/)?.[1])
  assert.notEqual(irifyCss.match(/:root \{[\s\S]*?--yakit-colors-Main-60: ([^;]+);/)?.[1], irifyCss.match(/\[data-theme="dark"\] \{[\s\S]*?--yakit-colors-Main-60: ([^;]+);/)?.[1])
})

test('writeThemeCss does not rewrite unchanged output', () => {
  const directory = mkdtempSync(join(tmpdir(), 'yakit-color-'))
  const output = join(directory, 'assets', 'theme.css')

  try {
    const firstResult = writeThemeCss({ mainColor: '#1677ff', output })
    assert.equal(firstResult.written, true)
    assert.match(readFileSync(output, 'utf8'), /\[data-theme="dark"\]/)

    const preservedTime = new Date('2020-01-01T00:00:00.000Z')
    utimesSync(output, preservedTime, preservedTime)

    const secondResult = writeThemeCss({ mainColor: '#1677ff', output })
    assert.equal(secondResult.written, false)
    assert.equal(statSync(output).mtimeMs, preservedTime.getTime())
  } finally {
    rmSync(directory, { recursive: true, force: true })
  }
})

test('writeHashedThemeCss creates deterministic immutable assets and a manifest', () => {
  const directory = mkdtempSync(join(tmpdir(), 'yakit-color-hashed-'))
  const output = join(directory, 'theme.css')

  try {
    const firstResult = writeHashedThemeCss({ mainColor: '#1677ff', output })
    assert.match(firstResult.output, /theme\.[a-f0-9]{12}\.css$/)
    assert.match(firstResult.integrity, /^sha256-/)
    assert.equal(firstResult.written, true)
    assert.equal(firstResult.manifestWritten, true)

    const manifest = JSON.parse(readFileSync(firstResult.manifest, 'utf8'))
    assert.equal(manifest.file, `theme.${firstResult.hash}.css`)
    assert.equal(manifest.integrity, firstResult.integrity)

    const secondResult = writeHashedThemeCss({ mainColor: '#1677ff', output })
    assert.equal(secondResult.output, firstResult.output)
    assert.equal(secondResult.written, false)
    assert.equal(secondResult.manifestWritten, false)

    const changedResult = writeHashedThemeCss({ mainColor: '#f00', output })
    assert.notEqual(changedResult.output, firstResult.output)
  } finally {
    rmSync(directory, { recursive: true, force: true })
  }
})
