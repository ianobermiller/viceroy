import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import { resolve } from 'node:path';
import { fileURLToPath, URL } from 'node:url';
import { defineConfig } from 'vite';

const __dirname = fileURLToPath(new URL('.', import.meta.url));

export default defineConfig({
    build: {
        outDir: 'dist',
        rollupOptions: {
            input: {
                content: resolve(__dirname, 'src/content/content.ts'),
                popup: resolve(__dirname, 'src/popup/popup.html'),
            },
            output: { assetFileNames: '[name].[ext]', chunkFileNames: '[name].js', entryFileNames: '[name].js' },
        },
    },
    plugins: [react(), tailwindcss()],
    resolve: { alias: { '@': resolve(__dirname, 'src') } },
});
