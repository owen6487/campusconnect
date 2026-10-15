import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'
import tailwindcss from '@tailwindcss/vite'


// https://vite.dev/config/
export default defineConfig({
  envPrefix: ['VITE_', 'REACT_', 'SERVER_', 'GOOGLE_'],
  plugins: [react(), tailwindcss({})],
})
