import { defineConfig } from 'vite'

export default defineConfig({
    base: '/object-detection/',
    plugins: [],
    optimizeDeps: {
        exclude: ['@xenova/transformers', 'onnxruntime-web'],
    },
})