import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  base: './', // 相對路徑，GitHub Pages 子路徑也能正常載入
  plugins: [react()],
  server: { host: true },
})
