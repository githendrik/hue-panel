// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  devtools: { enabled: true },
  compatibilityDate: '2024-11-01',

  runtimeConfig: {
    // Override via HUE_STORAGE_PATH env var in the LXC container
    hueStoragePath: process.env.HUE_STORAGE_PATH || './data',
  },

  nitro: {
    preset: 'node-server',

    // Experimental scheduled tasks (built-in, no external deps)
    experimental: {
      tasks: true,
    },

    // Register the every-minute tick task
    scheduledTasks: {
      '* * * * *': ['hue:tick'],
    },

    // Persistent file-system storage for bridge config + timers
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
