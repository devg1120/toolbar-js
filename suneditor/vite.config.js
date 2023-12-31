import { resolve } from 'path'
import { defineConfig } from 'vite'

export default defineConfig({
  build: {
    lib: {
      entry: resolve(__dirname, 'src/suneditor.js'),
      name: 'suneditor',
      fileName: 'suneditor',
      formats: ['es', 'umd'],
    },
  },
})
