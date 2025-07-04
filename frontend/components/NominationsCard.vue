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

      <!-- Nominations -->
      <Line id="chart1" :data="chartData" :options="{...chartOptions, plugins: { title: { display: true, text: 'Nominations' } }}" />

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

import type { INominationStats, IExposure, INominator } from '~/utils/types';

/**
 *  query for the nominations card:
 *  - get the current nominations and exposure
 *  - get the nomination stats
 *  - get the nominators
 */
const QUERY_NOMINATION_CARD = gql`
  query nominationCard($chainId: String!, $cohortId: String!, $stash: String!) {
    stakersForStash(chainId: $chainId, stash: $stash) {
      address
      balance
    }
    nominationStats(chainId: $chainId, stash: $stash) { 
      chainId
      stash
      datehour
      active
      commission
      nom_dn
      nom_non
      nom_value_dn
      nom_value_non
      exposure_dn
      exposure_non
    }
    # dn nominators
    nominators(chainId: $chainId, cohortId: $cohortId)
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

    const decimalPlaces = 2

    const dnNominators = ref<string[]>([])

    // const exposure = ref<IExposure>({
    //   total: 0,
    //   own: 0,
    //   pageCount: 0,
    //   others: []
    // })
    const nominationStats = ref<INominationStats[]>([])
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

    const { $substrate } = useNuxtApp();
    var api: ApiPromise | null;
    var apiConnected = ref(false)

    var loading = ref(false)
    var refetch = () => { console.log('refetch') }

    const chartData = computed(() => ({
      title: 'Nominations',
      // convert datehour (yyyy-MM-dd-HH) to date (yyyy-MM-dd)
      labels: nominationStats.value.map((stat) => {
        const ret = stat.datehour.substring(0, 10) + ' ' + stat.datehour.substring(11, 13) + ':00:00';
        // console.log(ret);
        return new Date(ret);
      }),
      datasets: [
        {
          type: 'bar',
          label: 'Non-DN',
          data: nominationStats.value.map((stat) => stat.nom_value_non),
          fill: true,
          borderWidth: 1,
          pointRadius: 1,
        },
        {
          type: 'bar',
          label: 'DN',
          data: nominationStats.value.map((stat) => stat.nom_value_dn),
          fill: true,
          borderWidth: 1,
          pointStyle: 'triangle',
          pointRadius: 1,
        },
        {
          type: 'line',
          label: 'Nominators',
          data: nominationStats.value.map((stat) => stat.nom_non + stat.nom_dn),
          fill: false,
          borderWidth: 1,
          pointRadius: 1,
          yAxisID: 'y1',
        },
      ]      
    }))

    const xAxis = computed(() => {
      // console.log('display', display.mdAndUp.value)
      return display.mdAndUp.value
        ? {
          stacked: true,
          type: 'time',
          time: {
            // parser: timeFormat,
            // round: 'day'                                                                                                                                                                            
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
          type: 'time',
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
              // console.log('display', display.lgAndUp.value)
              const ret = display.lgAndUp.value
                ? value.toFixed(0)
                : value > 1000000 ? (value/1000000).toFixed(2) + 'M' : (value/1000).toFixed(0) + 'K'
              return ret
            }
          }
        },
        y1: { stacked: false, min: 0, position: 'right' },
        x: xAxis.value
      },
    })

    onMounted(() => {

      var { error, loading: _loading, refetch: _refetch, onResult, onError } = useQuery(QUERY_NOMINATION_CARD, {
        chainId: props.chainId,
        cohortId: cohortId.value,
        stash: props.stash
      });

      loading = _loading
      refetch = _refetch

      onResult((result: any) => {
        if (result.loading) {
          console.log('still loading nomination card...');
          return;
        }
        console.log('nominators result', result.data);
        nominators.value = result.data?.stakersForStash?.map((staker: any) => {
          return {
            address: staker.address,
            balance: Number(staker.balance) / Math.pow(10, decimals.value as number)
          }
        }) || [];
        nominationStats.value = result.data?.nominationStats.map((stat: any) => {
          let datehour: string = ''
          try {
            datehour = moment(stat.datehour.substring(0, 10).replace(/\./g, '/') + ' ' + stat.datehour.substring(11, 13) + ':00:00').format('YYYY-MM-DD HH:mm')
          } catch (err) { console.error(err) }
          return {
            ...stat,
            datehour: datehour,
            nom_value_non: Number(stat.nom_value_non) / Math.pow(10, decimals.value as number),
            nom_value_dn: Number(stat.nom_value_dn) / Math.pow(10, decimals.value as number)
          }
        }) || [];
        dnNominators.value = result.data?.nominators || [];
      });

      onError((error: any) => {
        console.error(error)
      })

      doRefetch()
    })

    const doRefetch = () => {
      console.log('doRefetch')
      refetch()
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
