import { transform } from 'lightningcss'

export const DEV = true
export const now = new Date()
export const srcDir = './src'
export const outputDir = './dist'

export const defaultBuildOptions = {
  entrypoints: [ `${srcDir}/content.ts` ],
  outdir: outputDir,
  target: 'browser',
  format: 'iife',
  splitting: false,
  minify: {
    whitespace: DEV,
    identifiers: DEV,
    syntax: DEV,
  },
  loader: {
    '.css': 'text',
    '.svg': 'text',
  },
  naming: 'mj-downloader-[name].[ext]',
} satisfies Bun.BuildConfig

export const minifyCssPlugin = {
  name: 'css-minify',
  setup(build: any)
  {
    build.onLoad({ filter: /\.css$/ }, async (args: { path: string }) => {
      const source = await Bun.file(args.path).text()
      const result = transform({
        filename: args.path,
        code: Buffer.from(source),
        minify: true,
        drafts: {},
      })
      const minifyText = Buffer.from(result.code).toString('utf8')
      return {
        loader: 'js',
        contents: `export default ${JSON.stringify(minifyText)}`,
      }
    })
  }
}

export const dateFormat: any = {
  year: 'numeric',
  month: 'numeric',
  day: 'numeric',
  hour: '2-digit',
  minute: '2-digit',
  second: '2-digit',
  hour12: false,
}
