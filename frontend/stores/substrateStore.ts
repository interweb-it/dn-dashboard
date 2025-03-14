import { defineStore } from 'pinia'

export const useSubstrateStore = defineStore('substrateStore', {
  state: () => ({
    chainId: 'kusama',
    loading: false,
    stakingEntries: [],
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
