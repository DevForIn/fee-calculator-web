import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// base 경로:
// - dev(serve): 항상 '/' → 카카오 콜백(/oauth/kakao) 경로와 일치
// - build: VITE_BASE 사용 (GitHub Pages=/fee-calculator-web/, NAS=/)
export default defineConfig(({ command }) => ({
  base: command === 'serve' ? '/' : (process.env.VITE_BASE ?? '/fee-calculator-web/'),
  plugins: [react()],
}))
