<template>
  <v-dialog v-model="showDialog" @update:modelValue="onUpdateModel">
    <v-card>
      <v-card-title>{{ node?.NodeDetails?.NodeName }}</v-card-title>
      {{ node }}
    </v-card>
  </v-dialog>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import { NodeDetailsX } from '../stores/nodeStore';

export default defineComponent({
  props: {
    node: {
      type: Object,
      required: true
    },
    showDialog: {
      type: Boolean,
      required: true
    }
  },
  emits: ['onModelValue'],
  setup(props, { emit }) {
    // console.log(props)
    const nodeId = computed(() => props.node[0])
    const node = computed<NodeDetailsX>(() => props.node[1])
    const showDialog = computed(() => props.showDialog)

    const onUpdateModel = (value: boolean) => {
      console.log(value)
      emit('onModelValue', value)
    }

    return {
      showDialog,
      node,
      onUpdateModel
    }
  }
})
</script>
