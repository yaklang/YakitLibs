import assert from 'node:assert/strict'

import {
  generateColorScales,
  generateRandomColorScales,
  resolveColorVariable,
} from '../src/index'

const colorLevels = [10, 20, 30, 40, 50, 60, 70, 80, 90, 100] as const
const hexColorPattern = /^#[0-9a-f]{6}$/i
const modes = ['light', 'dark'] as const

const manualColors = generateColorScales([
  { name: 'blue', hex: '#0000FF' },
  { name: 'green', hex: '#00FF00' },
])

for (const mode of modes) {
  assert.equal(Object.keys(manualColors[mode]).length, 20)
  for (const name of ['blue', 'green']) {
    for (const level of colorLevels) {
      const value = manualColors[mode][`--yakit-colors-${name}-${level}`]
      assert.match(value, hexColorPattern)
    }
  }
}

const resolvedColor = resolveColorVariable('--Colors-Use-Example-Primary', {
  ...manualColors.light,
  '--Colors-Use-Example-Primary': 'var(--yakit-colors-blue-60)',
})

assert.equal(resolvedColor, manualColors.light['--yakit-colors-blue-60'])

const randomGroupCount = 3
const randomColors = generateRandomColorScales(['#0000FF', '#00FF00'], randomGroupCount)

for (const mode of modes) {
  assert.equal(Object.keys(randomColors[mode]).length, randomGroupCount * colorLevels.length)
  for (let group = 1; group <= randomGroupCount; group += 1) {
    for (const level of colorLevels) {
      const value = randomColors[mode][`--yakit-colors-Random-${group}-${level}`]
      assert.match(value, hexColorPattern)
    }
  }
}

console.log('Color source API example passed:')
console.log(`- generated ${Object.keys(manualColors.light).length} variables per mode from 2 manual base colors`)
console.log(`- resolved --Colors-Use-Example-Primary to ${resolvedColor}`)
console.log(`- generated ${Object.keys(randomColors.light).length} variables per mode across ${randomGroupCount} random groups`)
