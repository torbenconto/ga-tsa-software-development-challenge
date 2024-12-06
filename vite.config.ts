import { defineConfig } from 'vite'
import mkcert from 'vite-plugin-mkcert'
import react from '@vitejs/plugin-react'
import {GOOGLE_NEWS_RSS_URL} from "./src/constants/api.ts";
import tsconfigPaths from 'vite-tsconfig-paths';

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), mkcert(), tsconfigPaths()],
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
