import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react-swc'

export default ({ mode }) => {
  process.env = { ...process.env, ...loadEnv(mode, process.cwd()) }

  return defineConfig({
    plugins: [react()],
    server: {
      host: true,
      port: parseInt(process.env.VITE_PORT ?? "3000"),
      proxy: {
        '/api': {
          target: process.env.VITE_API_URL || `http://api:8000`,
          changeOrigin: true,
        },
      },
    },
  })
}
