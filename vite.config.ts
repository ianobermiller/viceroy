import type { Plugin } from 'vite';
import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import { copyFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { fileURLToPath, URL } from 'node:url';
import { defineConfig } from 'vite';

const __dirname = fileURLToPath(new URL('.', import.meta.url));

// Custom plugin to copy manifest.json to dist
function copyManifest(): Plugin {
    return {
        buildStart() {
            this.addWatchFile(resolve(__dirname, 'manifest.json'));
        },
        name: 'copy-manifest',
        async writeBundle() {
            await copyFile(resolve(__dirname, 'manifest.json'), resolve(__dirname, 'dist/manifest.json'));
            await copyFile(resolve(__dirname, 'src/popup/popup.html'), resolve(__dirname, 'dist/popup.html'));
        },
    } satisfies Plugin;
}

export default defineConfig({
    build: {
        emptyOutDir: true,
        outDir: 'dist',
        rollupOptions: {
            input: {
                content: resolve(__dirname, 'src/content/content.ts'),
                popup: resolve(__dirname, 'src/popup/popup.html'),
            },
            output: { assetFileNames: '[name].[ext]', chunkFileNames: '[name].js', entryFileNames: '[name].js' },
        },
    },
    plugins: [react(), tailwindcss(), copyManifest()],
    resolve: { alias: { '@': resolve(__dirname, 'src') } },
});
