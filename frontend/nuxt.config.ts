import { defineNuxtConfig } from 'nuxt/config'

export default defineNuxtConfig({
  compatibilityDate: '2024-11-01',
  devtools: { enabled: true },
  plugins: [
    // '~/services/substrateService.ts',
  ],
  // services: [
  //   '~/services/substrateService.ts',
  // ],
  modules: [
    'vuetify-nuxt-module',
    '@pinia/nuxt',
    '@nuxtjs/apollo',
  ],
  vuetify: {
    moduleOptions: {
      // treeshaking: true,
    },
    vuetifyOptions: {
      theme: {
        // defaultTheme: 'dark',
      },
    },
  },
  apollo: {
    clients: {
      default: {
        httpEndpoint: 'http://localhost:3002/graphql',
      },
    },
  },
});
