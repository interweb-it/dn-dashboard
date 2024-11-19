<template>
  <v-container>
    <!-- {{ list }} -->
    <v-list>
      <v-list-item v-for="item in list" v-bind:key="item.stash">
        <template v-slot:prepend>
          <identicon :theme="'polkadot'" :value="item.stash" :size="32"></identicon>
        </template>
        <v-list-item-title>{{ item.identity }}</v-list-item-title>
        <v-list-item-subtitle>{{ item.stash }}</v-list-item-subtitle>
        {{ item.status }}
        <template v-slot:append>
          <a :href="`https://${chain}.subscan.io/validator/${item.stash}`" target="_blank">
            <v-img src="/image/subscan-logo.jpg" height="24" width="24" rounded></v-img>
          </a>
          &nbsp;
          <a :href="`https://apps.turboflakes.io/?chain=${chain}#/validator/${item.stash}?mode=history`" target="_blank">
            <v-img src="/image/turboflakes-logo.svg" height="24" width="24" rounded></v-img>
          </a> 
        </template>
      </v-list-item>
    </v-list>
  </v-container>
</template>

<script lang="ts">
// import { defineComponent } from 'vue'
import Identicon from '@polkadot/vue-identicon';
export default defineComponent({
  components: {
    Identicon
  },
  props: {
    chain: {
      type: String,
      required: true
    },
    list: {
      type: Array,
      required: true
    }
  },
  setup(props) {
    const list = computed(() => props.list)
    const chain = computed(() => props.chain)
    return {
      chain,
      list
    }
  }
})
</script>
