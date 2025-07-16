<template>
  <v-container>
    <v-toolbar flat elevation="0" color="background" >
      <v-toolbar-title>Telemetry: {{ chainId }}</v-toolbar-title>
      <!-- <v-spacer></v-spacer> -->
      <v-toolbar-items>
      </v-toolbar-items>
      <v-text-field v-model="search" prepend-icon="mdi-magnify" hide-details single-line placeholder="search"></v-text-field>
      <!-- <v-btn @click="subscribe()">Subscribe</v-btn> -->
      <!-- <v-btn @click="unsubscribe()">Unsubscribe</v-btn> -->
      <v-btn @click="doRefetch()">Refetch</v-btn>
    </v-toolbar>

    <!-- |{{ nodeList }}| -->

    <v-data-table :items="gridList" :headers="headers" :search="search">
      <template v-slot:item.NetworkId="{ value }">
        {{ shortStash(value) }}
      </template>
      <template v-slot:item.action="{ item }">
        <!-- <v-btn @click="setNode(item)">Details</v-btn> -->
        <nuxt-link :to="`/${chainId}/telemetry/${item.NodeDetails.NetworkId}`">
          <v-icon>mdi-chevron-right</v-icon>
        </nuxt-link>
      </template>
    </v-data-table>

    <pre>{{ telemetryData }}</pre>

    <node-details-card :node="node || {}" :show-dialog="showDialog" @on-model-value="onModalValue"></node-details-card>
  </v-container>
</template>

<script lang="ts">
// import { FeedMessage } from '@/pages/substrate-telemetry'
// import { FeedVersion, NodeDetails } from '../substrate-telemetry/types'
import { useNodeStore } from '@/stores/nodeStore'
// import { Message } from '@/utils/substrate-telemetry/types'
import NodeDetailsCard from '@/components/NodeDetailsCard.vue'

const QUERY_TELEMETRY_NODES = gql`
query telemetryNodes($chainId: String!) {
  nodes(chainId: $chainId) {
    NodeId
    NodeDetails {
      NodeName
      NetworkId
      NodeImplementation
      NodeVersion
      Address
      # NodeHostInfo
      # NodeHardwareInfo
      CpuArchitecture {
        cpu
        memory
        core_count
        linux_kernel
        linux_distro
        is_virtual_machine
      }
      TargetEnv {
        cpu_hashrate_score
        memory_memcpy_score
        disk_sequential_write_score
        disk_random_write_score
      }

    }
  }
}
`

const nodeExample = [
  // index
  9,
  // Name, Implementation, version, nodeHadsh?, stash?, ip, hostInfo, harwareInfo
  [
    "Sio34","Parity Polkadot","1.16.2-dba2dd59101","1614F5TvNUQmPZ964M9KCdJfmQjnkdtHYXPhuX2KeNCnuc7U","12D3KooWEYsmg5EEeCGqAq32bRGVcCh63nGLXeTyYBDvGZtyLVMy","95.141.47.38",
    {"cpu":"AMD Ryzen 9 7950X 16-Core Processor","memory":8589934592,"core_count":4,"linux_kernel":"6.5.11-8-pve","linux_distro":"Ubuntu 22.04 LTS","is_virtual_machine":false},
    {"cpu_hashrate_score":1601,"memory_memcpy_score":3737,"disk_sequential_write_score":790,"disk_random_write_score":166}
  ],
  // 
  [40,0],
  // 
  [
    [49641924,46206388,44126828,49160020,46666330,44361896,49851948,50195184,44675084,46761572,50680420,46093460,44242172,49386810,47484452,44106988,47222612,50446410,45993416,44195810]
  ],
  [
    [1460479.25,2729257.6875,1355232.1875,1411499.65625,1992363.84375,2384823.5625,2306877.71875,2406817.53125,2596981.40625,1976183.8125,1293825.78125,2502898.6875,1440372.21875,2111287.09375,2233884.75,2200552.875,1832570.71875,1537815.0625,1650053.75,1125923.84375],
    [1936098.375,2021537.25,2077542.21875,1776978.09375,2126238.78125,2133989.15625,2103076.46875,2220498.03125,2158635.53125,2047208.3125,2185327.0625,2224944.96875,2255741.0625,2101179.84375,1874865.625,2261236.40625,2201660.78125,1981419.65625,1939366.53125,2189310.90625],
    [1731613786280.1875,1731613866313.0312,1731613946338.3438,1731614026381.4062,1731614106404.0625,1731614186416.4375,1731614266422,1731614346451.4062,1731614426470.875,1731614506480.6875,1731614586494.4688,1731614666517.5625,1731614746530.1875,1731614826533.0312,1731614906570.375,1731614986577.0625,1731615066587.0625,1731615146617.375,1731615226648.0625,1731615306667.5312]
  ],
    [23412447,"0x11bfae7499513cf67670035a03720e9d3a0a934847f07839851047036c6d7fbb",5618,1731615366358,148],
    null,
    1731587797635
]

