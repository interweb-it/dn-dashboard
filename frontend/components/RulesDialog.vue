<template>
  <v-dialog v-model="showDialog">
    <v-card>
      <v-toolbar color="background">
        <v-toolbar-title>DN Rules</v-toolbar-title>
        <v-btn flat><a href="https://nodes.web3.foundation/rules" target="_blank">rules are here</a></v-btn>
      </v-toolbar>
      <v-card-title>
      </v-card-title>
      <v-card-text>
        <v-container>
        <h4>These rules have been implemented:</h4>
        <ul>
          <li class="tick">Self bond</li>
          <li class="tick">Rewards Target</li>
          <li class="tick">Commission</li>
          <li class="tick">Telemetry</li>
          <li class="tick">On Chain Id (email & matrix)</li>
          <li class="tick">Performance A/A+? - check <a :href="`https://apps.turboflakes.io/?chain=${chainId}#`" target="_blank">
            apps.turboflakes.io</a> </li>
        </ul>
        <h4>TODO:</h4>
        <ul>
          <li>Payouts</li>
          <li>Hardware -  <a href="https://wiki.polkadot.network/docs/maintain-guides-how-to-validate-polkadot#requirements" target="_blank">requirements</a></li>
          <li>IP4 & IP6</li>
          <li>Client Version - from telemetry (24 hours)</li>
          <li>dedicated machine</li>
          <li>No slashes</li>
        </ul>
      </v-container>
    </v-card-text>
      <v-card-actions>
        <v-spacer></v-spacer>
        <v-btn
          text="Close"
          @click="closeDialog"
        ></v-btn>
      </v-card-actions>
    </v-card>

  </v-dialog>
</template>

<script lang="ts">
export default defineComponent({
  name: 'RulesDialog',
  props: {
    showRulesDialog: {
      type: Boolean,
      required: true
    }
  },
  setup(props, { emit }) {
    const nodeStore = useNodeStore()
    const chainId = computed(() => nodeStore.chainId)

    const showDialog = ref(props.showRulesDialog)
    watch(() => props.showRulesDialog, (val) => {
      showDialog.value = val
    })

    watch(() => showDialog.value, (val) => {
      if (val === false)
      emit('close')
    })

    const closeDialog = () => {
      // console.log('close dialog')
      emit('close')
    }

    return {
      chainId,
      showDialog,
      closeDialog
    }
  }
})
</script>

<style scoped>
/* ul with a checked box */
.tick {
  list-style-type: none;
  /* position: relative; */
  /* padding-left: 0em; */
}
.tick::before {
  content: '✓';
  margin-left: -1.1em;
  margin-right: 0.3em;
}
</style>
