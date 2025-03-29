<template>
  <v-container>
    {{ chartData }}
    <Bar :data="chartData" />
  </v-container>
</template>

<script lang="ts">

import { Bar } from 'vue-chartjs'
import { Chart as ChartJS, Title, Tooltip, Legend, BarElement, CategoryScale, LinearScale } from 'chart.js';

ChartJS.register(Title, Tooltip, Legend, BarElement, CategoryScale, LinearScale)

export default defineComponent({
  extends: Bar,
  props: {
    sessions: {
      type: Array,
      required: true
    },
    // data: {
    //   type: Object,
    //   required: true
    // },
    // options: {
    //   type: Object,
    //   required: true
    // }
  },
  components: {
    Bar
  },
  setup (props) {
    // onMounted () {
    //   this.renderChart(this.data, this.options)
    // }
    const chartData = computed(() => {
      return {
        labels: ['January', 'February', 'March'],
        datasets: [
          {
            label: 'Data One',
            backgroundColor: '#f87979',
            data: [40, 20, 12]
          }
        ]
      }
    })
    return {
      chartData,
    }
  },
})
</script>