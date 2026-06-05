import { defineConfig } from 'vite';
import angular from '@vitejs/plugin-angular';

export default defineConfig({
  plugins: [angular()],
  server: {
    host: '0.0.0.0',
    port: 4200,
    allowedHosts: true
  }
});
