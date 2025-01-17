<template>

  <v-container fluid class="pa-0 ma-0">
    <v-toolbar color="background" fixed :elevation="elevation" class="dynamic-toolbar"
      :density="`${display.mdAndUp ? 'default' : 'compact'}`"
      style="position: fixed; padding-top: 25px;">
      <v-btn flat disabled class="d-none d-sm-inline">&nbsp;</v-btn>
      <v-toolbar-title>
        <v-icon size="small"><v-img src="/image/logo-black.png" height="32" width="32"></v-img></v-icon>&nbsp;
        <v-icon size="small"><v-img :src="`/image/${chainId}-logo.svg`" height="22" width="22" style="border-radius: 20%;"></v-img></v-icon> 
        {{ chainId }} cohort {{ cohortId }}</v-toolbar-title>
      <!-- <v-spacer></v-spacer> -->
      <!-- <v-text-field v-model="search" placeholder="Search"></v-text-field> -->

      <v-btn size="small"icon>
        <nuxt-link :to="`/${chainId === 'polkadot' ? 'kusama' : 'polkadot'}/cohort/${cohortId}`">
            <v-img :src="`/image/${chainId === 'polkadot' ? 'kusama' : 'polkadot'}-logo.svg`" height="22" width="22" rounded></v-img>
        </nuxt-link>
      </v-btn>

      <!-- <v-btn icon flat :loading="loading" @click="refresh">
        <v-icon>mdi-refresh</v-icon>
      </v-btn> -->
    </v-toolbar>

    <client-only>

      <v-container style="padding-top: 75px;">

        <!-- <v-card>      
          <client-only>
            <validator-map :chain-id="chainId" :validators="telemetry"></validator-map>
          </client-only>
        </v-card> -->

        <v-tabs v-model="tab">
          <v-tab value="selected">Selected</v-tab>
          <v-tab value="backups">Backups</v-tab>
          <v-tab value="nominators">Nominators</v-tab>
        </v-tabs>

        <v-tabs-window v-model="tab">
          <v-tabs-window-item value="selected">
            <v-card>
              <template v-slot:text>
                <v-row>
                  <v-text-field
                    v-model="search"
                    label="Search"
                    prepend-inner-icon="mdi-magnify"
                    variant="outlined"
                    hide-details
                    single-line
                    density="compact"
                  ></v-text-field>
                  <v-btn icon flat :loading="loading" @click="refresh">
                    <v-icon>mdi-refresh</v-icon>
                  </v-btn>
                </v-row>
              </template>

              <v-data-table
                :items="selected"
                :headers="[
                  {title: 'Name', key: 'identity'},
                  {title: 'Stash',key: 'stash'},
                  {title: 'Commission',key: 'commission'},
                  {title: 'DN Status',key: 'status'},
                  {title: 'DN nominated', key: 'nominatedBy'},
                  {title: 'Telemetry (Public)', key: 'telemetry'},
                  {title: 'Hardware\n(CPU/RAM/Kernel/VM)', key: 'hw'},
                  // {title: 'Cores', key: 'cores'},
                  // {title: 'Memory', key: 'memory'},
                  // {title: 'Kernel', key: 'linux_kernel'},
                  // {title: 'VM', key: 'is_virtual_machine'},
                  ]"
                :search="search"
                :items-per-page="linesPerPage"
                @update:itemsPerPage="val => linesPerPage = val"
                @click:row="gotoValidator">
                <template v-slot:item="{ item }">
                  <tr @click="gotoValidator(null, {item})">
                    <td>{{ item.identity }}</td>
                    <td class="text-overline text-none">{{ shortStash(item.stash) }}</td>
                    <td>{{ Number(item.commission).toLocaleString(undefined, {maximumFractionDigits: 1, minimumFractionDigits: 1}) }}</td>
                    <td>{{ item.status }}</td>
                    <td class="text-overline text-none">{{ shortStash(nominatedBy[item.stash]) }}</td>
                    <!-- <td>{{ nominatedBy[item.stash] }}</td> -->
                    <td>{{ item.telemetryX ? 'Yes' : 'No' }}</td>
                    <td>
                      {{ item.telemetryX?.NodeSysInfo?.core_count || '-' }} /
                      {{ ((item.telemetryX?.NodeSysInfo?.memory || 0)/1024/1024/1024).toFixed(0) }} /
                      {{ item.telemetryX?.NodeSysInfo?.linux_kernel || '-' }} /
                      {{ item.telemetryX ? (item.telemetryX?.NodeSysInfo?.is_virtual_machine ? 'Yes' : 'No') : '-' }}

                    </td>
                    <!--
                    <td>{{ item.telemetry?.NodeSysInfo?.core_count }}</td>
                    <td>{{ ((item.telemetry?.NodeSysInfo?.memory || 0)/1024/1024/1024).toFixed(0) }}</td>
                    <td>{{ item.telemetry?.NodeSysInfo?.linux_kernel }}</td>
                    <td>{{ item.telemetry?.NodeSysInfo?.is_virtual_machine ? 'Yes' : 'No' }}</td>
                    -->
                  </tr>
                </template>
              </v-data-table>
            </v-card>
          </v-tabs-window-item>

          <v-tabs-window-item value="backups">
            <v-data-table
              :items="backups"
              :headers="[{title: 'Name', key: 'identity'}, {title: 'Stash',key: 'stash'}]"
              @click:row="gotoValidator"></v-data-table>
          </v-tabs-window-item>

          <v-tabs-window-item value="nominators">
            <!-- {{ nominatorList }} -->
            <v-list>
              <v-list-item v-for="item in nominatorList" v-bind:key="item.stash"
                :to="(item.type === 'subheader') ? '' : `/${chainId}/validator/${item.stash}`">
                <v-list-item-subtitle v-show="item.type == 'subheader'">
                  {{ item.title }}
                </v-list-item-subtitle>
                <v-list-item-title v-show="item.type != 'subheader'">
                  {{ item.title }}
                </v-list-item-title>
              </v-list-item>
              <!-- <template v-slot:subheader="{ item }">
                <v-subheader>{{ item.title }}</v-subheader>
              </template>
              <template v-slot:item="{ item }">
                <v-list-item>
                  <v-list-item-content>
                    <v-list-item-title>{{ item.title }}</v-list-item-title>
                  </v-list-item-content>
                </v-list-item>
              </template> -->
            </v-list>
          </v-tabs-window-item>
        </v-tabs-window>

      </v-container>
      <Footer :chain-id="chainId" :cohort-id="cohortId"></Footer>
    </client-only>

  </v-container>

