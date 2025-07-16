<template>
  <v-card>
    <v-card-title>
      Exposure
      <v-icon color="red" size="small">mdi-fire</v-icon>
      <v-btn icon flat @click="doRefetch" :loading="loadingH || loadingE">
        <v-icon>mdi-refresh</v-icon>
      </v-btn>
    </v-card-title>
    <v-card-text>
      <!-- {{ exposure }} -->

      <v-overlay :model-value="loadingE" contained>
        <!-- <v-progress-circular indeterminate size="48" color="primary" /> -->
      </v-overlay>
      <Bar id="chart2" :data="chartData as any" :options="chartOptions as any" />

      <br>

      <v-container fluid class="ma-0 pa-0">
        <v-row no-gutters>
          <v-col>
            Total: {{ exposure.total.toLocaleString(undefined, {maximumFractionDigits:  decimalPlaces, minimumFractionDigits:  decimalPlaces}) }}
          </v-col>
          <v-col>
            Own: {{ exposure.own.toLocaleString(undefined, {maximumFractionDigits: decimalPlaces, minimumFractionDigits: decimalPlaces}) }}
          </v-col>
          <v-col>
            Others: {{ exposure.others.reduce((sum, m) => sum + m.value, 0).toLocaleString(undefined, {maximumFractionDigits: decimalPlaces, minimumFractionDigits: decimalPlaces}) }}
          </v-col>
        </v-row>
      </v-container>

      <!-- {{ dnNominators }} -->

      <v-data-table :items="exposure.others"
        :headers="[{ key: 'who', title: 'Address'}, {key: 'value', title: 'Amount', align: 'end'}]"
        :sort-by="[{ key: 'value', order: 'desc' }]"
        :loading="loadingE">
        <template v-slot:item.who="{ item }">
          <a :href="`https://${chainId}.subscan.io/nominator/${item.who}`" target="_blank">{{ shortStash(item.who) }}</a>              
          <span v-if="dnNominators.includes(item.who)" style="color: blueviolet; font-weight: bold;"> [DN]</span>
        </template>
        <template v-slot:item.value="{ item }">
          {{ item.value.toLocaleString(undefined, {minimumFractionDigits: decimalPlaces, maximumFractionDigits: decimalPlaces}) }}
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
  LinearScale,
  TimeScale,
  Title,
  Tooltip,
  Legend,
  registerables
} from 'chart.js';
import { Bar, Line } from 'vue-chartjs';
import 'chartjs-adapter-moment';
// ChartJS.register(...registerables);

