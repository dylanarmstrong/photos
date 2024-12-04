import tailwindcss from 'tailwindcss';
import { defineConfig } from 'vite';
import { viteStaticCopy } from 'vite-plugin-static-copy';

export default defineConfig({
  build: {
    emptyOutDir: true,
    outDir: '../server/static/',
    rollupOptions: {
      input: [
        './src/main.ts',
        './src/details.ts',
      ],
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
  plugins: [
    viteStaticCopy({
      targets: [
        {
          dest: './',
          src: 'node_modules/@fontsource/poppins/files/poppins-latin-700-normal.woff',
        },
        {
          dest: './',
          src: 'node_modules/@fontsource/poppins/files/poppins-latin-700-normal.woff2',
        },
        {
          dest: './',
          src: 'node_modules/@fontsource/poppins/files/poppins-latin-400-normal.woff',
        },
        {
          dest: './',
          src: 'node_modules/@fontsource/poppins/files/poppins-latin-400-normal.woff2',
        },
        {
          dest: './',
          src: 'node_modules/leaflet/dist/images/marker-icon-2x.png',
        },
        {
          dest: './',
          src: 'node_modules/leaflet/dist/images/marker-icon.png',
        },
        {
          dest: './',
          src: 'node_modules/leaflet/dist/images/marker-shadow.png',
        },
      ],
    }),
  ],
});
