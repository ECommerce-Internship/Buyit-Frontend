import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
    plugins: [react(), tailwindcss()],
    server: {
        watch: {
            // Visual Studio locks files inside its hidden ".vs" folder.
            // Without this, Vite's file-watcher crashes with "EBUSY: resource busy or locked".
            ignored: ['**/.vs/**'],
        },
    },
})