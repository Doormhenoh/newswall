/// <reference types="vitest/config" />
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { newswallApi } from './server/vitePlugin'

export default defineConfig({
  plugins: [react(), tailwindcss(), newswallApi()],
  server: {
    port: 5173,
    strictPort: true,
  },
  test: {
    environment: 'node',
    include: ['tests/**/*.test.{ts,tsx}'],
    pool: 'forks',
    maxWorkers: 1,
    fileParallelism: false,
  },
})
