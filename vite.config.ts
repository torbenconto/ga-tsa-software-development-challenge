import { defineConfig } from 'vite'
import mkcert from 'vite-plugin-mkcert'
import react from '@vitejs/plugin-react'
import {GOOGLE_NEWS_RSS_URL} from "./src/constants/api.ts";

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), mkcert()],
  server: {
    host: '127.0.0.1',
    proxy: {
      '/rss': {
        target: GOOGLE_NEWS_RSS_URL,
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/rss/, ''),
        secure: true,
      },
    },
  },
})
