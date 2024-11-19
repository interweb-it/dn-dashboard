<template>
      <v-list>
      <v-list-item v-for="(node, key) in nodeList" :key="key" @click="setNode(node)">
        <template v-slot:prepend>
          <v-icon size="large">mdi-card-account-details-outline</v-icon>
        </template>
        <v-list-item-title>
          {{ node[1].NodeDetails.NodeName }}
        </v-list-item-title>
        <v-list-item-subtitle>
          {{ node[0] }}
        </v-list-item-subtitle>
      </v-list-item>
    </v-list>
</template>