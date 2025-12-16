import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, (process as any).cwd(), '');
  return {
    plugins: [react()],
    base: './', // Ensures relative paths for assets on GitHub Pages
    define: {
      // Polyfill process.env for the app code
      'process.env': {
        API_KEY: env.API_KEY || "", 
        NODE_ENV: mode
      }
    }
  };
});