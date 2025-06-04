import { build } from 'vite';
import fs from 'fs';
import path from 'path';

async function buildForProduction() {
  try {
    console.log('Building for production...');
    
    // Build with smaller chunks to avoid timeout
    await build({
      build: {
        outDir: 'server/public',
        emptyOutDir: true,
        rollupOptions: {
          output: {
            manualChunks: {
              vendor: ['react', 'react-dom'],
              ui: ['@radix-ui/react-slot', '@radix-ui/react-dialog'],
              utils: ['clsx', 'tailwind-merge', 'date-fns']
            }
          }
        }
      }
    });
    
    console.log('Build completed successfully!');
  } catch (error) {
    console.error('Build failed:', error);
    process.exit(1);
  }
}

buildForProduction();