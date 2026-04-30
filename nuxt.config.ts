// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  devtools: { enabled: true },
  compatibilityDate: '2024-11-01',

  // SPA mode — no SSR needed for a local LAN tool, and it eliminates
  // the Vue SSR node_modules that break bun --compile
  ssr: false,

  runtimeConfig: {
    hueStoragePath: process.env.HUE_STORAGE_PATH || './data',
  },

  nitro: {
    preset: 'node-server',

    experimental: {
      tasks: true,
    },

    scheduledTasks: {
      '* * * * *': ['hue:tick'],
    },

    storage: {
      fs: {
        driver: 'fs',
        base: process.env.HUE_STORAGE_PATH || './data',
      },
    },
  },

  app: {
    head: {
      title: 'Hue Vacation Panel',
      meta: [{ name: 'viewport', content: 'width=device-width, initial-scale=1' }],
    },
  },
})
