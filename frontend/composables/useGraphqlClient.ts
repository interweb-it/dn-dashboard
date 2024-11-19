// composables/useGraphqlClient.ts
import { GraphQLClient } from 'graphql-request'

export function useGraphqlClient() {
  const config = useRuntimeConfig()
  
  // Use server-side endpoint during SSR and client-side endpoint during CSR
  const endpoint: string = process.server
    ? config.public.graphqlEndpoint as string
    : config.public.graphqlBrowserEndpoint as string

  return new GraphQLClient(endpoint, {
    headers: {
      'Content-Type': 'application/json',
    },
  })
}
