<template>
  <client-only>

    <v-toolbar color="background" fixed :elevation="elevation" class="dynamic-toolbar"
      style="position: fixed; padding-top: 25px">
      <v-btn icon flat :to="`/${chainId}/cohort/1`">
        <v-icon>mdi-arrow-left</v-icon>
      </v-btn>
      <v-toolbar-title>
        <v-icon size="small"><v-img src="/image/logo-black.png" height="32" width="32"></v-img></v-icon>&nbsp;
        <v-icon size="small"><v-img :src="`/image/${chainId}-logo.svg`" height="22" width="22" rounded></v-img></v-icon> 
        <span class="d-none d-sm-inline">{{ chainId }} validator</span>
        {{ node.identity }}
      </v-toolbar-title>
      <!-- <v-spacer class="d-none d-sm-inline"></v-spacer> -->
      <v-btn icon flat :loading="isLoading" @click="reload">
        <v-icon>mdi-refresh</v-icon>
      </v-btn>
    </v-toolbar>

    <v-container style="padding-top: 75px;">

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
                  <v-col class="ma-1 d-flex align-center">
                    <v-btn flat border class="text-none">
                      <v-icon :color="hasTelemetry ? 'green' : 'red'">mdi-chart-box-outline</v-icon>
                      <span> Telemetry</span>
                  </v-btn>
                </v-col>
                  <v-col class="ma-1 d-flex align-center">
                    <v-btn flat border class="text-none">
                      <v-icon :color="rulesBonded ? 'green' : 'red'">mdi-lock-outline</v-icon>
                      <span> Bonded</span>
                    </v-btn>
                  </v-col>
                  <v-col class="ma-1 d-flex align-center">
                    <v-btn flat border class="text-none">
                      <v-icon :color="rulesRewardDestingation ? 'green' : 'red'">mdi-bank-outline</v-icon>
                      <span> Rewards</span>
                    </v-btn>
                  </v-col>
                  <v-col class="ma-1 d-flex align-center">
                    <v-btn flat border class="text-none">
                      <v-icon :color="rulesCommission ? 'green' : 'red'">mdi-percent</v-icon>
                      <span> Commission</span>
                    </v-btn>
                  </v-col>
                  <v-col class="ma-1 d-flex align-center">
                    <v-btn flat border class="text-none">
                      <v-icon :color="rulesIdentity ? 'green' : 'red'">mdi-passport</v-icon>
                      <span> Identity</span>
                    </v-btn>
                  </v-col>
                  <v-col class="ma-1 d-flex align-center">
                    <v-btn flat border class="text-none">
                      <v-icon :color="rulesPerformance ? 'green' : 'red'">mdi-cogs</v-icon>
                      <span> Performance</span>
                    </v-btn>
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

      <PerformanceCard
        :chain-id="chainId"
        :stash="node.stash"
        :performance="performance"
        @refresh="refetchP"></PerformanceCard>

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
          <v-btn icon flat @click="getAllNominators" :loading="substrateStoreLoading">
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
          <v-data-table :items="nominators"  :loading="loadingN || loadingAN"
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

    </v-container>
    <Footer :chain-id="chainId" :cohort-id="1"></Footer>
  </client-only>

</template>

<script lang="ts">
import PerformanceChart from '~/components/PerformanceChart.vue';
// import { NodeDetailsX } from '../../substrate-telemetry/types'
import { ApiPromise } from '@polkadot/api'
import { hexToString } from '@polkadot/util'
import PerformanceCard from '~/components/PerformanceCard.vue';

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

