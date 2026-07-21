#!/usr/bin/env node

import { writeHashedThemeCss, writeThemeCss } from './node'

const USAGE = `Usage: yakit-color-css --main <hex-color> --out <file> [--hashed]

Options:
  --main      Main theme color, for example "#1677ff"
  --out       Output CSS file, for example "public/theme.css"
  --hashed    Add a content hash to the CSS filename and write a manifest
  --manifest  Custom manifest path (only with --hashed)
  --help      Show this help message`

interface CliOptions {
  mainColor?: string
  output?: string
  hashed: boolean
  manifest?: string
  help: boolean
}

function readOptionValue(args: string[], index: number, name: string): [string, number] {
  const argument = args[index]
  const inlinePrefix = `${name}=`

  if (argument.startsWith(inlinePrefix)) {
    return [argument.slice(inlinePrefix.length), index]
  }

  const value = args[index + 1]
  if (!value || value.startsWith('--')) {
    throw new Error(`Missing value for ${name}.`)
  }

  return [value, index + 1]
}

export function parseCliOptions(args: string[]): CliOptions {
  const options: CliOptions = { hashed: false, help: false }

  for (let index = 0; index < args.length; index += 1) {
    const argument = args[index]

    if (argument === '--help' || argument === '-h') {
      options.help = true
    } else if (argument === '--hashed') {
      options.hashed = true
    } else if (argument === '--main' || argument.startsWith('--main=')) {
      ;[options.mainColor, index] = readOptionValue(args, index, '--main')
    } else if (argument === '--out' || argument.startsWith('--out=')) {
      ;[options.output, index] = readOptionValue(args, index, '--out')
    } else if (argument === '--manifest' || argument.startsWith('--manifest=')) {
      ;[options.manifest, index] = readOptionValue(args, index, '--manifest')
    } else {
      throw new Error(`Unknown argument "${argument}".`)
    }
  }

  return options
}

export function runCli(
  args: string[],
  stdout: Pick<NodeJS.WriteStream, 'write'> = process.stdout,
  stderr: Pick<NodeJS.WriteStream, 'write'> = process.stderr,
): number {
  try {
    const options = parseCliOptions(args)

    if (options.help) {
      stdout.write(`${USAGE}\n`)
      return 0
    }
    if (!options.mainColor || !options.output) {
      throw new Error('Both --main and --out are required.')
    }
    if (options.manifest && !options.hashed) {
      throw new Error('--manifest can only be used with --hashed.')
    }

    if (options.hashed) {
      const result = writeHashedThemeCss({
        mainColor: options.mainColor,
        output: options.output,
        manifest: options.manifest,
      })
      stdout.write(`${result.written ? 'Generated' : 'Unchanged'} ${result.output}\n`)
      stdout.write(`${result.manifestWritten ? 'Generated' : 'Unchanged'} ${result.manifest}\n`)
    } else {
      const result = writeThemeCss({
        mainColor: options.mainColor,
        output: options.output,
      })
      stdout.write(`${result.written ? 'Generated' : 'Unchanged'} ${result.output}\n`)
    }
    return 0
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error)
    stderr.write(`Error: ${message}\n\n${USAGE}\n`)
    return 1
  }
}

if (require.main === module) {
  process.exitCode = runCli(process.argv.slice(2))
}
