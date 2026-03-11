/**
 * 빌드 스크립트
 * @author GoOSe
 * @description src/ 폴더에 있는 파일들을 빌드하고 dist/ 폴더에 넣는 스크립트
*/

import { cp } from 'node:fs/promises'
import { DEV, now, srcDir, outputDir, minifyCssPlugin, dateFormat, defaultBuildOptions } from './libs/build'

// print start message
console.log(`▶️ ${now.toLocaleString('ko-KR', dateFormat)} / Build Start!`)

// build content
await Bun.build({
  ...defaultBuildOptions,
  entrypoints: [ `${srcDir}/content.ts` ],
  plugins: [
    DEV && minifyCssPlugin,
  ].filter(Boolean),
})
console.log('✅ (1/4) Built content.ts')

// build background
await Bun.build({
  ...defaultBuildOptions,
  entrypoints: [ `${srcDir}/background.ts` ],
})
console.log('✅ (2/4) Built background.ts')

// copy manifest
await Bun.write(`./${outputDir}/manifest.json`, Bun.file(`${srcDir}/manifest.json`))
console.log('✅ (3/4) Copied manifest.json')

// copy images
await cp(`${srcDir}/images`, `${outputDir}/images`, {
  recursive: true,
})
console.log('✅ (4/4) Copied manifest.json')

// print complete message
console.log(`🎉 Build completed!`)
