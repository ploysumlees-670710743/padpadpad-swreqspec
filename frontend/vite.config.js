import { defineConfig, loadEnv } from 'vite';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig(({ mode }) => {
  const { VITE_DEMO_MODE } = loadEnv(mode, process.cwd(), '');

  const proxy = VITE_DEMO_MODE === 'true'
    ? {}
    : {
        '/api/schedule': {
          target: 'http://localhost:8000',
          changeOrigin: true,
          rewrite: (path) => path.replace(/^\/api/, ''),
        },
        '/api': {
          target: 'http://localhost:8000',
          changeOrigin: true,
        },
        '/enrollment': {
          target: 'http://localhost:8000',
          changeOrigin: true,
        },
        '/applications': {
          target: 'http://localhost:8000',
          changeOrigin: true,
        },
      };

  return {
    plugins: [tailwindcss()],
    server: { proxy },
    test: {
      exclude: [
        '**/node_modules/**',
        '**/dist/**',
        '**/uc01_uc07_prototype.test.js',
      ],
    },
  };
});
