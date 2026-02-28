import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import htmlMinifier from 'vite-plugin-html-minifier'
import { viteSingleFile } from 'vite-plugin-singlefile'

export default defineConfig({
  plugins: [
    react({
      babel: {
        plugins: [['babel-plugin-react-compiler']],
      },
    }),
    htmlMinifier({
      minify: {
        collapseWhitespace: true,
        removeComments: true,
        removeRedundantAttributes: true,
        removeScriptTypeAttributes: true,
        removeStyleLinkTypeAttributes: true,
        removeEmptyAttributes: true,
        useShortDoctype: true,
        minifyCSS: true,
        minifyJS: true,
        minifyURLs: true,
      },
    }),
    viteSingleFile(), // <-- all JS/CSS inlined into index.html
  ],
  build: {
    target: 'esnext',
    outDir: 'dist',
    cssCodeSplit: false, // must be false to inline CSS
    rollupOptions: {
      output: {
        inlineDynamicImports: true, // ensures dynamic imports are bundled
      },
    },
  },
})