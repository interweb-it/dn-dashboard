<template>
  <client-only>

    <v-container>
    <v-toolbar color="background">
      <v-toolbar-title>[DN] {{ chainId }} cohort {{ cohortId }}</v-toolbar-title>
      <v-spacer></v-spacer>
      <v-text-field v-model="search" placeholder="Search"></v-text-field>
      <v-toolbar-items>
      </v-toolbar-items>

      <v-btn icon flat :loading="loading" @click="refetch">
        <v-icon>mdi-refresh</v-icon>
      </v-btn>
    </v-toolbar>

    <v-tabs v-model="tab">
      <v-tab value="selected">Selected</v-tab>
      <v-tab value="backups">Backups</v-tab>
      <v-tab value="nominators">Nominators</v-tab>
    </v-tabs>

    <v-tabs-window v-model="tab">
      <v-tabs-window-item value="selected">
        <v-data-table
          :items="selected"
          :headers="[{title: 'Name', key: 'identity'}, {title: 'Stash',key: 'stash'},{title:'DN Status',key: 'status'},
            {title: 'DN nominated', key: 'nominatedBy'}]"
          :search="search"
          @click:row="gotoValidator">
          <template v-slot:item="{ item }">
            <tr @click="gotoValidator(null, {item})">
              <td>{{ item.identity }}</td>
              <td class="text-overline text-none">{{ shortStash(item.stash) }}</td>
              <td>{{ item.status }}</td>
              <td class="text-overline text-none">{{ shortStash(nominatedBy[item.stash]) }}</td>
              <!-- <td>{{ nominatedBy[item.stash] }}</td> -->
            </tr>
          </template>
        </v-data-table>
      </v-tabs-window-item>
      <v-tabs-window-item value="backups">
        <v-data-table
          :items="backups"
          :headers="[{title: 'Name', key: 'identity'}, {title: 'Stash',key: 'stash'}]"
          :search="search"
          @click:row="gotoValidator"></v-data-table>
      </v-tabs-window-item>
      <v-tabs-window-item value="nominators">
        <v-data-table
          :items="nominators"
          :headers="[{title: 'Stash',key: 'stash'}]"
          :search="search">
          <template v-slot:item="{ item }">
            <tr>
              <td>{{ item.stash }}</td>
              <td>{{ nominations[item.stash] }}</td>
            </tr>
          </template>
        </v-data-table>
      </v-tabs-window-item>
    </v-tabs-window>

  </v-container>
  </client-only>

</template>

<script lang="ts">

const QUERY_NODES = gql`
query nodeByName($chainId: String!, cohortId:Int!) {
  selected(chainId: $chainId, cohortId: $cohortId) {
    identity
    stash
    status
  }
  nominators(chainId: $chainId, cohortId: $cohortId) 
  backups(chainId: $chainId, cohortId: $cohortId) {
    identity
    stash
  }
  validators(chainId: $chainId)
  telemetry(chainId: $chainId) {
    NodeId
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
  async setup() {
    const route = useRoute()
    const router = useRouter()
    const chainId = ref(route.params.chainId)
    const cohortId = ref(route.params.cohortId)
    const nodeStore = useNodeStore()
    const nodes = ref([])

    const { $substrate } = useNuxtApp();
    var api: ApiPromise | null;

    var error = ref(null)
    var loading = ref()
    var refetch = ref(() => {})
    const selected = ref([])
    const nominators = ref([])
    const backups = ref([])
    const validators = ref([])
    const search = ref(nodeStore.search)
    var tab = ref('selected')

    onBeforeMount(async () => {
      api = $substrate.getApi(chainId.value)

      var {
        error, 
        // loading: cLoading,
        refetch: cRefetch,
        onResult } = await useQuery(QUERY_NODES, {
        chainId: chainId.value,
        cohortId: cohortId.value
      })
      refetch.value = cRefetch
      // loading.value = computed(() => cLoading)

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
        const telemetry = result.data?.telemetry || [];
        // console.log('nodes', nodes);
        telemetry?.forEach((node: any) => {
          // console.log('node', node);
          nodeStore.addNode(node);
        });

        getNominatorTargets()
        loading.value = false;
      });
      
    });

    // if (error) {
    //   // eslint-disable-next-line no-console
    //   console.error(error)
    // }

    const nominations = ref<Record<string, string[]>>({});
    const nominatedBy = ref<Record<string, string[]>>({});

    const getNominatorTargets = async () => {
      console.log('getNominatorTargets');
      api = await $substrate.getApi(chainId.value)
      // console.log('api', api);
      for(let i = 0; i < nominators.value.length; i++) {
        const nominator = nominators.value[i];
        // console.log('nominator', nominator);
        const res = await api?.query.staking.nominators(nominator.stash) || [];
        const { targets } = res.toJSON();
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

    const getNominatedBy = (stash: string): string => {
      const nominators: string[] = []
      for (let i = 0; i < nominators.value.length; i++) {
        const n = nominators.value[i];
        if (nominations.value[n.stash].includes(stash)) {
          nominators.push(n.stash);
        }
      }
      for (let [n, targets] of nominations.value.entries()) {
        if (targets.includes(stash)) {
          nominators.push(n);
        }
      }
      return nominators[0] || '';
    }

    const gotoValidator = (event, row) => {
      console.log('item', row.item);
      if (row.item?.stash)
        router.push(`/${chainId.value}/validator/${row.item.stash}`);
    }

    watch(() => search.value, async (value) => {
      console.log('search', value);
      nodeStore.setSearch(value);
    });

    const shortStash = (stash: string) => {
      if (!stash) return '';
      return stash.substring(0, 6) + '...' + stash.substring(stash.length - 6);
    }

    return {
      loading,
      refetch,
      chainId,
      cohortId,
      selected,
      nominators,
      nominations,
      backups,
      validators,
      search,
      tab,
      // data,
      gotoValidator,
      nominatedBy,
      shortStash,
    }
  }
})
</script>
