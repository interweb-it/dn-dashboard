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
        httpEndpoint: process.env.GRAPHQL_API_URL ?? 'http://localhost:3000/graphql',
        inMemoryCacheOptions: {
          typePolicies: {
            Query: {
              fields: {
                performance: {
                  keyArgs: ['chainId', 'address', 'number_sessions'],
                },
                stakersForStash: {
                  keyArgs: ['chainId', 'stash'],
                },
                nominationStats: {
                  keyArgs: ['chainId', 'stash'],
                },
                exposureStats: {
                  keyArgs: ['chainId', 'stash'],
                },
              },
            },
          },
        },
      },
    },
  },
});
