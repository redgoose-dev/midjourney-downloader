/**
 * 빌드 스크립트
 * @author GoOSe
 * @description src/ 폴더에 있는 파일들을 빌드하고 dist/ 폴더에 넣는 스크립트
*/

import type { BuildConfig } from "bun"

// assets
const srcDir = './src'
const outputDir = './dist'
const now = new Date()
const defaultBuildOptions = {
  entrypoints: [ `${srcDir}/content.ts` ],
  outdir: outputDir,
  target: 'browser',
  format: 'iife',
  splitting: false,
  minify: {
    whitespace: false,
    identifiers: false,
    syntax: false,
  },
  env: 'inline',
  loader: {
    '.css': 'text',
  },
  naming: 'mj-downloader-[name].[ext]',
} satisfies BuildConfig
const dateFormat: any = {
  year: 'numeric',
  month: 'numeric',
  day: 'numeric',
  hour: '2-digit',
  minute: '2-digit',
  second: '2-digit',
  hour12: false,
}

console.log(`▶️ ${now.toLocaleString('ko-KR', dateFormat)} / Build Start!`)

// build content
await Bun.build({
  ...defaultBuildOptions,
  entrypoints: [ `${srcDir}/content.ts` ],
})
console.log('✅ (1/3) Built content.ts')

// build background
await Bun.build({
  ...defaultBuildOptions,
  entrypoints: [ `${srcDir}/background.ts` ],
})
console.log('✅ (2/3) Built background.ts')

// copy manifest
await Bun.write(`./${outputDir}/manifest.json`, Bun.file(`${srcDir}/manifest.json`))
console.log('✅ (3/3) Copied manifest.json')

// print complete message
console.log(`🎉 Build completed!`)
