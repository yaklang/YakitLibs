import assert from 'node:assert/strict'
import test from 'node:test'
import * as colorPackage from '../src'
import {
  generateColorScales,
  generateRandomColorScales,
  resolveColorVariable,
} from '../src/generator'

function withMockRandom(random: () => number, runTest: () => void): void {
  const originalRandom = Math.random
  Math.random = random
  try {
    runTest()
  } finally {
    Math.random = originalRandom
  }
}

test('resolveColorVariable resolves direct and nested variables from records', () => {
  const variables = {
    '--Colors-Use-Blue-Primary': 'var(--yakit-colors-Blue-60)',
    '--yakit-colors-Blue-60': '#2F87FF',
  }

  assert.equal(resolveColorVariable('--yakit-colors-Blue-60', variables), '#2F87FF')
  assert.equal(resolveColorVariable(' var( --Colors-Use-Blue-Primary ) ', variables), '#2F87FF')
})

test('resolveColorVariable supports getPropertyValue sources', () => {
  const variables: Record<string, string> = {
    '--Colors-Use-Main-Primary': ' var(--yakit-colors-Main-60) ',
    '--yakit-colors-Main-60': ' #abc ',
  }
  const source = { getPropertyValue: (property: string) => variables[property] ?? '' }

  assert.equal(resolveColorVariable('--Colors-Use-Main-Primary', source), '#abc')
})

test('resolveColorVariable rejects unknown, circular, non-hex, and unsupported variables', () => {
  assert.throws(() => resolveColorVariable('--yakit-colors-missing', {}), TypeError)
  assert.throws(
    () =>
      resolveColorVariable('--Colors-Use-a', {
        '--Colors-Use-a': 'var(--yakit-colors-b)',
        '--yakit-colors-b': 'var(--Colors-Use-a)',
      }),
    TypeError,
  )
  assert.throws(
    () => resolveColorVariable('--yakit-colors-rgba', { '--yakit-colors-rgba': 'rgba(0, 0, 0, 1)' }),
    TypeError,
  )
  assert.throws(() => resolveColorVariable('--brand-color', { '--brand-color': '#fff' }), TypeError)
  assert.throws(() => resolveColorVariable('--Colors-Other-Blue', { '--Colors-Other-Blue': '#fff' }), TypeError)
  assert.throws(() => resolveColorVariable('--yakit-other-Blue', { '--yakit-other-Blue': '#fff' }), TypeError)
  assert.throws(
    () => resolveColorVariable('--Colors-Use-Blue', { '--Colors-Use-Blue': 'var(--yakit-other-Blue)' }),
    TypeError,
  )
  assert.throws(
    () => resolveColorVariable('--yakit-colors-Blue', { '--yakit-colors-Blue': 'var(--Colors-Other-Blue)' }),
    TypeError,
  )
  assert.throws(
    () => resolveColorVariable('var(--yakit-colors-color, #fff)', { '--yakit-colors-color': '#fff' }),
    TypeError,
  )
})

test('generateColorScales generates exact light and dark scales without special levels', () => {
  assert.deepEqual(generateColorScales([{ name: ' blue ', hex: '#0000FF' }]), {
    '--yakit-colors-blue-10': '#ebebff',
    '--yakit-colors-blue-20': '#e0e0ff',
    '--yakit-colors-blue-30': '#ccccff',
    '--yakit-colors-blue-40': '#8c8cff',
    '--yakit-colors-blue-50': '#4040ff',
    '--yakit-colors-blue-60': '#1a1aff',
    '--yakit-colors-blue-70': '#0202e8',
    '--yakit-colors-blue-80': '#0606c5',
    '--yakit-colors-blue-90': '#0d0d7f',
    '--yakit-colors-blue-100': '#121245',
  })
  assert.deepEqual(generateColorScales([{ name: 'blue', hex: '#0000FF' }], 'dark'), {
    '--yakit-colors-blue-10': '#15152a',
    '--yakit-colors-blue-20': '#121245',
    '--yakit-colors-blue-30': '#10105d',
    '--yakit-colors-blue-40': '#0d0d7f',
    '--yakit-colors-blue-50': '#0707b9',
    '--yakit-colors-blue-60': '#0202e8',
    '--yakit-colors-blue-70': '#0d0dff',
    '--yakit-colors-blue-80': '#4040ff',
    '--yakit-colors-blue-90': '#8c8cff',
    '--yakit-colors-blue-100': '#ccccff',
  })
})

test('generateColorScales validates inputs and does not mutate them', () => {
  const colors = Object.freeze([Object.freeze({ name: 'Main', hex: '#abc' })])
  const result = generateColorScales(colors)

  assert.equal(Object.keys(result).length, 10)
  assert.equal(result['--yakit-colors-Main-0'], undefined)
  assert.throws(() => generateColorScales([{ name: 'bad name', hex: '#fff' }]), TypeError)
  assert.throws(() => generateColorScales([{ name: '1blue', hex: '#fff' }]), TypeError)
  assert.throws(() => generateColorScales([{ name: 'blue', hex: 'blue' }]), TypeError)
  assert.throws(
    () => generateColorScales([{ name: 'blue', hex: '#fff' }, { name: ' blue ', hex: '#000' }]),
    TypeError,
  )
})

test('generateRandomColorScales defaults to five unique groups', () => {
  withMockRandom(() => 0, () => {
    const result = generateRandomColorScales()
    assert.equal(Object.keys(result).length, 50)
    for (let index = 1; index <= 5; index += 1) {
      assert.equal(Object.keys(result).filter((name) => name.startsWith(`--yakit-colors-Random-${index}-`)).length, 10)
    }
  })
})

test('generateRandomColorScales honors exclusions, explicit counts, uniqueness, and mode', () => {
  withMockRandom(() => 0, () => {
    const result = generateRandomColorScales(['#000', '#000001'], 2, 'dark')
    const expected = generateColorScales(
      [
        { name: 'Random-1', hex: '#000002' },
        { name: 'Random-2', hex: '#000003' },
      ],
      'dark',
    )
    assert.deepEqual(result, expected)
    assert.deepEqual(generateRandomColorScales([], 0), {})
  })
})

test('generateRandomColorScales validates exclusions and count', () => {
  assert.throws(() => generateRandomColorScales(['red']), TypeError)
  for (const count of [-1, 1.5, Number.NaN, Number.POSITIVE_INFINITY]) {
    assert.throws(() => generateRandomColorScales([], count), RangeError)
  }
  assert.throws(() => generateRandomColorScales([], 0x1000001), RangeError)
})

test('the main entry point re-exports the dynamic color APIs', () => {
  assert.equal(colorPackage.resolveColorVariable, resolveColorVariable)
  assert.equal(colorPackage.generateColorScales, generateColorScales)
  assert.equal(colorPackage.generateRandomColorScales, generateRandomColorScales)
})
