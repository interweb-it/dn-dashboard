<template>
  <v-container>
    <v-toolbar color="background">
      <v-btn icon flat :to="`/${chainId}/cohort/1`">
        <v-icon>mdi-arrow-left</v-icon>
      </v-btn>
      <v-toolbar-title>{{ chainId }} validator {{ node.identity }}</v-toolbar-title>
      <v-spacer></v-spacer>
      <v-toolbar-items>
      </v-toolbar-items>
      <v-btn icon flat :loading="isLoading" @click="reload">
        <v-icon>mdi-refresh</v-icon>
      </v-btn>
      <v-btn>{{ isLoading }}</v-btn>
    </v-toolbar>

    <!-- {{ node }} -->
    <v-card>
      <!-- <v-card-title>{{ node.identity }}</v-card-title> -->
      <v-card-text>
        <v-list>
          <v-list-item>
            <v-list-item-subtitle>DN Identity</v-list-item-subtitle>
            <v-list-item-title>{{ node.identity }}</v-list-item-title>
          </v-list-item>
          <v-list-item>
            <v-list-item-subtitle>Stash</v-list-item-subtitle>
            <v-list-item-title>
              {{ node.stash }}
              <sup>
                <a icon size="small" target="_blank" :href="`https://${chainId}.subscan.io/validator/${node.stash}`">
                  <v-icon>mdi-open-in-new</v-icon>
                </a>
              </sup>
            </v-list-item-title>
          </v-list-item>
          <v-list-item>
            <v-list-item-subtitle>Status (in the program)</v-list-item-subtitle>
            <v-list-item-title>{{ getStatus(node.stash) }}</v-list-item-title>
          </v-list-item>
          <!-- <v-list-item>
            <v-list-item-subtitle>Nominated (by the program)</v-list-item-subtitle>
            <v-list-item-title>{{ isNominated(node.stash) }}</v-list-item-title>
          </v-list-item> -->

          <v-list-item v-show="telemetryError">
            <v-list-item-subtitle text-color="red">Telemetry Error</v-list-item-subtitle>
            <v-list-item-title>{{ telemetryError }}</v-list-item-title>
          </v-list-item>

          <v-list-item v-show="telemetry?.TelemetryName">
            <v-list-item-subtitle>Telemetry Name</v-list-item-subtitle>
            <v-list-item-title>{{ telemetry?.TelemetryName }}</v-list-item-title>
          </v-list-item>
          <v-list-item>
            <v-list-item-subtitle>Node Implementation</v-list-item-subtitle>
            <v-list-item-title>{{ telemetry?.NodeImplementation }}</v-list-item-title>
          </v-list-item>
          <v-list-item>
            <v-list-item-subtitle>Node Version</v-list-item-subtitle>
            <v-list-item-title>{{ telemetry?.NodeVersion }}</v-list-item-title>
          </v-list-item>
          <v-list-item>
            <v-list-item-subtitle>Network Id</v-list-item-subtitle>
            <v-list-item-title>{{ telemetry?.NetworkId }}</v-list-item-title>
          </v-list-item>
          <v-list-item>
            <v-list-item-subtitle>Address</v-list-item-subtitle>
            <v-list-item-title>{{ telemetry?.Address }}</v-list-item-title>
          </v-list-item>
          <!-- <v-list-item>
            <v-list-item-title>Operating System</v-list-item-title>
            <v-list-item-subtitle>{{ telemetry?.OperatingSystem }}</v-list-item-subtitle>
          </v-list-item> -->
          <v-list-item>
            <v-list-item-subtitle>NodeSysInfo</v-list-item-subtitle>
            <!-- <v-list-item-subtitle> -->
            <span text-color="grey">
              <!-- {{ telemetry?.CpuArchitecture }} -->
              CPU: {{ telemetry?.NodeSysInfo?.cpu }},
              Memory: {{ Number(telemetry?.NodeSysInfo?.memory/1024/1024/1024).toFixed(2) }} GB,
              Cores: {{ telemetry?.NodeSysInfo?.core_count }}<br>
              Kernel: {{ telemetry?.NodeSysInfo?.linux_kernel }},
              Distro: {{ telemetry?.NodeSysInfo?.linux_distro }},
              VM: {{ telemetry?.NodeSysInfo?.is_virtual_machine }}
            </span>
            <!-- </v-list-item-subtitle> -->
          </v-list-item>
          <!-- <v-list-item>
            <v-list-item-title>Target Env</v-list-item-title>
            <v-list-item-subtitle>{{ telemetry?.TargetEnv }}</v-list-item-subtitle>
          </v-list-item> -->
          <!-- <v-list-item>
            <v-list-item-title>Node Sys Info</v-list-item-title>
            <v-list-item-subtitle>{{ telemetry?.NodeSysInfo }}</v-list-item-subtitle>
          </v-list-item> -->
          <v-list-item>
            <v-list-item-subtitle>Chain Stats</v-list-item-subtitle>
            <v-list-item-title>
              <!-- {{ telemetry?.ChainStats }} -->
              CPU Hashrate: {{ telemetry?.ChainStats?.cpu_hashrate_score }},
              Memory Memcpy: {{ telemetry?.ChainStats?.memory_memcpy_score }},
              Disk Seq Write: {{ telemetry?.ChainStats?.disk_sequential_write_score }},
              Disk Rand Write: {{ telemetry?.ChainStats?.disk_random_write_score }}
            </v-list-item-title>
          </v-list-item>

        </v-list>

      </v-card-text>
    </v-card>

    <v-card>
      <v-card-title>Rules</v-card-title>
      <v-card-text>
        [DN] <a href="https://nodes.web3.foundation/rules" target="_blank">Rules</a> <br>
        <ul>
          <li>Self bond</li>
          <li>Rewards Target</li>
          <li>Commission</li>
          <li>Telemetry</li>
          <li>Hardware - https://wiki.polkadot.network/docs/maintain-guides-how-to-validate-polkadot#requirements</li>
          <li>IP4 & IP6</li>
          <li>Client Version (24 houra)</li>
          <li>dedicatee machine</li>
          <li>No slashes</li>
          <li>Performance A/A+?</li>
          <li>On Chain Id (email & matrix)</li>
          <li>Payouts</li>
        </ul>

      </v-card-text>
    </v-card>

