// plugins/telemetry.ts

import { defineNuxtPlugin } from '#app';
import TelemetryService from '~/services/telemetryService';

export default defineNuxtPlugin(() => {
  // const telemetryService = new TelemetryService();
  // telemetryService.connect();

  // Provide the telemetry service globally in the app
  return {
    // provide: {
    //   telemetry: telemetryService,
    // },
  };
});
