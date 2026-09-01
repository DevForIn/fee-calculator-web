import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// base 경로 분기:
// - GitHub Pages: /fee-calculator-web/ (하위 경로 서빙)
// - NAS/nginx 루트 서빙 or 커스텀 도메인: /
// 빌드 시 VITE_BASE 로 제어 (없으면 GitHub Pages 기본값)
export default defineConfig({
  base: process.env.VITE_BASE ?? '/fee-calculator-web/',
  plugins: [react()],
})
