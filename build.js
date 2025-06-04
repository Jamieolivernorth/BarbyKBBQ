import { build } from 'vite';
import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';

async function buildForVercel() {
  try {
    console.log('Building frontend...');
    
    // Build the Vite frontend
    await build({
      build: {
        outDir: 'dist',
        emptyOutDir: true
      }
    });
    
    console.log('Frontend build completed');
    
    // Copy server files to api directory for Vercel
    console.log('Setting up API routes...');
    
    // Ensure api directory exists
    if (!fs.existsSync('api')) {
      fs.mkdirSync('api');
    }
    
    console.log('Build process completed successfully!');
    
  } catch (error) {
    console.error('Build failed:', error);
    process.exit(1);
  }
}

buildForVercel();