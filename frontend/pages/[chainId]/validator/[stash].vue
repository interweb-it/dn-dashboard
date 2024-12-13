<template>
  <client-only>

    <v-toolbar color="background" fixed :elevation="elevation" class="dynamic-toolbar">
      <v-btn icon flat :to="`/${chainId}/cohort/1`">
        <v-icon>mdi-arrow-left</v-icon>
      </v-btn>
      <v-toolbar-title>
        <v-icon size="small"><v-img :src="`/image/${chainId}-logo.svg`" height="22" width="22" rounded></v-img></v-icon> 
        {{ chainId }} validator {{ node.identity }}</v-toolbar-title>
      <v-spacer></v-spacer>
      <v-toolbar-items>
      </v-toolbar-items>
      <v-btn icon flat :loading="isLoading" @click="reload">
        <v-icon>mdi-refresh</v-icon>
      </v-btn>
      <!-- <v-btn>{{ isLoading }}</v-btn> -->
    </v-toolbar>

    <v-container>

      <!-- {{ node }} -->
      <v-card>
        <v-card-title>DN <v-btn flat icon size="small" :loading="loadingN" v-show="loadingN"></v-btn></v-card-title>
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

            <v-list-item>
              <v-card>
                <v-row no-gutters>
                  <v-col class="pa-2 d-flex align-center">
                    <v-icon :color="hasTelemetry ? 'green' : 'red'">mdi-chart-box-outline</v-icon>
                    <span> Telemetry</span>
                  </v-col>
                  <v-col class="ma-2 d-flex align-center">
                    <v-icon :color="rulesBonded ? 'green' : 'red'">mdi-lock-outline</v-icon>
                    <span> Bonded</span>
                  </v-col>
                  <v-col class="ma-2 d-flex align-center">
                    <v-icon :color="rulesRewardDestingation ? 'green' : 'red'">mdi-bank-outline</v-icon>
                    <span> Rewards</span>
                  </v-col>
                  <v-col class="ma-2 d-flex align-center">
                    <v-icon :color="rulesCommission ? 'green' : 'red'">mdi-percent</v-icon>
                    <span> Commission</span>
                  </v-col>
                  <v-col class="ma-2 d-flex align-center">
                    <v-icon :color="rulesIdentity ? 'green' : 'red'">mdi-passport</v-icon>
                    <span> Identity</span>
                  </v-col>
                </v-row>
              </v-card>
              <!-- <v-list-item-subtitle text-color="red">Has Telemetry</v-list-item-subtitle> -->
              <!-- <v-list-item-title>{{ telemetryError }}</v-list-item-title> -->
            </v-list-item>
          </v-list>
        </v-card-text>
      </v-card>

      <v-card>
        <v-card-title>On Chain {{ loadingC }}</v-card-title>
        <v-card-text>
          <v-list>
            <v-list-item>
              <v-list-item-subtitle>Account</v-list-item-subtitle>
              <v-list-item-title>{{ toCoin(account.data?.free || 0) }}</v-list-item-title>
            </v-list-item>
            <v-list-item>
              <v-list-item-subtitle>Bonded</v-list-item-subtitle>
              <v-list-item-title>
                <p v-for="lock in locks">
                  {{ lock.id }}: {{ toCoin(lock.amount) }}
                </p>
              </v-list-item-title>
            </v-list-item>
            <v-list-item>
              <v-list-item-subtitle>Reward Destination</v-list-item-subtitle>
              <v-list-item-title>{{ rewardDestination }}</v-list-item-title>
            </v-list-item>
            <v-list-item>
              <v-list-item-subtitle>Commission</v-list-item-subtitle>
              <v-list-item-title>{{ (commission.commission || 0) / 10_000_000 }}%</v-list-item-title>
            </v-list-item>
            <v-list-item>
              <v-list-item-subtitle>Identity</v-list-item-subtitle>
              <!-- <v-list-item-title>{{ identity }}</v-list-item-title> -->
              <v-list-item-title>
                <p>Display: {{ identity?.info?.display }}{{ identity?.subId ? `/${identity?.subId}` : '' }}</p>
                <p>Email: {{ identity?.info?.email }}</p>
                <p v-show="identity?.info?.discord">Discord: {{ identity?.info?.discord }}</p>
                <p v-show="identity?.info?.github">Github: {{ identity?.info?.github }}</p>
                <p v-show="identity?.info?.matrix">Matrix: {{ identity?.info?.matrix }}</p>
                <p v-show="identity?.info?.twitter">Twitter: {{ identity?.info?.twitter }}</p>
                <p v-show="identity?.info?.web">Web: {{ identity?.info?.web }}</p>
              </v-list-item-title>
            </v-list-item>
          </v-list>
        </v-card-text>
      </v-card>

      <v-card>
        <v-card-title>Performance ( c/o <a :href="`https://apps.turboflakes.io/?chain=${chainId}#/validator/${node.stash}?mode=history`" target="_blank">
          turboflakes.io
          <sup><v-icon size="v-small">mdi-open-in-new</v-icon></sup>
        </a> )
        <v-btn icon flat size="small" @click="refetchP()"><v-icon>mdi-refresh</v-icon></v-btn>
        </v-card-title>
        <v-card-text>
          <!-- {{ performance }} -->
          <v-container>
            <v-row>
              <v-col>
                  <p>Grade: {{ performance.grade }}</p>
              </v-col>
              <v-col>
                <p>Authority: {{ (performance.authority_inclusion * 100).toLocaleString(undefined, {maximumFractionDigits: 2, minimumFractionDigits: 2}) }}%</p>
              </v-col>
              <v-col>
                <p>Para: {{ (performance.para_authority_inclusion * 100).toLocaleString(undefined, {maximumFractionDigits: 2, minimumFractionDigits: 2}) }}%</p>
              </v-col>
            </v-row>
          </v-container>
        </v-card-text>
      </v-card>

      <v-card>
        <v-card-title>Exposure
          <v-btn icon flat @click="getExposure" :loading="loadingE">
            <v-icon>mdi-refresh</v-icon>
          </v-btn>
        </v-card-title>
        <v-card-text>
          <!-- {{ exposure }} -->
          <v-container fluid class="ma-0 pa-0">
            <v-row no-gutters>
              <v-col>
                Total: {{ exposure.total.toLocaleString(undefined, {maximumFractionDigits: 2, minimumFractionDigits: 2}) }}
              </v-col>
              <v-col>
                Own: {{ exposure.own.toLocaleString(undefined, {maximumFractionDigits: 2, minimumFractionDigits: 2}) }}
              </v-col>
              <v-col>
                Others: {{ exposure.others.reduce((sum, m) => sum + m.value, 0).toLocaleString(undefined, {maximumFractionDigits: 2, minimumFractionDigits: 2}) }}
              </v-col>
            </v-row>
          </v-container>

          <v-data-table :items="exposure.others" :headers="[{ key: 'who', title: 'Address'}, {key: 'value', title: 'Amount', align: 'end'}]">
            <template v-slot:item.who="{ item }">
              <a :href="`https://${chainId}.subscan.io/nominator/${item.who}`" target="_blank">{{ shortStash(item.who) }}</a>              
              <v-icon color="purple" v-if="dnNominators.includes(item.who)">mdi-hand</v-icon>
            </template>
            <template v-slot:item.value="{ item }">
              {{ item.value.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2}) }}
            </template>
          </v-data-table>
        </v-card-text>
      </v-card>

      <!-- {{ dnNominators }} -->

      <v-card>
        <!-- <v-card-title>Nominators {{ nominatorStoreLoading }}</v-card-title> -->
        <v-toolbar fluid color="background" density="compact">
          <v-toolbar-title>Nominators</v-toolbar-title>
          <v-btn icon flat @click="getNominators" :loading="loadingN">
            <v-icon>mdi-refresh</v-icon>
          </v-btn>
          <v-spacer></v-spacer>
          <v-btn icon flat @click="getAllNominators" :loading="loadingAN">
            <v-icon>mdi-flash-alert-outline</v-icon>
          </v-btn>
        </v-toolbar>
        <v-card-text>
          <!-- <p v-show="loadingN" color="red">Scanning chain nominators, building nominator list... {{ page }} of {{ pages }}</p> -->
          <!-- {{ nominators }} -->
          <v-container fluid class="ma-0 pa-0">
            <v-row no-gutters>
              <v-col>
                Total: {{ totalNominations.toLocaleString(undefined, {maximumFractionDigits: 2, minimumFractionDigits: 2}) }}
              </v-col>
              <v-col>
                DN: {{ dnNominations.toLocaleString(undefined, {maximumFractionDigits: 2, minimumFractionDigits: 2}) }}
              </v-col>
              <v-col>
                Non-DN: {{ nonDnNominations.toLocaleString(undefined, {maximumFractionDigits: 2, minimumFractionDigits: 2}) }}
              </v-col>
            </v-row>
          </v-container>
          <!-- {{ dnNominators }} -->
          <v-data-table :items="nominators"  :loading="loadingN"
            :headers="[{key:'address',title:'Address' }, {key: 'balance', title: 'Balance', align:'end'}]"
            :sort-by="[{ key: 'balance', order: 'desc' }]">
            <template v-slot:loading>
              <v-skeleton-loader type="table-row@5"></v-skeleton-loader>
            </template>
            <template v-slot:item.address="{ item }">
              <a :href="`https://${chainId}.subscan.io/nominator/${item.address}`" target="_blank">{{ shortStash(item.address) }}</a>              
              <v-icon color="red" v-if="exposure.others.map(m => m.who).includes(item.address)">mdi-fire</v-icon>
              <v-icon color="purple" v-if="dnNominators.includes(item.address)">mdi-hand</v-icon>
              <!-- <a :href="`/${chainId}/validator/${item.address}`">{{ item.address }}</a> -->
            </template>
            <template v-slot:item.balance="{ item }">
              {{ item.balance.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2}) }}
            </template>
          </v-data-table>
        </v-card-text>
      </v-card>

      <v-card>
        <v-card-title>Telemetry
          <v-btn icon flat @click="refetchT()" :loading="loadingT">
            <v-icon>mdi-refresh</v-icon>
          </v-btn>
        </v-card-title>
        <v-card-text>
          <v-list>
            <span v-show="!hasTelemetry">
              <v-list-item v-show="telemetryError">
                <v-list-item-subtitle text-color="red">Telemetry Error</v-list-item-subtitle>
                <v-list-item-title>
                  <!-- {{ telemetryError }}<br> -->
                  <p>No telemetry found for "{{ node.identity }}"</p>
                  <p>If the `DN identity` does not match `telemetry name``.</p>
                  <p>
                    <a href="https://github.com/metaspan/dn-dashboard/blob/main/backend/config/telemetryNameMap.json" target="_blank">
                      Submit a PR to add your details here...
                    </a>
                  </p>
                </v-list-item-title>
              </v-list-item>
            </span>

            <span v-show="hasTelemetry">
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
            <!-- <v-list-item>
              <v-list-item-subtitle>Address</v-list-item-subtitle>
              <v-list-item-title>{{ telemetry?.Address }}</v-list-item-title>
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

            </span>
          </v-list>
        </v-card-text>
      </v-card>

      <v-card>
        <v-card-title>Rules</v-card-title>
        <v-card-text>
          [DN] <a href="https://nodes.web3.foundation/rules" target="_blank">Rules</a> <br>
          <ul>
            <li>Self bond <v-icon>mdi-check</v-icon></li>
            <li>Rewards Target <v-icon>mdi-check</v-icon></li>
            <li>Commission <v-icon>mdi-check</v-icon></li>
            <li>Telemetry <v-icon>mdi-check</v-icon></li>
            <li>On Chain Id (email & matrix) <v-icon>mdi-check</v-icon></li>
            <li>Payouts</li>
            <li>Hardware -  <a href="https://wiki.polkadot.network/docs/maintain-guides-how-to-validate-polkadot#requirements" target="_blank">requirements</a></li>
            <li>IP4 & IP6</li>
            <li>Client Version - from telemetry (24 hours)</li>
            <li>dedicated machine</li>
            <li>No slashes</li>
            <li>Performance A/A+? - check <a :href="`https://apps.turboflakes.io/?chain=${chainId}#/validator/${node.stash}?mode=history`" target="_blank">
              apps.turboflakes.io</a></li>
          </ul>

        </v-card-text>
      </v-card>

      </v-container>
  </client-only>

