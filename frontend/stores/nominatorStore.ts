import { defineStore } from 'pinia'

interface INominator {
  address: string
  balance: number
  targets: string[]
}

export const useNominatorStore = defineStore({
  id: 'nominatorStore',
  state: () => ({
    chainId: 'kusama',
    search: '',
    stakingEntries: [],
    nominators: new Map<string, INominator>(),
    loading: false,
  }),
  // getters: {
  //   nodes: (state) => state.nodes,
  // },
  actions: {
    setSearch(search: string) {
      this.search = search
    },
    setChainId(chainId: string) {
      if (chainId !== this.chainId) {
        this.chainId = chainId
        this.nominators.clear()
      }
    },
    setStakingEntries(stakingEntries: any) {
      this.stakingEntries = stakingEntries
    },
    addNominator(nominator: INominator) {
      // console.log('Adding node', node);
      if (!(this.nominators instanceof Map)) {
        this.nominators = new Map(); // Reinitialize if something goes wrong
      }
      this.nominators.set(nominator.address, nominator);
    },
    removeNode(stash: string) {
      this.nominators.delete(stash)
    },
  },
})
