import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// In development the API runs on :5000. Proxying keeps cookies same-origin, so no CORS setup is needed.
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    proxy: {
      '/api': 'https://bitcrewnet.vercel.app',
      '/sitemap.xml': 'https://bitcrewnet.vercel.app',
      '/robots.txt': 'https://bitcrewnet.vercel.app',
    },
  },
  build: {
    outDir: 'dist',
    sourcemap: false,
    rollupOptions: {
      output: { manualChunks: { gsap: ['gsap', 'gsap/ScrollTrigger'] } },
    },
  },
});
