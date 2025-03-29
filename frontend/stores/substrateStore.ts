import { defineStore } from 'pinia'

export const useSubstrateStore = defineStore('substrateStore', {
  state: () => ({
    chainId: 'kusama',
    loading: false,
    stakingEntries: [],
    apiConnected: false,
    apipConnected: false,
  }),
  getters: {
    getChainId: (state) => state.chainId,
    getDecimals: (state) => {
      switch (state.chainId) {
        case 'kusama':
          return 12
        case 'polkadot':
          return 10
      }
    }
  },
  actions: {
    setChainId(chainId: string) {
      if (chainId !== this.chainId) {
        this.chainId = chainId
      }
    },
  },
})
