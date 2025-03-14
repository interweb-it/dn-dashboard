<template>
  <v-container>
    <v-toolbar color="background">
      <v-toolbar-title>
        <v-icon size="small"><v-img src="/image/logo-black.png" height="32" width="32"></v-img></v-icon>&nbsp;
        <v-icon size="small"><v-img :src="`/image/${chainId}-logo.svg`" height="22" width="22" rounded></v-img></v-icon> 
        <!-- [DN] Dashboard -  -->
        <!-- {{ chainId }} -->
      </v-toolbar-title>
      <v-btn color="primary" :to="`/${chainId}/cohort/1`">Cohort 1</v-btn>
      <v-btn color="primary" :to="`/${chainId}/cohort/2`">Cohort 2</v-btn>
      <!-- <v-spacer></v-spacer> -->
      <v-btn icon>
        <nuxt-link :to="`/${chainId === 'polkadot' ? 'kusama' : 'polkadot'}`">
            <v-img :src="`/image/${chainId === 'polkadot' ? 'kusama' : 'polkadot'}-logo.svg`" height="22" width="22" rounded></v-img>
        </nuxt-link>
      </v-btn>

    </v-toolbar>
  </v-container>
</template>

<script lang="ts">

export default defineComponent({
  name: 'Index',
  setup() {
    const substrateStore = useSubstrateStore();
    const chainId = useRoute().params.chainId as string;
    substrateStore.setChainId(chainId);

    const { $substrate } = useNuxtApp();

    watch(() => chainId, async  (newChainId) => {
      console.debug(`Connecting to chain ${newChainId}`);
      await $substrate.connect(newChainId);
    });
    
    onMounted(() => {
      console.debug(`Connecting to chain ${chainId}`);
      $substrate.connect(chainId);
    });

    return {
      chainId,
    };
  },
});
</script>
