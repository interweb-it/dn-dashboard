export default defineEventHandler(async (event) => {
  console.log('event', event);
  // const { chainId, name } = event;
  // const substrateService = new SubstrateService();
  // const api = await substrateService.getApi(chainId);
  // const node = await api.query.staking.nominators(name);
  // return node;
  const runtimeConfig = useRuntimeConfig(event);
  console.debug('runtimeConfig', runtimeConfig);
  const graphqlEndpoint: string = runtimeConfig.graphqlEndpoint as string || 'http://localhost:3002/graphql'

  return proxyRequest(event, graphqlEndpoint);

});