export default defineComponent({
  name: 'Telemetry',
  components: {
    NodeDetailsCard
  },
  async setup() {
    const route = useRoute();
    const nodeStore = useNodeStore();
    const nodeList = computed(() => nodeStore.nodes);
    const telemetryData = ref<any>(null);
    // const { $telemetry } = useNuxtApp();
    // read chainId from route.query.chainId
    console.debug('route', route.query);
    const chainId = ref(route.params.chainId);
    console.debug('chainId', chainId.value);
    // console.debug('FeedMessage', FeedMessage);
    const _nodes = new Map<string, any>();
    const nodes = computed(() => _nodes);
    const node = ref<any>(null);
    const showDialog = ref(false);
    const search = ref(nodeStore.search);

    var loading = ref(true)
    var refetch = (x: any) => {}

    const headers = ref([
      { title: 'Name', key: 'NodeDetails.NodeName' },
      { title: 'Id', key: 'NetworkId', value: (item) => { return item.NodeDetails.NetworkId } },
      { title: 'Version', key: 'NodeDetails.NodeVersion' },
      // { title: 'Implementation', key: 'NodeDetails.NodeImplementation' },
      // { title: 'IP', key: 'NodeDetails.Address' },
      // { title: 'Host Info', key: 'NodeDetails.NodeHostInfo' },
      // { title: 'Hardware Info', key: 'NodeDetails.NodeHardwareInfo' },
      { title: '#', key: 'action' },
    ]);
    const gridList = computed(() => {
      return Array.from(nodeList.value.entries()).map(e => e[1]);
    });

    const sleepAsync = (ms: number) => {
      return new Promise(resolve => setTimeout(resolve, ms));
    }

    const doRefetch = async () => {
      console.debug('doRefetch');
      await sleepAsync(100);
      refetch();
    }

    onBeforeMount(async () => {
      var { error, loading: cLoading, refetch: cRefetch, onResult } = await useQuery(QUERY_TELEMETRY_NODES, {
        chainId: chainId.value
      })
      refetch = cRefetch
      loading = cLoading

      onResult((result: any) => {
        if (result.loading) {
          console.debug('still loading...');
          return;
        }
        console.debug('result', result.data);
        const nodes = result.data?.nodes || [];
        // console.debug('nodes', nodes);
        nodes?.forEach((node: any) => {
          console.debug('node', node);
          nodeStore.addNode(node);
        });
      });
      
    });

    // watch chainid
    watch(chainId, (newVal, oldVal) => {
      console.debug('chainId changed', newVal, oldVal);
      if (newVal !== oldVal) {
        refetch((data) => {
          console.debug('refetching');
          console.debug('data', data);
        });
      }
    });

    watch(search, (newVal, oldVal) => {
      console.debug('search changed', newVal, oldVal);
      if (newVal !== oldVal) {
        nodeStore.search = newVal;
      }
    });

    const setNode = (inode: any) => {
      console.debug('setNode', inode.NodeDetails.NetworkId);
      const netId = inode.NodeDetails.NetworkId;
      if (nodeList.value.has(netId)) {
        const n = nodeList.value.get(netId);
        node.value = n;
        console.debug('node', n); 
        showDialog.value = true;
      }
    }

    const onModalValue = (value: any) => {
      console.debug('onModalValue', value);
      showDialog.value = false;
    }

    const shortStash = (stash: string) => {
      return stash.substring(0, 6) + '...' + stash.substring(stash.length - 6);
    }

    return {
      chainId,
      telemetryData,
      nodeList,
      headers,
      gridList,
      search,
      node,
      setNode,
      showDialog,
      onModalValue,
      shortStash,
      doRefetch,
    }
  }
});

</script>

<style scoped>
pre {
  background-color: #f5f5f5;
  padding: 10px;
  border-radius: 5px;
}
</style>
