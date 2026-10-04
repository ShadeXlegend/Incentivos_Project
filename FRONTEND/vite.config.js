import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@src': path.resolve(__dirname, './src'),
      'theme': path.resolve(__dirname, './src/theme'),
      'states': path.resolve(__dirname, './src/states'),
       '@emotion/react': path.resolve(__dirname, 'node_modules/@emotion/react'),
      '@emotion/styled': path.resolve(__dirname, 'node_modules/@emotion/styled'),
      'components': path.resolve(__dirname, './src/components'),
    },
  },
})