import { QUERY_NOMINATION_STATS, QUERY_DM_NOMINATORS, QUERY_EXPOSURE_STATS } from '~/utils/graphql';
import type { IValidatorStats, IExposure } from '~/utils/types';

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
    const decimals = computed(() => substrateStore.getDecimals || 10)
    const nodeStore = useNodeStore()
    const cohortId = computed(() => nodeStore.cohortId)
    const decimalPlaces = 0
    const loadingH = ref(true)
    const loadingE = ref(true)
    const dnNominators = ref<string[]>([])
    const exposure = ref<IExposure>({
      total: 0,
      own: 0,
      pageCount: 0,
      others: []
    })
    const validatorStats = ref<IValidatorStats[]>([])

    const { $substrate } = useNuxtApp();
    var api: ApiPromise | null;
    //var apip: ApiPromise | null;
    var apiConnected = ref(false)

    var refetch = () => { console.debug('refetch') }
    var refetchDn = () => { console.debug('refetch dm') }

    const getApi = async () => {
      if (!api || !apiConnected.value) {
        console.debug('getApi', props.chainId);
        api = await $substrate.getApi(props.chainId)
        //apip = await $substrate.getApip(props.chainId)
        apiConnected.value = true
      }
    }

    const getExposure = async () => {
      console.debug('getExposure', props.stash);
      await getApi();
      loadingE.value = true
      var era: any = await api?.query.staking.activeEra()
      era = era ? era.toJSON() : {};
      const denom = BigInt(Math.pow(10, decimals.value));

      var _exposure: any = await api?.query.staking.erasStakersOverview(era.index, props.stash);
      _exposure = _exposure.toJSON() as any;
      if (!_exposure) {
        loadingE.value = false
        return
      }
      _exposure.total = Number(BigInt(_exposure?.total || 0) / denom);
      _exposure.own = Number(BigInt(_exposure.own) / denom);
      console.debug('exposure:', _exposure);

      // validator other exposures
      _exposure.others = [];
      for (let j = 0; j < _exposure.pageCount; j++) {
        const exp: IExposure = (await api?.query.staking.erasStakersPaged(era.index, props.stash, j)).toJSON() as any;
        exp.others = exp.others.map((o) => {
          return {
            who: o.who,
            value: Number(BigInt(o.value) / denom),
          };
        })
        _exposure.others.push(...exp.others || []);
      }
      exposure.value = _exposure;
      nodeStore.setCurrentExposure(exposure.value)
      loadingE.value = false
    }

    const xAxis = computed(() => {
      console.debug('display', display.smAndUp.value)
      return display.smAndUp.value
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

    const chartData = computed(() => ({
      title: 'Exposure',
      labels: validatorStats.value.map((stat) => stat.dateHour),
      datasets: [
        {
          label: 'Non-DN',
          data: validatorStats.value.map((stat) =>stat.exposureNon),
          fill: true,
          borderWidth: 1,
          pointRadius: 1,
        },
        {
          label: 'DN',
          data: validatorStats.value.map((stat) => stat.exposureDn),
          fill: true,
          borderWidth: 1,
          pointStyle: 'triangle',
          pointRadius: 1,
        },
      ]      
    }))

    const chartOptions = ref({
      scales: {
        y: {
          stacked: true, min: 0,
          ticks: {
            callback: function(value: any) {
              // console.debug('display', display.lgAndUp.value)
              const ret = display.mdAndUp.value
                ? value.toLocaleString(undefined, {maximumFractionDigits: 0, minimumFractionDigits: 0})
                : value > 1000000 ? (value/1000000).toFixed(2) + 'M' : (value/1000).toFixed(0) + 'K'
              return ret
            }
          }
        },
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
      // plugins: {
      //   title: {
      //     display: true,
      //     text: 'Exposure'
      //   }
      // }
    })

    onMounted(() => {
      const { error: _error, loading: _loading, refetch: _refetch, onResult, onError } = useQuery(QUERY_EXPOSURE_STATS, {
        chainId: props.chainId,
        stash: props.stash
      });
      refetch = _refetch
      // loading.value = _loading
      watch(() => _loading.value, (newVal) => {
        console.debug('loading', newVal)
        loadingH.value = newVal
      })

      onError((error: any) => {
        console.debug('onError', error);
      });

      onResult((result: any) => {
        console.debug('onResult', result);
        if (result.loading) {
          console.debug('still loading...');
          return;
        }
        // console.debug('nomination stats result', result.data);
        let stats: IValidatorStats[] = []
        result.data.exposureStats.forEach((stat: IValidatorStats) => {
          var dateHour: string = ''
          try {
            const datestr = stat.dateHour.substring(0, 10).replace(/\./g, '/') + ' ' + stat.dateHour.substring(11, 13) + ':00:00'
            //console.debug('datestr', datestr);
            dateHour = moment(datestr).format('YYYY-MM-DD HH:mm')
          } catch (err) { console.error(err) }
          // console.debug('dateHour', dateHour);
          stats.push({
            ...stat,
            dateHour: dateHour,
            exposureNon: stat.exposureNon / Math.pow(10, decimals.value as number),
            exposureDn: stat.exposureDn / Math.pow(10, decimals.value as number),
          })
        })
        validatorStats.value = stats
        //console.debug('nomination stats', nominationStats.value);
      });

      onError((error: any) => {
        console.error(error)
      })

      const { error: dnError, loading: dnLoading, refetch: dnRefetch, onResult: dnResult } = useQuery(QUERY_DM_NOMINATORS, {
        chainId: props.chainId,
        cohortId: cohortId.value,
        stash: props.stash
      });
      refetchDn = dnRefetch

      watch(() => dnLoading.value, (newVal) => {
        console.debug('dn loading', newVal)
        loadingH.value = newVal
      })

      dnResult((result: any) => {
        console.debug('dn result', result);
        if (result.loading) {
          console.debug('still loading dn nominators...');
          return;
        }
        dnNominators.value = result.data.nominators
      })

      doRefetch()
      watch(() => props.reload, (newVal) => {
        console.debug('reload', newVal)
        doRefetch()
      })

    })

    const doRefetch = () => {
      console.debug('doRefetch')
      getExposure()
      refetch()
    }

    return {
      exposure,
      decimals,
      decimalPlaces,
      loadingH,
      loadingE,
      dnNominators,
      chartData,
      chartOptions,
      validatorStats,
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