</v-container>
</template>

<script lang="ts">
// import { NodeDetailsX } from '../../substrate-telemetry/types'
import { ApiPromise } from '@polkadot/api'

import { FeedMessage } from '../substrate-telemetry';
import type { Maybe } from '../substrate-telemetry/helpers';
import type {
  NodeDetails,
  NodeStats,
  NodeIO,
  NodeHardware,
  BlockDetails,
  NodeLocation,
  Timestamp,
  NodeSysInfo,
  ChainStats,
} from '../substrate-telemetry/types';
import {
  AddedNodeMessage,
  RemovedNodeMessage,
} from 'src/substrate-telemetry/feed';

export interface AddedNodeMessageX {
  NodeId: number;
  NodeDetails: NodeDetailsX;
  NodeStats: NodeStats;
  NodeIO: NodeIO;
  NodeHardware: NodeHardware;
  BlockDetails: BlockDetailsX;
  NodeLocation: Maybe<NodeLocation>;
  Timestamp: Maybe<Timestamp>;
}

export interface NodeDetailsX {
  NodeName: string;
  NodeImplementation: string;
  NodeVersion: string;
  Address: Maybe<string>;
  // NetworkId: Maybe<string>,
  NetworkId: string;
  OperatingSystem: string;
  CpuArchitecture: string;
  TargetEnv: string;
  _undefined: undefined;
  NodeSysInfo: NodeSysInfo;
  ChainStats: ChainStats;
}

