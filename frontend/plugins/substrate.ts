// plugins/substrate.ts

import { defineNuxtPlugin } from '#app';
import SubstrateService from '~/services/substrateService';

export default defineNuxtPlugin(() => {
  const substrateService = new SubstrateService();
  // substrateService.connect();

  // Provide the substrate service globally in the app
  return {
    provide: {
      substrate: substrateService,
    },
  };
});
