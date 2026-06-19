import { defineConfig } from 'vitest/config'

// Aparte testconfig: de rekenkern is pure logica, dus geen react-plugin nodig.
// Dat vermijdt de plugin-type-botsing tussen Vite 8 en Vitest, en houdt de gate snel.
export default defineConfig({
  test: {
    environment: 'node',
    include: ['src/**/*.test.ts'],
  },
})
