import tailwindcss from 'tailwindcss';
import { defineConfig } from 'vite'

export default defineConfig({
  build: {
    emptyOutDir: true,
    outDir: '../server/static/',
    rollupOptions: {
      input: './src/main.ts',
      output: {
        assetFileNames: '[name][extname]',
        entryFileNames: '[name].js',
      },
    },
  },
  css: {
    postcss: {
      plugins: [tailwindcss()],
    },
  },
})
