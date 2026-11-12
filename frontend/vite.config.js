import { defineConfig, loadEnv } from 'vite';

// รองรับ: FR-ENR-01, FR-ENR-02, FR-ENR-04, FR-ENR-06, FR-ENR-07, CON-ENR-02
export default defineConfig(({ mode }) => {
  const { VITE_DEMO_MODE } = loadEnv(mode, process.cwd(), '');
  const proxy = VITE_DEMO_MODE === 'true'
    ? {}
    : {
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
    server: { proxy },
    // UC-01/UC-07 contracts run separately with node --test.
    test: { exclude: ['**/node_modules/**', '**/dist/**', '**/uc01_uc07_prototype.test.js'] },
  };
});
