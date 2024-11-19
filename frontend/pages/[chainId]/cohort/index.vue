<template>
  <v-container>
    <div>
      <h1>Choose Cohort</h1>
      <ul>
        <li> <a :href="`/${chainId}/cohort/1`">Cohort 1</a></li>
      </ul>
    </div>
  </v-container>
</template>

<script lang="ts">

export default defineComponent({
  name: 'ChainHome',
  setup() {
    const route = useRoute()
    const chainId = ref(route.params.chainId)

    return {
      chainId
    }
  }
})
</script>