const QUERY_NODE = gql`
query nodeByName($chainId: String!, $cohortId: Int!, $stash: String!) {
  selected(chainId: $chainId, cohortId: $cohortId) {
    identity
    stash
    status
  }
  # nominators(chainId: $chainId) 
  backups(chainId: $chainId, cohortId: $cohortId) {
    identity
    stash
  }
  nodeByStash(chainId: $chainId, cohortId: $cohortId, stash: $stash) {
    identity
    stash
    status
  }
  validators(chainId: $chainId)
}`
const QUERY_TELEMETRY = gql`
query telemetry($chainId: String!, $name: String!) {
  telemetryByName(chainId: $chainId, name: $name) {
    NodeId
    NodeDetails {
      NodeName
      TelemetryName
      NodeImplementation
      NodeVersion
      Address
      NetworkId
      # OperatingSystem
      NodeSysInfo {
        cpu
        memory
        core_count
        linux_kernel
        linux_distro
        is_virtual_machine
      }
      ChainStats {
        cpu_hashrate_score
        memory_memcpy_score
        disk_sequential_write_score
        disk_random_write_score
      }
    }
  }
}`

export default defineComponent({
  name: 'CohortHome',
  async setup() {
    const route = useRoute()
    const chainId = ref(route.params.chainId)
    const stash = ref(route.params.stash)
    const { $substrate } = useNuxtApp();
    var api: ApiPromise | null;

    const nodeStore = useNodeStore()
    const nodes = ref([])
    var error = ref(null)
    var refetch = ref(() => {})
    // const selected = ref([])
    const node = ref({})
    const nominators = ref([])
    const selected = ref([])
    const backups = ref([])
    const validators = ref([])
    const telemetry = ref({})
    const telemetryError = ref<null|string>(null)
    const loading = ref({
      node: true,
      telemetry: true,
    })

    const isLoading = computed(() => {
      return loading.node || loading.telemetry
    })

    const reload = async () => {
      console.log('reload');
      await refetch()
    }

    onBeforeMount(() => {
      api = $substrate.getApi(chainId.value)
      var { error, loading: cLoading, refetch: cRefetch, onResult } = useQuery(QUERY_NODE, {
        chainId: chainId.value,
        cohortId: 1,
        stash: stash.value
      })
      refetch = cRefetch
      loading.value.node = cLoading

      // telemetry
      var { error, loading: tLoading, refetch: tRefetch, onResult: tonResult } = useQuery(QUERY_TELEMETRY, {
        chainId: chainId.value,
        name: node.value.identity || ''
      });
      loading.value.telemetry = tLoading

      onResult(async (result: any) => {
        if (result.loading) {
          console.log('still loading...');
          return;
        }
        console.log('result', result.data);
        node.value = result.data.nodeByStash;
        selected.value = result.data.selected || [];
        backups.value = result.data.backups || [];
        validators.value = result.data.validators || [];
        // use the name to get telemetry data
        tRefetch({
          chainId: chainId.value,
          name: result.data.nodeByStash.identity
        });
      });

      tonResult((result: any) => {
        if (result.loading) {
          console.log('still loading...');
          return;
        }
        console.log('result', result.data.telemetryByName);
        telemetry.value = result.data?.telemetryByName?.NodeDetails || {};
        telemetryError.value = result.data?.telemetryByName?.NodeDetails 
          ? null 
          : `No telemetry data found - make sure your node has '--name "${node.value.identity}"''`;
      });

      // get Acount details
      getAccount()
      
    });

    // if (error) {
    //   // eslint-disable-next-line no-console
    //   console.error(error)
    // }

    const getAccount = async () => {
      // if (!api) return
      api = await $substrate.getApi(chainId.value)
      const account = await api.query.system.account(stash.value)
      console.log('account', account)
    }

    const getStatus = (stash: string) => {
      console.debug('getStatus', stash);
      let found = selected.value.find(n => n.stash === stash)
      console.debug('found', found);
      if (found) return found.status
      found = backups.value.find(n => n.stash === stash)
      console.debug('found', found);
      if (found) return 'Backup'
      return 'Unknown'
    }

    const isNominated = (stash: string) => {
      return nominators.value.find(n => n.stash === stash)
    }

    return {
      isLoading,
      reload,
      chainId,
      stash,
      node,
      telemetry,
      telemetryError,
      nominators,
      backups,
      validators,
      // data,
      getStatus,
      isNominated,
    }
  }
})
</script>
