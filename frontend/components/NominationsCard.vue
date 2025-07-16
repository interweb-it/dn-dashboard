<template>
  <v-card>
    <v-card-title>
      Nominations
      <v-icon color="red" size="small">mdi-sack</v-icon>
      <v-btn icon flat @click="doRefetch" :loading="loading">
        <v-icon>mdi-refresh</v-icon>
      </v-btn>
    </v-card-title>
    <v-card-text>
      
      <v-overlay :model-value="loading" contained>
        <!-- <v-progress-circular indeterminate size="48" color="primary" /> -->
      </v-overlay>
      <Bar id="chart1" :data="chartData" :options="chartOptions" />

      <!-- <p v-show="loadingN" color="red">Scanning chain nominators, building nominator list... {{ page }} of {{ pages }}</p> -->
      <!-- {{ nominators }} -->
      <br>
      <v-container fluid class="ma-0 pa-0">
        <v-row no-gutters>
          <v-col>
            Total: {{ totalNominations.toLocaleString(undefined, {maximumFractionDigits: decimalPlaces, minimumFractionDigits: decimalPlaces}) }}
          </v-col>
          <v-col>
            DN: {{ dnNominations.toLocaleString(undefined, {maximumFractionDigits: decimalPlaces, minimumFractionDigits: decimalPlaces}) }}
          </v-col>
          <v-col>
            Non-DN: {{ nonDnNominations.toLocaleString(undefined, {maximumFractionDigits: decimalPlaces, minimumFractionDigits: decimalPlaces}) }}
          </v-col>
        </v-row>
      </v-container>
      <!-- {{ dnNominators }} -->
      <v-data-table :items="nominators"  :loading="loading"
        :headers="[{key:'address',title:'Address' }, {key: 'balance', title: 'Balance', align:'end'}]"
        :sort-by="[{ key: 'balance', order: 'desc' }]">
        <template v-slot:loading>
          <v-skeleton-loader type="table-row@5"></v-skeleton-loader>
        </template>
        <template v-slot:item.address="{ item }">
          <a :href="`https://${chainId}.subscan.io/nominator/${item.address}`" target="_blank">{{ shortStash(item.address) }}</a>              
          <v-icon color="red" v-if="exposure.others?.map(m => m.who).includes(item.address)">mdi-fire</v-icon>
          <span v-if="dnNominators.includes(item.address)" style="color: blueviolet; font-weight: bold;"> [DN]</span>
        </template>
        <template v-slot:item.balance="{ item }">
          <span style="color: red;" v-if="exposure.others?.map(m => m.who).includes(item.address)">
            {{ exposure.others.find(m => m.who === item.address)?.value.toLocaleString(undefined, {minimumFractionDigits: decimalPlaces, maximumFractionDigits: decimalPlaces}) }} /
          </span>
          {{ item.balance.toLocaleString(undefined, {minimumFractionDigits: decimalPlaces, maximumFractionDigits: decimalPlaces}) }}
          <!-- item exposure -->
        </template>
      </v-data-table>
    </v-card-text>
  </v-card>
</template>

<script lang="ts">
import moment from 'moment';
import { ApiPromise } from '@polkadot/api';

import {
  Chart as ChartJS,
  BarElement,
  LineElement,
  CategoryScale,
  // LinearScale,
  TimeScale,
  Title,
  Tooltip,
  Legend,
  registerables
} from 'chart.js';
import { Bar, Line } from 'vue-chartjs';
import 'chartjs-adapter-moment';
ChartJS.register(...registerables);

import type { IValidatorStats, IExposure, INominator } from '~/utils/types';

/**
 *  query for the nominations card:
 *  - get the current nominations and exposure
 *  - get the nomination stats
 *  - get the nominators
 */
const QUERY_NOMINATORS = gql`
  query allNominators($chainId: String!, $cohortId: String!, $stash: String!) {
    stakersForStash(chainId: $chainId, stash: $stash) {
      address
      balance
    }
    # dn nominators
    nominators(chainId: $chainId, cohortId: $cohortId)
  }
`;

const QUERY_NOMINATION_STATS = gql`
  query nominationStats($chainId: String!, $stash: String!) {
    nominationStats(chainId: $chainId, stash: $stash) { 
      chainId
      stash
      dateHour
      # active
      # commission
      nomDn
      nomNon
      nomValueDn
      nomValueNon
      # exposure_dn
      # exposure_non
    }
  }
`;

