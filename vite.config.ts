import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// `base: './'` keeps every asset URL relative, so the same build works from
// `user.github.io/`, from `user.github.io/repo/` and from `vite preview`.
export default defineConfig({
  base: './',
  plugins: [react()],
  build: { outDir: 'dist', assetsDir: 'assets', sourcemap: false },
});
