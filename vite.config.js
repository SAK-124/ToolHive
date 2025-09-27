import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig(({ command, mode }) => {
  const env = loadEnv(mode, process.cwd(), '')
  return {
    plugins: [
      react({
        jsxRuntime: 'automatic',
        jsxImportSource: '@emotion/react',
        babel: {
          plugins: ['@emotion/babel-plugin'],
          compact: true
        }
      }),
    ],
    build: {
      chunkSizeWarningLimit: 1000,
      rollupOptions: {
        output: {
          manualChunks: (id) => {
            if (id.includes('node_modules')) {
              if (id.includes('react')) return 'react-vendor';
              if (id.includes('@mui/material') || id.includes('@mui/system')) return 'mui-core';
              if (id.includes('@mui/icons')) return 'mui-icons';
              if (id.includes('@emotion')) return 'emotion';
              if (id.includes('firebase')) return 'firebase';
              return 'vendor'; // other dependencies
            }
          },
          assetFileNames: (assetInfo) => {
            const info = assetInfo.name.split('.')
            const ext = info[info.length - 1]
            if (/png|jpe?g|svg|gif|tiff|bmp|ico/i.test(ext)) {
              return `assets/images/[name]-[hash][extname]`
            }
            return `assets/[name]-[hash][extname]`
          },
          chunkFileNames: 'assets/js/[name].[hash].js',
          entryFileNames: 'assets/js/[name].[hash].js'
        }
      },
      sourcemap: mode === 'development',
      minify: 'esbuild',
      target: 'esnext',
      assetsInlineLimit: 4096,
      cssCodeSplit: true,
      reportCompressedSize: false,
      write: true,
      manifest: true
    },
    optimizeDeps: {
      include: [
        'react',
        'react-dom',
        'react-router-dom',
        '@mui/material',
        '@mui/icons-material',
        '@emotion/react',
        '@emotion/styled',
        'firebase/app',
        'firebase/auth'
      ],
      esbuildOptions: {
        target: 'esnext'
      }
    },
    server: {
      port: 3000,
      headers: {
        'Cache-Control': 'no-store'
      }
    }
  }
})