</template>

<script lang="ts">
// import { NodeDetailsX } from '../../substrate-telemetry/types'
import { ApiPromise } from '@polkadot/api'
import { hexToString } from '@polkadot/util'

// import { FeedMessage } from '../substrate-telemetry';
import type { Maybe } from '~/utils/substrate-telemetry/helpers';
import type {
  BlockNumber,
  NodeDetails,
  NodeStats,
  NodeIO,
  NodeHardware,
  BlockDetails,
  NodeLocation,
  Timestamp,
  NodeSysInfo,
  ChainStats,
} from '~/utils/substrate-telemetry/types';
// import {
//   AddedNodeMessage,
//   RemovedNodeMessage,
// } from '../../substrate-telemetry/feed';
import type { BlockDetailsX } from '~/utils/types';
import { shortStash } from '~/utils/helpers';

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
  nominators(chainId: $chainId, cohortId: $cohortId) 
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
    # IPGeo {
    #   query
    #   lat
    #   lon
    #   city
    #   country
    # }
    NodeDetails {
      NodeName
      TelemetryName
      NodeImplementation
      NodeVersion
      # Address
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
const QUERY_PERFORMANCE = gql`
query performance($chainId: String!, $address: String!) {
  performance(chainId: $chainId, address: $address) {
    grade
    authority_inclusion
    para_authority_inclusion
  }
}`

const decimals: Record<string, number> = {
  polkadot: 10,
  kusama: 12,
}

const tokens = {
  polkadot: 'DOT',
  kusama: 'KSM',
}

const rules: Record<string, Record<string, number|string>> = {
  polkadot: {
    commission: 5,
    selfBond: 7500,
    rewardDestination: 'Staked',
  },
  kusama: {
    commission: 15,
    selfBond: 125,
    rewardDestination: 'Staked',
  },
}

interface INode {
  identity: string;
  stash: string;
  status: string;
}

export default defineComponent({
  name: 'CohortHome',
  async setup() {
    const route = useRoute()
    const chainId = ref(route.params.chainId.toString())
    const stash = ref(route.params.stash)
    const { $substrate } = useNuxtApp();
    var api: ApiPromise | null;
    var apip: ApiPromise | null;

    const nodeStore = useNodeStore()
    const nominatorStore = useNominatorStore()
    const stakingEntries = computed(() => nominatorStore.stakingEntries)
    const nominatorStoreLoading = computed(() => nominatorStore.loading)
    const nodes = ref([])
    var error = ref(null)
    // const selected = ref([])
    const node = ref<INode>({ identity: '', stash: '', status: '' })
    const selected = ref([])
    const backups = ref([])
    const dnNominators = ref<string[]>([])
    const validators = ref([])
    const telemetry = ref({})
    const telemetryError = ref<null|string>(null)

    const account = ref({})
    const locks = ref([])
    const rewardDestination = ref({})
    const commission = ref<Record<string, any>>({ commission: 0, blocked: false })
    const identity = ref<Record<string, any>>({})

    const performance = ref<Record<string, any>>({})

    const elevation = ref(0)
    var scrollHandler: any = null;

    var refetchC = () => {}
    var refetchT = ref(() => {})
    var refetchP = ref(() => {})

    onBeforeUnmount(() => {
      if(scrollHandler) scrollHandler();
    })

    var loadingC = ref<any>()
    var loadingT = ref<any>()
    var loadingP = ref<any>()
    var loadingE = ref<boolean>(false)
    var loadingN = ref<boolean>(false)
    var loadingAN = computed(() => nominatorStore.loading)

    const isLoading = computed(() => {
      return loadingC.value || loadingT.value || loadingE.value || loadingN.value || loadingP.value
    })

    const hasTelemetry = computed(() => {
      return telemetry.value && Object.keys(telemetry.value).length > 0
    })

    const rulesBonded = computed(() => {
      let _bonded: Number = 0;
      locks.value.forEach((l: Record<string, any>) => {
        // console.debug('lock', l.id, l.amount);
        if (l.id === 'staking') {
          // console.debug('staking lock', l.amount);
          _bonded = Number(l.amount) / Math.pow(10, decimals[chainId.value])
        } else {
          console.debug('not staking lock', `|${l.id}|`);
        }
      })
      console.debug('_bonded', _bonded, locks.value);
      // const _bondedCoin = _bonded ? Number(_bonded.amount) / Math.pow(10, decimals[chainId.value]) : 0
      // console.debug('rulesBonded', _bonded, rules.selfBond[chainId.value]);
      return _bonded >= rules[chainId.value].selfBond
    })

    const rulesRewardDestingation = computed(() => {
      // console.debug('rewardDestination', rewardDestination.value, rules[chainId.value].rewardDestination);
      return rewardDestination.value === rules[chainId.value].rewardDestination
    })

    const rulesCommission = computed(() => {
      const _commission = (commission.value.commission || 0) / 10_000_000
      // console.debug('rulesCommission', commission.value.commission, _commission, rules[chainId.value].commission);
      return _commission <= Number(rules[chainId.value].commission)
    })

    const rulesIdentity = computed(() => {
      // identity.value.info should have email and matrix
      return identity.value?.info?.email && identity.value?.info?.matrix
    })

    const reload = async () => {
      console.log('reload');
      await refetchC()
      // await refetchT() // refetchC will call the telemetry
      await getAccount()
      await getExposure()
      // await getNominators()
      await refetchP.value()
    }

    // const getPerformance = async () => {
    //   await fetch(`https://${chainId.value}-onet-api.turboflakes.io/api/v1/validators/${stash.value}/grade`)
    //     .then(res => res.json())
    //     .then(data => {
    //       console.log('turboflakes', data)
    //       performance.value = data
    //     })
    // }

    onBeforeMount(async () => {
      api = await $substrate.getApi(chainId.value)
      apip = await $substrate.getApip(chainId.value)
      scrollHandler = handleScroll((scrollY) => {
        elevation.value = scrollY > 0 ? 4 : 0;
      })
    });

    onMounted(async () => {
      var { error, loading: cLoading, refetch: cRefetch, onResult } = useQuery(QUERY_NODE, {
        chainId: chainId.value,
        cohortId: 1,
        stash: stash.value
      })
      refetchC = cRefetch
      loadingC = cLoading

      onResult(async (result: any) => {
        if (result.loading) {
          console.log('still loading...');
          return;
        }
        console.log('main result', result.data);
        node.value = result.data.nodeByStash;
        selected.value = result.data.selected || [];
        backups.value = result.data.backups || [];
        dnNominators.value = result.data.nominators || [];
        validators.value = result.data.validators || [];
        // use the name to get telemetry data
        tRefetch({
          chainId: chainId.value,
          name: result.data.nodeByStash.identity
        });
      });

      // telemetry
      var { error, loading: tLoading, refetch: tRefetch, onResult: tonResult } = useQuery(QUERY_TELEMETRY, {
        chainId: chainId.value,
        name: node.value.identity || ''
      });
      refetchT.value = tRefetch
      loadingT = tLoading

      tonResult((result: any) => {
        if (result.loading) {
          console.log('still loading...');
          return;
        }
        console.log('telemetry result', result.data.telemetryByName);
        telemetry.value = result.data?.telemetryByName?.NodeDetails || {};
        telemetryError.value = result.data?.telemetryByName?.NodeDetails 
          ? null 
          : `No telemetry data found - does your node have '--name "${node.value.identity}"''`;
      });

      // performance
      var { error, loading: pLoading, refetch: pRefetch, onResult: ponResult } = useQuery(QUERY_PERFORMANCE, {
        chainId: chainId.value,
        address: stash.value || ''
      });
      refetchP.value = pRefetch
      loadingP = pLoading

      ponResult((result: any) => {
        if (result.loading) {
          console.log('still loading...');
          return;
        }
        console.log('performance result', result.data);
        performance.value = result.data?.performance || {};
      });
      await getAccount()
      await getExposure()
      await getNominators()
    });

    // if (error) {
    //   // eslint-disable-next-line no-console
    //   console.error(error)
    // }

    const getAccount = async () => {
      console.debug('getAccount', stash.value);
      if (!api) return
      const _account = await api?.query.system.account(stash.value)
      console.log('account', account)
      account.value = _account ? _account : {}

      const _locks = await api?.query.balances.locks(stash.value);
      const _locksStr: any = _locks?.toJSON() as any[] || []
      for (const lock of _locksStr) {
        console.debug('lock amount', lock.amount)
        lock.id = hexToString(lock.id).trim()
        lock.amount = BigInt(lock.amount)
      }
      locks.value = _locksStr
      console.debug('locks', locks.value)

      const _rewardDestination = await api?.query.staking.payee(stash.value)
      rewardDestination.value = _rewardDestination?.toHuman() || 'Unknown'

      const _commission = await api?.query.staking.validators(stash.value)
      commission.value = _commission?.toJSON() as any || { commission: null, blocked: null }

      // get Identity
      let _identity = await apip?.query.identity.identityOf(stash.value)
      // console.debug('identity', _identity)
      if(_identity?.toJSON()) {
        identity.value = parseIdentity(_identity)
        // console.debug('parsed identity', identity.value)
      } else {
        const _super = await apip?.query.identity.superOf(stash.value)
        if (_super) {
          // console.debug('super', _super?.toJSON())
          const subId = hexToString(_super.toJSON()[1].raw)
          if(_super) {
            _identity = await apip?.query.identity.identityOf(_super.toJSON()[0])
            if(_identity) {
              identity.value = { subId, ...parseIdentity(_identity) }
            }
          }
        }
        // console.debug('identity', _identity.toJSON())
        // console.debug('identity', parseIdentity(_identity))
      }

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

    const toCoin = (value: BigInt) => {
      // if value is string, convert to number
      if (typeof value === 'string') {
        value = value.replace(',', '')
        value = Number(value)
      }
      // console.debug('toCoin', value, chainId.value);
      const ret = Number(value) / Math.pow(10, decimals[chainId.value])
      return ret.toFixed(2) + ' ' + tokens[chainId.value]
    }

    const parseIdentity = (id: any) => {
      if(!id) return null
      try {
        let idj = (id.toJSON())
        console.debug('idj', idj)
        if (idj && idj[0]) {
          idj = idj[0]
          const res = {} as any
          res.deposit = idj.deposit
          if(idj?.info) res.info = {
            discord: idj.info?.discord?.raw ? hexToString(idj.info.discord.raw) : '',
            display: idj.info?.display?.raw ? hexToString(idj.info.display.raw) : '',
            email: idj.info?.email?.raw ? hexToString(idj.info.email.raw) : '',
            github: idj.info?.github?.raw ? hexToString(idj.info.github.raw) : '',
            image: idj.info?.image?.raw ? hexToString(idj.info.image.raw) : '',
            legal: idj.info?.legal?.raw ? hexToString(idj.info.legal.raw) : '',
            matrix: idj.info?.matrix?.raw ? hexToString(idj.info.matrix.raw) : '',
            pgpFingerprint: idj.info?.pgpFingerprint?.raw ? hexToString(idj.info.pgpFingerprint.raw) : '',
            // riot: idj.info.riot?.raw ? hexToString(idj.info.riot.raw) : '',
            twitter: idj.info?.twitter?.raw ? hexToString(idj.info.twitter.raw) : '',
            web: idj.info?.web?.raw ? hexToString(idj.info.web.raw) : ''
          }
          res.judgements = idj.judgements
          return res
        }
      } catch (e) {
        console.warn('parseIdentity', e)
        return null
      }
    }

    // get exposures
    interface IExposureItem {
      who: string;
      value: number;
    }
    interface IExposure {
      total: number;
      own: number;
      pageCount: number;
      others: IExposureItem[]
    }
    const exposure = ref<IExposure>({
      total: 0,
      own: 0,
      pageCount: 0,
      others: []
    })
    const getExposure = async () => {
      console.debug('getExposure', stash.value);
      if (!api) return
      loadingE.value = true
      const era: any = (await api.query.staking.activeEra()).toJSON();
      const denom = BigInt(Math.pow(10, decimals[chainId.value]));

      var _exposure: IExposure = (await api.query.staking.erasStakersOverview(era.index, stash.value)).toJSON() as any;
      if (!_exposure) return
      _exposure.total = Number(BigInt(_exposure.total) / denom);
      _exposure.own = Number(BigInt(_exposure.own) / denom);
      console.log('exposure:', _exposure);

      // validator other exposures
      _exposure.others = [];
      for (let j = 0; j < _exposure.pageCount; j++) {
        const exp: IExposure = (await api.query.staking.erasStakersPaged(era.index, stash.value, j)).toJSON() as any;
        exp.others = exp.others.map((o) => {
          return {
            who: o.who,
            value: Number(BigInt(o.value) / denom),
          };
        })
        _exposure.others.push(...exp.others || []);
      }
      exposure.value = _exposure;
      loadingE.value = false
    }

    // get nominations
    interface INominator {
      address: string;
      balance: number;
      identity?: string;
      identityInfo?: any;
      locks?: any[];
      pooled?: any;
      nominations?: any;
    }

    // const nominators = computed(() => nominatorStore.nominators)
    //const nominatorList = computed(() => Array.from(nominators.value.values()))
    const totalNominations = computed(() => {
      return nominators.value.reduce((sum, n) => sum + n.balance, 0)
      // return 0
    })
    const dnNominations = computed(() => {
      return nominators.value.filter(n => dnNominators.value.includes(n.address)).reduce((sum, n) => sum + n.balance, 0)
      // return 0
    })
    const nonDnNominations = computed(() => {
      return nominators.value.filter(n => !dnNominators.value.includes(n.address)).reduce((sum, n) => sum + n.balance, 0)
      // return 0
    })

    const getAllNominators = async () => {
      console.debug('get stakingEntries');
      if(!api) return
      nominatorStore.loading = true
      const stakingEntries = await api.query.staking.nominators.entries()
      const entries = stakingEntries.map(([key, nominations]) => {
        // console.debug('key', key.toString(), value);
        return [key, nominations.toJSON()]
        // nominatorStore.setStakingEntries(key.toString(), value)
      })
      console.debug('entries', entries.length);
      nominatorStore.setStakingEntries(entries)
      nominatorStore.loading = false;
    }

    const nominators = ref<INominator[]>([])
    const page = ref(0)
    const pages = ref(0)
    const getNominators = async () => {
      if(!api) return
      if(nominatorStore.stakingEntries.length === 0 ) {
        await getAllNominators();
      }

      loadingN.value = true
      console.debug('getNominators', stash.value);
      nominators.value = []
      page.value = 0
      // const stakingEntries = await api.query.staking.nominators.entries()
      // console.debug('stakingEntries', stakingEntries)
      pages.value = stakingEntries.value.length

      for (const [key, nominations] of stakingEntries.value as any) {
        const nominatorAddress = key.args[0].toString();
        page.value += 1

        // const identity = parseIdentity(await idApi.query.identity.identityOf(nominatorAddress));
        // const identityInfo = identity ? identity.info : {};

        // targets
        const targets = nominations; // .toJSON() as any;
        // console.debug('targets', targets)

        if (targets.targets?.includes(stash.value)) {
          // Fetch account balance for the nominator
          const accountData = (await api.query.system.account(nominatorAddress)).toJSON() as any;
          // console.debug('accountData', accountData)
          const balance = Number(BigInt(accountData.data.free)) / 10 ** decimals[chainId.value]; // Available balance
          // pooled
          // const pooled = api.query.nominationPools.poolMembers(nominatorAddress);
          // console.debug('nominator', nominatorAddress, balance, targets);
          nominators.value.push({
            address: nominatorAddress,
            balance,
            // identity: identity ? identity.display : nominatorAddress,
            // identityInfo,
            // locks,
            // pooled,
            // nominations: nominations.toJSON(),
          });
        } else {
          continue;
        }

      }

    //   // const nominatedValidators = nominations.unwrap().targets;
    //   // nominators.value = _nominators.toJSON()
      loadingN.value = false
    }

    return {
      isLoading,
      loadingC,
      loadingT,
      loadingE,
      loadingN,
      loadingAN,
      nominatorStoreLoading,
      elevation,
      reload,
      chainId,
      stash,

      account,
      locks,
      rewardDestination,
      commission,
      identity,
      rulesBonded,
      rulesRewardDestingation,
      rulesCommission,
      rulesIdentity,

      node,
      dnNominators,
      hasTelemetry,
      telemetry,
      telemetryError,
      refetchT,
      nominators,
      //backups,
      validators,
      exposure,
      // page,
      // pages,

      performance,
      refetchP,

      // data,
      totalNominations,
      dnNominations,
      nonDnNominations,
      getTelemetry: refetchT,
      getStatus,
      getExposure,
      getNominators,
      getAllNominators,
      // getPerformance,
      isNominated,
      toCoin,
      shortStash,
    }
  }
})
</script>

<style scoped>
/* a link no decoration */
a {
  text-decoration: none;
  color: inherit;
}
.dynamic-toolbar {
  position: sticky;
  top: 0;
  z-index: 10;
  background-color: white;
  transition: box-shadow 0.3s;
}
</style>
