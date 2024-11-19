<template>
  <v-container>
    <!-- <ClientOnly> -->
      <v-toolbar>
        <v-btn :to="`/cohort/${id}`">
          <v-icon>mdi-chevron-left</v-icon>
        </v-btn>
        <v-toolbar-title>
          [DN] cohort {{ id }} for {{ chain }}
        </v-toolbar-title>
      </v-toolbar>
    <!-- </ClientOnly> -->

    <!-- |{{ data }}| -->

    <v-tabs v-model="tab">
      <v-tab value="selected">
        Selected ({{ data[chain]?.selected?.length || 0 }})
      </v-tab>
      <v-tab value="backups">
        Backups ({{ data[chain]?.backups?.length || 0 }})
      </v-tab>
      <v-tab value="nominators">
        Nominators ({{ data[chain]?.nominators?.length || 0 }})
      </v-tab>
    </v-tabs>
    <v-card-text>
      <v-tabs-window v-model="tab">
        <v-tabs-window-item value="selected">
          <!-- {{ data[chain].selected }} -->
          <validator-list :chain="chain" :list="data[chain].selected"></validator-list>
        </v-tabs-window-item>

        <v-tabs-window-item value="backups">
          {{ data[chain].backups }}
          <!-- <nominator-list :chain="chain" :list="data[chain].backups"></nominator-list> -->
        </v-tabs-window-item>

        <v-tabs-window-item value="nominators">
          <!-- {{ data[chain].nominators }} -->
          <nominator-list :chain="chain" :list="data[chain].nominators"></nominator-list>
        </v-tabs-window-item>
      </v-tabs-window>
    </v-card-text>

  </v-container>
</template>

<script  lang="ts">
import { defineComponent } from 'vue'
import ValidatorList from '~/components/ValidatorList.vue'
import NominatorList from '~/components/NominatorList.vue'

const data = {
  kusama: {
    selected: [
      { identity: 'METASPAN', stash: 'HyLisujX7Cr6D7xzb6qadFdedLt8hmArB6ZVGJ6xsCUHqmx', status: 'Active' },
      { identity: 'METASPAN/3', stash: 'JKhBBSWkr8BJKh5eFBtRux4hsDq4sAxvvmMU426qUA9aqEQ', status: 'Active' }
    ],
    backups: [],
    nominators: [],
    statuses: {
      Active: 'The node is nominated by the program',
      Pending: 'The node is selected and will be nominated soon',
      Graduated: 'The node has accummulated enough nominations to be active and is no longer supported by the program',
      Removed: 'The node has been removed from the program due to some violation'
    }
  },
  polkadot: {
    "selected": [
      { identity: "METASPAN (also try POOL #18)", stash: '16ce9zrmiuAtdi9qv1tuiQ1RC1xR6y6NgnBcRtMoQeAobqpZ', status: 'Active' },
      { identity: "<name>", stash: '<stash>', status: 'Pending' }
    ],
    "backups": [
      { "identity": '<name>', "stash": '<stash>' },
    ],
    "nominators": [
      "16XJHQ58dEPnZn5J5YqmRcJmKtvVFFMoMrXgj6fWJfeGGkQw",
      "13GLXK1TZKKDM9aRBBK3VYZymHjKChtQjJznsRqaR9dwwrQU"
    ],
    "statuses": {
        "Active": "The node is nominated by the program",
        "Pending": "The node is selected and will be nominated soon",
        "Graduated": "The node has accummulated enough nominations to be active and is no longer supported by the program",
        "Removed": "The node has been removed from the program due to some violation"
    }
  }
}

export default defineComponent({
  name: 'Homepage',
  components: {
    ValidatorList,
    NominatorList
  },
  props: {
    msg: {
      type: String,
      required: false
    }
  },
  setup() {
    const route = useRoute()
    const router = useRouter()
    console.log(route)
    const id = ref(route.params.id || 1)
    const chain = ref('polkadot')
    const tab = ref('selected')
    // const data = computed(() => data[chain.value])

    if (route.params.chain ) {
      chain.value = route.params.chain
    }
    if (route.query.tab) {
      tab.value = route.query.tab
    }

    // https://nodes.web3.foundation/api/cohort/1/polkadot
    return {
      id,
      tab,
      chain,
      data, // : data[chain]
    }
  }
})
</script>
