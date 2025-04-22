// @ts-expect-error vite isn't published quite correctly
import tailwindcss from '@tailwindcss/vite';
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
  plugins: [
    tailwindcss(),
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
