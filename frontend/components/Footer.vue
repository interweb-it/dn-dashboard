<template>
  <v-footer border class="bg-grey-lighten-1">
    <v-container fluid class="ma-0 pa-0">
        <!-- <v-toolbar color="background">
      Footer
    </v-toolbar> -->
      <v-row>
        <v-col>
          <v-btn flat variant="text" @click="showRulesDialog = true">[DN Rules]</v-btn>
        </v-col>

        <v-col>
          Data from: <a href="https://telemetry.w3f.community" target="_blank">[telemetry]</a>, 
          [DN <a :href="`https://nodes.web3.foundation/api/cohort/${cohortId}/${chainId}`" target="_blank">API]</a>
        </v-col>

        <v-col>
            Credits: <a href="https://apps.turboflakes.io" target="_blank">[turboflakes.io]</a>
        </v-col>

        <v-col align="middle" class="text-right">
          <p>
            <a href="https://github.com/metaspan/dn-dashboard" target="_blank">[<v-icon>mdi-github</v-icon> github]</a>
          </p>
        </v-col>
      </v-row>

      <v-row>
        <v-col class="text-center">
          {{ new Date().getFullYear() }} — <strong>metaspan.io</strong>
        </v-col>
      </v-row>

    </v-container>
    <rules-dialog :show-rules-dialog="showRulesDialog" @close="onCloseRulesDialog"></rules-dialog>

  </v-footer>
</template>

<script lang="ts">
import RulesDialog from './RulesDialog.vue';
export default defineComponent ({
  name: 'Footer',
  components: {
    RulesDialog
  },
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
    const showRulesDialog = ref(false)

    const onCloseRulesDialog = () => {
      // console.debug('on close dialog')
      showRulesDialog.value = false
    }

    return {
      chainId: props.chainId,
      cohortId: props.cohortId,
      showRulesDialog,
      onCloseRulesDialog
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