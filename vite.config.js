import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate', // Atualiza o app sozinho se houver versão nova
      includeAssets: ['logo.png'], // Usa o seu logo
      manifest: {
        name: 'Sentry-Estoque: Foquinha Azul',
        short_name: 'Estoque',
        description: 'Sistema de gestão de estoque da Academia Foquinha Azul',
        theme_color: '#1e3a8a', // Azul Marinho
        background_color: '#f8fafc',
        display: 'standalone', // Faz abrir em tela cheia (sem barra do Chrome)
        icons: [
          {
            src: 'logo.png',
            sizes: '192x192',
            type: 'image/png'
          },
          {
            src: 'logo.png',
            sizes: '512x512',
            type: 'image/png'
          }
        ]
      }
    })
  ],
})