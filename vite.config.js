import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';

// base './' so the build works from GitHub Pages at /surejake-app/
export default defineConfig({
  plugins: [react()],
  base: './',
});
