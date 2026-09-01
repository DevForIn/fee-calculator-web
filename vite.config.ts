import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// https://vite.dev/config/
// GitHub Pages는 https://<user>.github.io/<repo>/ 경로로 서빙되므로 base 지정 필요.
// 커스텀 도메인(showfeethemoney.com 등) 붙이면 base를 '/'로 바꾸면 됨.
export default defineConfig({
  base: '/fee-calculator-web/',
  plugins: [react()],
})
