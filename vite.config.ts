import type { Plugin } from 'vite';
import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import { copyFile, mkdir } from 'node:fs/promises';
import { resolve } from 'node:path';
import { fileURLToPath, URL } from 'node:url';
import { defineConfig } from 'vite';

const __dirname = fileURLToPath(new URL('.', import.meta.url));

// Custom plugin to copy manifest.json to dist
function copyFiles(): Plugin {
    return {
        buildStart() {
            this.addWatchFile(resolve(__dirname, 'manifest.json'));
        },
        name: 'copy-files',
        async writeBundle() {
            await copyFile(resolve(__dirname, 'manifest.json'), resolve(__dirname, 'dist/manifest.json'));

            await mkdir(resolve(__dirname, 'dist/icons'), { recursive: true });
            await copyFile(resolve(__dirname, 'icons/16.png'), resolve(__dirname, 'dist/icons/16.png'));
            await copyFile(resolve(__dirname, 'icons/32.png'), resolve(__dirname, 'dist/icons/32.png'));
            await copyFile(resolve(__dirname, 'icons/48.png'), resolve(__dirname, 'dist/icons/48.png'));
            await copyFile(resolve(__dirname, 'icons/128.png'), resolve(__dirname, 'dist/icons/128.png'));
        },
    } satisfies Plugin;
}

export default defineConfig({
    build: {
        emptyOutDir: true,
        outDir: 'dist',
        rollupOptions: {
            external: [],
            input: {
                background: resolve(__dirname, 'src/background.ts'),
                content: resolve(__dirname, 'src/content.ts'),
            },
            output: { assetFileNames: '[name].[ext]', chunkFileNames: '[name].js', entryFileNames: '[name].js' },
        },
    },
    plugins: [react(), tailwindcss(), copyFiles()],
});
