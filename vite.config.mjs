import { defineConfig } from 'vite'

export default defineConfig({
    plugins: [],
    optimizeDeps: {
        exclude: ['@xenova/transformers', 'onnxruntime-web'],
    },
})