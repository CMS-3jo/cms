
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
	plugins: [react()],
	server: {
		proxy: {
			'/api': { // 모든 경로를 대상
				target: 'http://localhost:8082',
				changeOrigin: true, // 대상 서버의 Origin을 변경하여 CORS 문제 해결
				secure: false, // 개발 시 HTTPS가 아닌 HTTP를 사용할 때 필요
			},
			
		},
	},
	define: {
	    global: 'window', // global is not defined 오류 대응 (sockjs-client 브라우저 호환)
	},
})
