<template>
  <v-card>
    <v-card-title>Performance ( c/o <a :href="`https://apps.turboflakes.io/?chain=${chainId}#/validator/${stash}?mode=history`" target="_blank">
        turboflakes.io
        <sup><v-icon size="v-small">mdi-open-in-new</v-icon></sup>
      </a> )
      <v-btn icon flat size="small" @click="onClickRefresh"><v-icon>mdi-refresh</v-icon></v-btn>
      <v-chip size="small" variant="flat" color="#D1C4E9">Para</v-chip>&nbsp;
      <v-chip size="small" variant="flat" color="#F8BBD0">Active</v-chip>&nbsp;
      <v-chip size="small" variant="flat" color="grey">Wait</v-chip>
    </v-card-title>
    <v-card-text>
      <!-- {{ performance }} -->
      <v-row>
        <v-col class="text-center">
          <p>Grade: {{ performance.grade }}</p>
        </v-col>
        <v-col class="text-center">
          <p>Authority: {{ (performance.authority_inclusion * 100).toLocaleString(undefined, {maximumFractionDigits: 2, minimumFractionDigits: 2}) }}%</p>
        </v-col>
        <v-col class="text-center">
          <p>Para: {{ (performance.para_authority_inclusion * 100).toLocaleString(undefined, {maximumFractionDigits: 2, minimumFractionDigits: 2}) }}%</p>
        </v-col>
      </v-row>
      <v-table style="border-collapse: collapse;">
        <tr>
          <td v-for="(c, idx) in performance.sessions_data" 
              v-bind:key="c.session"
              style="padding: 0;" class="text-center">
            <div :style="{ 
              'background-color': c.is_para ? '#D1C4E9' : c.is_auth ? '#F8BBD0' : 'grey', 
              margin: '3px', 
              padding: '10px',
              height: `${ ![' ', '-'].includes(c.grade)? '30px' : '3px'}`,
              width: `${ ![' ', '-'].includes(c.grade)? '30px' : '3px'}`,
              // round border
              // borderRadius: `${ ![' ', '-'].includes(c.grade)? '25%' : '50%'}`,
              fontSize: '0.6em',
              whiteSpace: 'nowrap',
              color: ['A', 'A+'].includes(c.grade)? 'black' : 'red',
            }">
              {{ ![' ', '-'].includes(c.grade) ? c.grade : '' }}
            </div>
          </td>
        </tr>
      </v-table>
    </v-card-text>
  </v-card>
</template>

<script lang="ts">

export default defineComponent({
  name: 'PerformanceCard',
  props: {
    chainId: {
      type: String,
      required: true
    },
    stash: {
      type: String,
      required: true
    },
    performance: {
      type: Object,
      required: true
    }
  },
  // emits: ['refresh'],
  setup(props, { emit }) {

    const onClickRefresh = () => {
      console.debug('refresh')
      emit('refresh')
    }
    const performance = computed(() => props.performance)

    return {
      chainId: props.chainId,
      stash: props.stash,
      performance,
      onClickRefresh
    }
  }
})

</script>

<style scoped>
/* a link no decoration */
a {
  text-decoration: none;
  color: inherit;
  /* text-decoration: underline dashed; */
}
</style>