</template>

<script lang="ts">
import ValidatorMap from '@/components/ValidatorMap.vue'
import { handleScroll } from "~/utils/helpers";
import { ApiPromise } from '@polkadot/api';
import Footer from '~/components/Footer.vue';

import type { ISelectedNode, IBackupNode } from '~/utils/types';

const QUERY_NODES = gql`
query queryNodes($chainId: String!, $cohortId:Int!) {
  selected(chainId: $chainId, cohortId: $cohortId) {
    identity
    stash
    status
    commission
    telemetryX {
      NodeName
      NodeSysInfo {
        memory
        core_count
        linux_kernel
        linux_distro
        is_virtual_machine
      }
    }
  }
  nominators(chainId: $chainId, cohortId: $cohortId) 
  backups(chainId: $chainId, cohortId: $cohortId) {
    identity
    stash
  }
  validators(chainId: $chainId) {
    address
    commission
  }
  telemetry(chainId: $chainId) {
    NodeId
    IPGeo {
      # query # do not dox the IP
      lat
      lon
      city
      country
    }
    NodeDetails {
      NodeName
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
  components: {
    ValidatorMap,
    Footer
  },
  async setup() {
    const display = useDisplay()
    const route = useRoute()
    const router = useRouter()
    const chainId = ref(route.params.chainId.toString())
    const cohortId = ref(Number(route.params.cohortId.toString()))
    const nodeStore = useNodeStore()
    // const nominatorStore = useNominatorStore()
    const substrateStore = useSubstrateStore()
    const stakingEntries = computed(() => substrateStore.stakingEntries)
    const substrateStoreLoading = computed(() => substrateStore.loading)
    // const nominatorStoreLoading = computed(() => nominatorStore.loading)
    const nodes = ref([])

    const { $substrate } = useNuxtApp();
    var api: ApiPromise | null;

    var error = ref(null)
    var loading = ref<any>(false)
    // var loadingG = ref<any>(false)
    var refetch = ref<any>(() => {})
    // var grefetch = ref(() => {})

    const selected = ref([])
    const nominators = ref([])
    const backups = ref([])
    const validators = ref([])
    const telemetry = ref([])
    const search = ref(nodeStore.search)
    const tab = ref(nodeStore.tab)
    const linesPerPage = ref(nodeStore.linesPerPage)
    const elevation = ref(0)
    var scrollHandler: any = null

    onBeforeUnmount(() => {
      if(scrollHandler) scrollHandler();
    }),

    onBeforeMount(async () => {
      api = await $substrate.getApi(chainId.value)
      scrollHandler = handleScroll((scrollY) => {
        elevation.value = scrollY > 0 ? 4 : 0;
      })
    });

    onMounted(async () => {
      var {
        error, 
        loading: cLoading,
        refetch: cRefetch,
        onResult } = useQuery(QUERY_NODES, {
        chainId: chainId.value,
        cohortId: cohortId.value
      })
      refetch.value = cRefetch
      loading = cLoading

      onResult((result: any) => {
        if (result.loading) {
          console.log('still loading...');
          return;
        }
        console.log('result', result.data);
        selected.value = result.data?.selected || [];
        nominators.value = result.data?.nominators.map(n => {return {stash: n}}) || [];
        backups.value = result.data?.backups || [];
        validators.value = result.data?.validators || [];
        telemetry.value = result.data?.telemetry || [];
        // console.log('nodes', nodes);
        telemetry.value?.forEach((node: any) => {
          // console.log('node', node);
          nodeStore.addNode(node);
        });

        getNominatorTargets()
      });

      if(!stakingEntries.value || stakingEntries.value.length === 0) {
        console.debug('get stakingEntries...');
        getAllNominators();
      // } else {
      //   console.debug('stakingEntries already loaded');
      //   console.debug(stakingEntries.value);
      }
    });

    const nominations = ref<Record<string, string[]>>({});
    const nominatedBy = ref<Record<string, string[]>>({});

    const getNominatorTargets = async () => {
      console.log('getNominatorTargets');
      api = await $substrate.getApi(chainId.value)
      // console.log('api', api);
      for(let i = 0; i < nominators.value.length; i++) {
        const nominator = nominators.value[i]; // DN nominator
        // console.log('nominator', nominator);
        const res = await api?.query.staking.nominators(nominator.stash) || [];
        const { targets } = res?.toJSON() || [];
        //console.log('targets', targets);
        for(let j = 0; j < targets.length; j++) {
          const target = targets[j];
          // console.log('nominator', nominator.stash, 'target', target);
          if (nominations.value[nominator.stash]) {
            nominations.value[nominator.stash].push(target);
          } else {
            nominations.value[nominator.stash] = [target];
          }
          // if (nominatedBy.value[target]) {
          //   nominatedBy.value[target].push(nominator.stash);
          // } else {
          //   nominatedBy.value[target] = [nominator.stash];
          // }
          nominatedBy.value[target] = nominator.stash;
        }
      }
    }

    const getAllNominators = async () => {
      console.log('getAllNominators');
      await $substrate.getAllNominators();
      // console.debug('get stakingEntries');
      // if(!api) {
      //   console.error('api not ready');
      //   return
      // }
      // nominatorStore.loading = true
      // const stakingEntries = await api.query.staking.nominators.entries()
      // const entries = stakingEntries.map(([key, nominations]) => {
      //   // console.debug('key', key.toString(), value);
      //   return [key, nominations.toJSON()]
      //   // nominatorStore.setStakingEntries(key.toString(), value)
      // })
      // console.debug('entries', entries.length);
      // nominatorStore.setStakingEntries(entries)
      // nominatorStore.loading = false;
    }

    // const getNominatedBy = (stash: string): string => {
    //   const nominators: string[] = []
    //   for (let i = 0; i < nominators.value.length; i++) {
    //     const n = nominators.value[i];
    //     if (nominations.value[n.stash].includes(stash)) {
    //       nominators.push(n.stash);
    //     }
    //   }
    //   for (let [n, targets] of nominations.value.entries()) {
    //     if (targets.includes(stash)) {
    //       nominators.push(n);
    //     }
    //   }
    //   return nominators[0] || '';
    // }

    const gotoValidator = (event, row) => {
      console.log('item', row.item);
      if (row.item?.stash)
        router.push(`/${chainId.value}/validator/${row.item.stash}`);
    }

    watch(() => search.value, async (value) => {
      console.log('search', value);
      nodeStore.setSearch(value);
    });

    watch(() => tab.value, async (value) => {
      console.log('tab', value);
      nodeStore.tab = value;
    });

    watch(() => linesPerPage.value, async (value) => {
      console.log('linesPerPage', value);
      nodeStore.linesPerPage = value;
    });

    // watch(route, (value) => {
    //   console.log('new chainId', value);
    //   //nodeStore.setChainId(value);
    //   refresh()
    // });
    // const goto = (path: string) => {
    //   console.log('goto', path);
    //   // nextTick(() => {
    //     router.push(path);
    //     refresh();
    //   // });
    // }

    const shortStash = (stash: string) => {
      if (!stash) return '';
      return stash.substring(0, 6) + '...' + stash.substring(stash.length - 6);
    }

    interface ILocation {
      // stash: string;
      country: string;
      city: string;
      lat: string;
      lon: string;
    }
    const locations = ref<Record<string, ILocation>>({});

    const refresh = async () => {
      console.log('refreshing');
      // loading.value = true;
      refetch.value();
      // grefetch.value();
    }

    const getIdentity = (stash: string) => {
      const foundS: ISelectedNode | undefined = selected.value.find((s: any) => s.stash === stash);
      if (foundS) return foundS.identity;
      const foundB: IBackupNode | undefined = backups.value.find((b: any) => b.stash === stash);
      if (foundB) return foundB.identity;
      return stash;
    }

    interface INomination {
      stash: string;
      targets: string[];
    }
    const nominatorList = computed(() => {
      var ret: any[] = [];
      Object.entries(nominations.value).forEach(([nominator, targets]) => {
        //console.log('nominator', nominator, 'targets', targets);
        ret.push(
          {type: 'subheader', title: nominator, stash: nominator},
          ...targets.map((t: string) => {
            return {type: 'item', title: t, stash: t}
          })
       );
      });
      console.log('nominatorList', ret);
      return ret;
    })

    const sel_nom = ref<any>({})
    return {
      display,
      loading,
      substrateStoreLoading,
      elevation,
      refresh,
      chainId,
      cohortId,
      selected,
      nominators,
      nominations,
      backups,
      validators,
      telemetry,
      search,
      tab,
      linesPerPage,
      // data,
      gotoValidator,
      nominatedBy,
      shortStash,
      sel_nom,
      getIdentity,
      nominatorList,
      // goto
    }
  }
})
</script>

<style scoped>
.dynamic-toolbar {
  position: sticky;
  top: 0;
  z-index: 10;
  background-color: white;
  transition: box-shadow 0.3s;
}
</style>