import type { ISelectedNode, IBackupNode } from '~/utils/types';

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
  # validators(chainId: $chainId) {
  #   address
  # }
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
query performance($chainId: String!, $address: String!, $number_sessions: Int) {
  performance(chainId: $chainId, address: $address, number_sessions: $number_sessions) {
    grade
    authority_inclusion
    para_authority_inclusion
    sessions_data {
      session
      is_auth
      is_para
      auth {
        aix
        sp
        ep
        ab
      }
      para {
        core
        group
        peers
        pid
        pix
      }
      para_summary {
        pt
        ca
        ab
        ev
        iv
        mv
      }
    }
  }
}`

const decimals: Record<string, number> = {
  polkadot: 10,
  kusama: 12,
}

const tokens: Record<string, string> = {
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
  components: {
    // PerformanceChart,
    PerformanceCard,
  },
  async setup() {
    const route = useRoute()
    const chainId = ref(route.params.chainId.toString())
    const stash = ref(route.params.stash)
    const substrateStore = useSubstrateStore()
    const stakingEntries = computed(() => substrateStore.stakingEntries)
    const substrateStoreLoading = computed(() => substrateStore.loading)
    const nominatorStore = useNominatorStore()
    const { $substrate } = useNuxtApp();
    var api: ApiPromise | null;
    var apip: ApiPromise | null;

    const apiConnected = computed(() => substrateStore.apiConnected)

    const nodes = ref([])
    var error = ref(null)
    // const selected = ref([])
    const node = ref<INode>({ identity: '', stash: '', status: '' })
    const selected = ref<ISelectedNode[]>([])
    const backups = ref<IBackupNode[]>([])
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

    const getApi = async () => {
      if (!api || !apiConnected.value) {
        console.debug('getApi', chainId.value);
        api = await $substrate.getApi(chainId.value)
        apip = await $substrate.getApip(chainId.value)
      }
    }

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

    const rulesPerformance = computed(() => {
      // if the validator is active it should achieve A or A+
      var ret = true;
      for (let i = 0; i < performance.value.sessions_data?.length; i++) {
        const session: ISession = performance.value.sessions_data[i];
        if (!session.is_para) continue;
        // const grade = performanceGrade(session);
        if (session.grade !== 'A' && session.grade !== 'A+') {
          //console.debug('session', session.session, 'grade', session);
          ret = false;
        }
      }
      console.debug('rulesPerformance', ret);
      return ret;
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

    // rules: https://github.com/turboflakes/one-t/blob/main/LEGENDS.md#val-performance-report-legend
    const ex_session = {
          "session": 44194,
          "is_auth": true,
          "is_para": true,
          "auth": {
              "aix": 936,
              "sp": 2680,
              "ep": 6080,
              "ab": [
                  26183085,
                  26183107
              ],
              "__typename": "AuthData"
          },
          "para": {
              "core": null,
              "group": 32,
              "peers": [
                  152,
                  608,
                  26,
                  357
              ],
              "pid": null,
              "pix": 162,
              "__typename": "ParaData"
          },
          "para_summary": {
              "pt": 3360,
              "ca": 168,
              "ab": 0,
              "ev": 104,
              "iv": 62,
              "mv": 0,
              "__typename": "ParaSummary"
          },
          "__typename": "SessionData"
      }
    /**
     *  A+ = BVR > 99%
      ‣ A = BVR > 95%
      ‣ B+ = BVR > 90%
      ‣ B = BVR > 80%
      ‣ C+ = BVR > 70%
      ‣ C = BVR > 60%
      ‣ D+ = BVR > 50%
      ‣ D = BVR > 40%
      ‣ F = BVR <= 40%
     */
    interface ISession {
      session: number;
      is_auth: boolean;
      is_para: boolean;
      grade: string; // will be populates on client
      auth: {
        aix: number;  // authority inclusion?
        sp: number;   //
        ep: number;
        ab: number[]; // authored blocks
      };
      para: {
        core: number;
        group: number;
        peers: number[];
        pid: number;
        pix: number;
      };
      para_summary: {
        pt: number; // points
        ca: number;
        ab: number;
        ev: number; // explicit votes
        iv: number; // implicit votes
        mv: number; // missed votes
      };
    }
    const performanceGrade = (session: ISession): string => {
      if(!session.is_auth) return ' '
      if(!session.is_para) return ' '
      if(!session.para_summary) return ' '
      // console.debug('session', session);
      const mvr = session.para_summary.mv / (session.para_summary.ev + session.para_summary.iv + session.para_summary.mv);
      // console.debug('mvr', mvr);
      const bvr = 1 - mvr;
      switch (true) {
        case bvr > 0.99: return 'A+'
        case bvr > 0.95: return 'A'
        case bvr > 0.90: return 'B+'
        case bvr > 0.80: return 'B'
        case bvr > 0.70: return 'C+'
        case bvr > 0.60: return 'C'
        case bvr > 0.50: return 'D+'
        case bvr > 0.40: return 'D'
        default: return 'F'
      }
    }

    const init = ref(false)

    onBeforeMount(async () => {
      init.value = true
      await getApi();
      // api = await $substrate.getApi(chainId.value)
      // apip = await $substrate.getApip(chainId.value)
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
        address: stash.value || '',
        number_sessions: 36
      });
      refetchP.value = pRefetch
      loadingP = pLoading

      ponResult((result: any) => handlePerformanceResult(result));

      await getAccount()
      await getExposure()
      await getNominators()
      init.value = false
    });

    // if (error) {
    //   // eslint-disable-next-line no-console
    //   console.error(error)
    // }

    const handlePerformanceResult = (result: any) => {
      if (result.loading) {
        console.log('still loading...');
        return;
      }
      console.log('performance result', result.data);
      var res = result.data?.performance || {};
      // const _sessions_data: any[] = []
      // for (let i = 0; i < res.sessions_data.length; i++) {
      //   const sd = res.sessions_data[i];
      //   _sessions_data.push({ ...sd, grade: performanceGrade(sd) })
      // }
      const _sessions_data = res.sessions_data.map((s: ISession) => {
        return { ...s, is_para: s.para_summary ? true : false, grade: performanceGrade(s) }
        // s.grade = performanceGrade(s)
      })
      performance.value = {...res, sessions_data: _sessions_data};
      console.debug('performance', performance.value);
      // performance.value = res;
    }

    const getAccount = async () => {
      console.debug('getAccount', stash.value);
      await getApi();
      // if (!api) {
      //   console.warn('api not connected');
      //   api = await $substrate.getApi(chainId.value)
      //   // return
      // }
      const _account = await api?.query.system.account(stash.value)
      console.log('account', stash.value, _account?.toString())
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
      // console.debug('getStatus', stash);
      let foundS: ISelectedNode | undefined = selected.value.find(n => n.stash === stash)
      // console.debug('found', found);
      if (foundS) return foundS.status
      let foundB: IBackupNode | undefined = backups.value.find(n => n.stash === stash)
      // console.debug('found', found);
      if (foundB) return 'Backup'
      return 'Unknown'
    }

    const toCoin = (value: bigint | number | string) => {
      let _v: number = 0
      // if value is string, convert to number
      if (typeof value === 'string') {
        _v = Number(value.replace(',', ''))
      }
      // BigInt
      if (typeof value === 'bigint') {
        _v = Number(value)
      }
      // console.debug('toCoin', value, chainId.value);
      const ret = _v / Math.pow(10, decimals[chainId.value])
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
      await getApi();
      // if (!api) {
      //   console.warn('api not connected');
      //   api = await $substrate.getApi(chainId.value)
      //   // return
      // }
      loadingE.value = true
      var era: any = await api?.query.staking.activeEra()
      era = era ? era.toJSON() : {};
      const denom = BigInt(Math.pow(10, decimals[chainId.value]));

      var _exposure: any = await api?.query.staking.erasStakersOverview(era.index, stash.value);
      _exposure = _exposure.toJSON() as any;
      if (!_exposure) {
        loadingE.value = false
        return
      }
      _exposure.total = Number(BigInt(_exposure?.total || 0) / denom);
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
    })
    const dnNominations = computed(() => {
      return nominators.value.filter(n => dnNominators.value.includes(n.address)).reduce((sum, n) => sum + n.balance, 0)
    })
    const nonDnNominations = computed(() => {
      return nominators.value.filter(n => !dnNominators.value.includes(n.address)).reduce((sum, n) => sum + n.balance, 0)
    })

    const getAllNominators = async () => {
      console.debug('getAllNominators');
      await $substrate.getAllNominators();
      // console.debug('get stakingEntries');
      // await getApi();
      // if (!api) {
      //   console.warn('api not connected');
      // //   api = await $substrate.getApi(chainId.value)
      // }
      // // loadingAN.value = true
      // nominatorStore.loading = true
      // const stakingEntries = await api?.query.staking.nominators.entries()
      // const entries = stakingEntries?.map(([key, nominations]) => {
      //   // console.debug('key', key.toString(), value);
      //   return [key, nominations.toJSON()]
      //   // nominatorStore.setStakingEntries(key.toString(), value)
      // })
      // console.debug('entries', entries?.length);
      // nominatorStore.setStakingEntries(entries)
      // // loadingAN.value = false
      // nominatorStore.loading = false;
    }

    const nominators = ref<INominator[]>([])
    const page = ref(0)
    const pages = ref(0)
    const getNominators = async () => {
      await getApi();
      if (!api) {
      //   await $substrate.connect(chainId.value)
        console.warn('api not connected');
      }
      if(!stakingEntries.value || stakingEntries.value?.length === 0 ) {
        console.debug('getAllNominators required...');
        await getAllNominators();
      }

      loadingN.value = true
      console.debug('getNominators', stash.value);
      nominators.value = []
      page.value = 0
      // const stakingEntries = await api.query.staking.nominators.entries()
      // console.debug('stakingEntries', stakingEntries)
      pages.value = stakingEntries.value?.length || 0

      // console.debug('stakingEntries', stakingEntries.value);
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
          var accountData = await api?.query.system.account(nominatorAddress)
          if (!accountData) return
          accountData = accountData.toJSON() as any;
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
      loadingN.value = false
    }

    return {
      init,
      isLoading,
      apiConnected,
      loadingC,
      loadingT,
      loadingE,
      loadingN,
      loadingAN,
      substrateStoreLoading,
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
      rulesPerformance,

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
      // isNominated,
      toCoin,
      shortStash,
      // performanceGrade,
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
