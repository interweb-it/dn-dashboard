<template>
  <v-container>
    <v-toolbar>
      <v-toolbar-title>[DN] Dashboard - {{ chainId }}</v-toolbar-title>
      <v-spacer></v-spacer>
      <v-btn color="primary" :to="`/${chainId}/cohort/1`">Cohort 1</v-btn>
    </v-toolbar>
  </v-container>
</template>

<script lang="ts">

export default defineComponent({
  name: 'Index',
  setup() {
    const chainId = useRoute().params.chainId as string;
    return {
      chainId,
    };
  },
});
</script>
