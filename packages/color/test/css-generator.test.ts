import assert from 'node:assert/strict'
import { mkdtempSync, readFileSync, rmSync, statSync, utimesSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import test from 'node:test'
import { generateThemeCss, parseMainColor } from '../src/css-generator'
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
