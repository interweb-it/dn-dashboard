<template>
  <div>
    <l-map
      :zoom="zoom"
      :center="center"
      :style="{height: display.mobile ? '300px' : '500px', width: '100%'}"
      :use-global-leaflet="false"
    >
      <l-tile-layer :url="tileUrl" :attribution="attribution" />
      <l-marker
        v-for="(marker, index) in markers"
        :key="index"
        :lat-lng="[marker.lat, marker.lon]"
      >
        <l-popup>
          <p><strong>{{ marker.name }}</strong><br>
          {{ marker.country }}, {{ marker.city }}
          <!-- <nuxt-link :to="`/${chainId}/validator/${marker.address}`">link</nuxt-link> -->
        </p>
        </l-popup>
      </l-marker>
    </l-map>
  </div>
</template>

<script>
import "leaflet/dist/leaflet.css";
import { LMap, LTileLayer, LMarker, LPopup } from "@vue-leaflet/vue-leaflet";

export default {
  name: "ValidatorMap",
  components: {
    LMap,
    LTileLayer,
    LMarker,
    LPopup,
  },
  props: {
    chainId: {
      type: String,
      required: true,
    },
    validators: {
      type: Array,
      required: false,
      default: () => [],
    },
  },
  setup(props) {
    const display = useDisplay();
    const markers = computed(() => {
      return props.validators.filter(f => f.IPGeo).map((m) => {
        return {
          name: m.NodeDetails.NodeName,
          lat: m.IPGeo?.lat,
          lon: m.IPGeo?.lon,
          country: m.IPGeo?.country,
          city: m.IPGeo?.city,
          // ip: m.IPGeo.query, // do not dox the IP
          // address: m.,
        };
      });
    });

    return {
      display,
      chainId: props.chainId,
      zoom: 2, // Adjust based on your needs
      center: [20, 0], // Latitude, Longitude for the initial map center
      tileUrl: "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
      attribution: 'Map data © <a href="https://openstreetmap.org" target="_blank">OpenStreetMap</a>, IP Geo data © <a href="http://ip-api.com" target="_blank">ip-api.com</a>',
      markers
    };
  }
};
</script>

<style>
/* Fix leaflet icons */
.leaflet-container {
  height: 500px;
  width: 100%;
}
</style>
