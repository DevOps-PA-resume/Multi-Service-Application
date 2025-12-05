import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react-swc'

export default ({ mode }: { mode: string }) => {
  process.env = { ...process.env, ...loadEnv(mode, process.cwd()) }

  return defineConfig({
    plugins: [react()],
    server: {
      host: '0.0.0.0',
      port: parseInt(process.env.VITE_PORT ?? "3000"),
      allowedHosts: ['client', 'localhost', '127.0.0.1'],
      proxy: {
        '/api': {
          target: process.env.VITE_API_URL || `http://api:8000`,
          changeOrigin: true,
        },
      },
    },
  })
}
