import { defineStore } from 'pinia'

export const useSubstrateStore = defineStore({
  id: 'substrateStore',
  state: () => ({
    chainId: 'kusama',
    loading: false,
    apiConnected: false,
    apipConnected: false,
  }),
  actions: {
    setChainId(chainId: string) {
      if (chainId !== this.chainId) {
        this.chainId = chainId
      }
    },
  },
})
