// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2024-04-03', // required
  devtools: { enabled: true },
  build: {
    transpile: [
      'vuetify',
    ],
  },
  modules: [
    'vuetify-nuxt-module',
    '@pinia/nuxt',
    // 'nuxt-graphql-client',
    '@nuxtjs/apollo',
  ],
  plugins: ['~/plugins/telemetry.ts'],
  vuetify: {
    moduleOptions: {
      /* module specific options */
    },
    vuetifyOptions: {
      /* vuetify options */
    }
  },
  apollo: {
    autoImports: true,
    // authType: 'Bearer',
    // authHeader: 'Authorization',
    tokenStorage: 'cookie',
    proxyCookies: true,
    clients: {
      default: {
        httpEndpoint: 'http://localhost:3002/graphql',
        connectToDevTools: true,
        // inMemoryCacheOptions: {
        //   typePolicies: {
        //     Candidate: {
        //       keyFields: ['chain', 'stash']
        //     },
        //     CandidateScore: {
        //       keyFields: ['address']
        //     },
        //     Pool: {
        //       keyFields: ['chain', 'id']
        //     }
        //   }
        // },
      },
    },
  },
  // graphql: {
  //   clients: {
  //     default: {
  //       endpoint: 'http://localhost:4000/graphql',
  //     },
  //   },
  // },
  webpack: {
    loaders: {
      vue: {
        hotReload: true,
      }
    }
  },
  runtimeConfig: {
    public: {
      // apiBase: '/api',
      GQL_HOST: 'http://localhost:3002/graphql',
      // graphqlEndpoint: 'http://localhost:3002/graphql',
      // graphqlBrowserEndpoint: 'http://localhost:3002/graphql',
    },
  }
})