export default defineComponent({
  name: 'ExposureCard',
  props: {
    chainId: {
      type: String,
      required: true
    },
    stash: {
      type: String,
      required: true
    },
    reload: {
      type: Number,
      required: false,
      default: 0
    }
  },
  components: {
    Bar,
    Line
  },
  setup(props) {
    const display = useDisplay()
    const substrateStore = useSubstrateStore()
    const decimals = computed(() => substrateStore.getDecimals)
    const nodeStore = useNodeStore()
    const cohortId = computed(() => nodeStore.cohortId)
    const exposure = computed(() => nodeStore.currentExposure)

    const decimalPlaces = 0

    const dnNominators = ref<string[]>([])
    const nominationStats = ref<IValidatorStats[]>([])
    const nominators = ref<INominator[]>([])

    const totalNominations = computed(() => {
      return nominators.value.reduce((sum, n) => sum + Number(n.balance), 0)
    })
    const dnNominations = computed(() => {
      return nominators.value.filter(n => dnNominators.value.includes(n.address)).reduce((sum, n) => sum + Number(n.balance), 0)
    })
    const nonDnNominations = computed(() => {
      return nominators.value.filter(n => !dnNominators.value.includes(n.address)).reduce((sum, n) => sum + Number(n.balance), 0)
    })

    var loadingN = ref(true)
    var loadingS = ref(true)

    const loading = computed(() => {
      return loadingN.value || loadingS.value
    })

    var refetchN = () => { console.debug('refetchN') }
    var refetchS = () => { console.debug('refetchS') }

    const chartData = computed(() => ({
      // convert dateHour (yyyy-MM-dd-HH) to ISO string for timeseries
      labels: nominationStats.value.map((stat) => {
        const ret = stat.dateHour.substring(0, 10) + ' ' + stat.dateHour.substring(11, 13) + ':00:00';
        return new Date(ret).toISOString();
      }),
      datasets: [
        {
          type: 'bar' as const,
          label: 'Non-DN',
          data: nominationStats.value.map((stat) => Number(stat.nomValueNon)),
          fill: true,
          borderWidth: 1,
          pointRadius: 1,
        },
        {
          type: 'bar' as const,
          label: 'DN',
          data: nominationStats.value.map((stat) => Number(stat.nomValueDn)),
          fill: true,
          borderWidth: 1,
          pointStyle: 'triangle',
          pointRadius: 1,
        },
        {
          type: 'line',
          label: 'Nominators',
          data: nominationStats.value.map((stat) => Number(stat.nomNon) + Number(stat.nomDn)),
          fill: false,
          borderWidth: 1,
          pointRadius: 1,
          yAxisID: 'y1',
        },
      ]      
    }))

    const xAxis = computed(() => {
      return display.mdAndUp.value
        ? {
          stacked: true,
          type: 'timeseries',
          time: {
            tooltipFormat: 'YYYY-MM-DD HH:mm',
            displayFormats: {
                millisecond: 'HH:mm:ss.SSS',
                second: 'HH:mm:ss',
                minute: 'HH:mm',
                hour: '(DD) HH:00'
            }
          }
        } : {
          stacked: true,
          type: 'timeseries',
          ticks: {
            display: false
          }
        }
    })

    const chartOptions = ref({
      scales: {
        y: {
          stacked: true, min: 0,
          ticks: {
            callback: function(value: any) {
              // console.debug('display', display.lgAndUp.value)
              const ret = display.lgAndUp.value
                ? value.toFixed(0)
                : value > 1000000 ? (value/1000000).toFixed(2) + 'M' : (value/1000).toFixed(0) + 'K'
              return ret
            }
          }
        },
        y1: { stacked: false, min: 0, position: 'right' as const },
        x: xAxis.value
      },
      plugins: {
        tooltip: {
          callbacks: {
            label: function(context: any) {
              let label = context.dataset.label || '';
              if (label) {
                label += ': ';
              }
              if (context.parsed.y !== null && context.parsed.y !== undefined) {
                label += Number(context.parsed.y).toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 });
              }
              return label;
            }
          }
        }
      }
    })

    onMounted(() => {

      var { error, loading: _loadingN, refetch: _refetchN, onResult: onResultN, onError: onErrorN } = useQuery(QUERY_NOMINATORS, {
        chainId: props.chainId,
        cohortId: cohortId.value,
        stash: props.stash
      });
      watch(() => _loadingN.value, (newVal) => {
        console.debug('loading', newVal)
        loadingN.value = newVal
      })
      refetchN = _refetchN
      onResultN((result: any) => {
        if (result.loading) {
          console.debug('still loading all nominators...');
          return;
        }
        console.debug('all nominators result', result.data);
        nominators.value = result.data?.stakersForStash?.map((staker: any) => {
          return {
            address: staker.address,
            balance: Number(staker.balance) / Math.pow(10, decimals.value as number)
          }
        }) || [];
        dnNominators.value = result.data?.nominators || [];
      });
      onErrorN((error: any) => {
        console.error(error)
      })
      
      var { error, loading: _loadingS, refetch: _refetchS, onResult: onResultS, onError: onErrorS } = useQuery(QUERY_NOMINATION_STATS, {
        chainId: props.chainId,
        cohortId: cohortId.value,
        stash: props.stash
      });
      watch(() => _loadingS.value, (newVal) => {
        console.debug('loading', newVal)
        loadingS.value = newVal
      })
      refetchS = _refetchS
      onResultS((result: any) => {
        console.debug('nomination stats result', result.data);
        nominationStats.value = result.data?.nominationStats.map((stat: any) => {
          let dateHour: string = ''
          try {
            dateHour = moment(stat.dateHour.substring(0, 10).replace(/\./g, '/') + ' ' + stat.dateHour.substring(11, 13) + ':00:00')
              .format('YYYY-MM-DD HH:mm')
          } catch (err) { console.error(err) }
          return {
            ...stat,
            dateHour: dateHour,
            nomValueNon: Number(stat.nomValueNon) / Math.pow(10, decimals.value as number),
            nomValueDn: Number(stat.nomValueDn) / Math.pow(10, decimals.value as number)
          }
        }) || [];
      })
      onErrorS((error: any) => {
        console.error(error)
      })

      doRefetch()
      watch(() => props.reload, (newVal) => {
        console.debug('reload', newVal)
        doRefetch()
      })
    })

    const doRefetch = () => {
      console.debug('doRefetch')
      refetchN()
      refetchS()
    }

    return {
      exposure,
      decimalPlaces,
      loading,
      dnNominators,
      chartData,
      chartOptions,
      nominationStats,
      nominators,
      totalNominations,
      dnNominations,
      nonDnNominations,
      doRefetch
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
</style>
