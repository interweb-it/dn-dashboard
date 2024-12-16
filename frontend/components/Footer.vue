<template>
  <v-container fluid class="ma-0 pa-0">
    <v-footer border>
    <!-- <v-toolbar color="background">
      Footer
    </v-toolbar> -->
      <v-row>
        <v-col class="text-center">metaspan.io</v-col>
        <v-col align="middle" class="text-center">
          Data from: <a href="https://telemetry.w3f.community" target="_blank">telemetry</a>, 
          DN <a :href="`https://nodes.web3.foundation/api/cohort/${cohortId}/${chainId}`">API</a>
        </v-col>
        <v-col align="middle" class="text-center">Credits: turboflakes.io</v-col>
        <v-col align="end" class="text-center"><a href="https://github.com/metaspan/dn-dashboard" target="_blank"><v-icon>mdi-github</v-icon> github</a></v-col>
      </v-row>
    </v-footer>
  </v-container>
</template>

<script lang="ts">
export default defineComponent ({
  name: 'Footer',
  props: {
    chainId: {
      type: String,
      required: true
    },
    cohortId: {
      type: Number,
      required: true
    }
  },
  setup(props) {
    return {
      chainId: props.chainId,
      cohortId: props.cohortId
    }
  }
})
</script>

<style scoped>
/* links no decoration, no color */
a {
  text-decoration: none;
  color: inherit;
}
</style>