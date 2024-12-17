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
    '@nuxtjs/apollo',
    // '@nuxtjs/proxy',
  ],
  plugins: [
    // '~/plugins/telemetry.ts'
  ],
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
        // development: gql endpoint is direct to the backend, so the proxy is not needed
        // production : gql endpoint is proxied to the backend
        httpEndpoint: process.env.GRAPHQL_HTTP_ENDPOINT || 'http://localhost:3002/graphql',
        connectToDevTools: true,
        inMemoryCacheOptions: {
          typePolicies: {
            node: {
              keyFields: ['chainId', 'NodeName']
            },
        //     Candidate: {
        //       keyFields: ['chain', 'stash']
        //     },
        //     CandidateScore: {
        //       keyFields: ['address']
        //     },
        //     Pool: {
        //       keyFields: ['chain', 'id']
        //     }
          }
        },
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

  // development: gql endpoint is direct to the backend, so the proxy is not needed
  // production : gql endpoint is proxied to the backend
  // routeRules: {
  //   '/graphql': {
  //     proxy: process.env.GRAPHQL_BACKEND_URL || 'http://dnd-backend:3002/graphql',
  //   }
  // },

  nitro: {
    // does not work on the SSR
    // devProxy: {
    //   '/graphql' : {
    //     target: 'http://localhost:3002/graphql',
    //     changeOrigin: true,
    //     // pathRewrite: { '^/graphql': '' },
    //   },
    // }
  },
  // we only need to proxy the graphql endpoint in production
  routeRules: {
    '/graphql': {
      // proxy: process.env.GRAPHQL_BACKEND_URL || 'http://dnd-backend:3002/graphql',
      // proxy: 'http://192.168.1.209:4000/graphql', // development
      proxy: 'http://dnd-backend:4000/graphql', // production
    }
  },
  runtimeConfig: {
    public: {
      // apiBase: '/api',
      // GQL_HOST: 'http://localhost:3002/graphql',
      graphqlEndpoint: process.env.NUXT_GRAPHQL_ENDPOINT = 'https://dn.metaspan.io/graphql',
      rpcBaseUrl: process.env.NUXT_RPC_BASE_URL = 'wss://rpc.ibp.network/',
      // graphqlBrowserEndpoint: 'http://localhost:3002/graphql',
    },
  },

  // ...(process.env.NODE_ENV === 'development' 
  //   ? {
  //     // development
  //     runtimeConfig: {
  //       public: {
  //         // apiBase: '/api',
  //         // GQL_HOST: 'http://localhost:3002/graphql',
  //         graphqlEndpoint: 'http://localhost:3002/graphql',
  //         rpcBaseUrl: 'wss://rpc.ibp.network/',
  //         // graphqlBrowserEndpoint: 'http://localhost:3002/graphql',
  //       },
  //     },
  //   }
  // ) : {}
})
