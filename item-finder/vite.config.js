import fs from 'fs';
import path from 'path';

export default {
  root: 'client-src',
  build: {
    outDir: '../client-dist'
  },
  server: {
    host: true,   // listen on all interfaces
    port: 8081,   // dev-server for client has a different PORT than dev-server for backend
    proxy: {
      '/api': {
        target: 'http://localhost:8080',
        changeOrigin: true,
      },
      '/images': { target: 'http://localhost:8080' }
    }
  }
};
