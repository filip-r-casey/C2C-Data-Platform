<template>
  <div ref="container" class="flex h-screen justify-center items-center mt-10">
    <div class="h-96 w-2/3 overflow-x-auto" id="dataView">
      <table class="table table-compact w-full">
        <tbody>
          <tr>
            <th>Timestamp</th>
            <th>NASA POWER Wind Speed</th>
            <th>NASA POWER Wind Direction</th>
            <th v-if="'data' in response.data.data_sources.NWS">NWS Wind Speed</th>
            <th v-if="'data' in response.data.data_sources.NWS">NWS Wind Direction</th>
          </tr>
          <tr v-for="timestamp in tableTimestamps(JSON.parse(response.config.data).start, JSON.parse(response.config.data).end)"
              :key="timestamp">
            <td>
              {{timestamp}}
            </td>
            <td>
              {{response.data.data_sources.NASA.data.wind_speed[timestamp]}}
            </td>
            <td>
              {{response.data.data_sources.NASA.data.wind_direction[timestamp]}}
            </td>
          </tr>
        </tbody>
      </table>
    </div>
    <div class="h-96 w-1/3 overflow-x-auto">
      <table class="table table-compact w-full">
        <tbody>
          <tr>
            <th>Data Source</th>
            <th>CSV Download</th>
          </tr>
          <template v-for="data_source in Object.keys(response.data.data_sources)">
            <tr v-if="'data' in response.data.data_sources[data_source]" :key="'dataSource'+data_source">
              <td>{{data_source}}</td>
              <td><a :href="response.data.data_sources[data_source].data.url">.csv</a></td>
            </tr>
          </template>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script>
import { ref, onMounted } from '@vue/runtime-core';
import { useResponseStore } from '@/stores/ResponseStore';
export default {
  name: "RequestWindData",
  props: {
    msg: String,
  },
  methods: {
    presentData() {
      console.log("DATA");
    },
    tableTimestamps(startDate, endDate) {
      var start = new Date(startDate).getTime();
      const end = new Date(endDate).getTime();
      const dates = [];
      while (start <= end) {
        dates.push(new Date(start).toISOString());
        start += 60*60*1000;
      }
      return dates
    }
  },
  setup() {
    const container = ref(null);
    const responseStore = useResponseStore();
    const response = responseStore.getResponse;
    onMounted(() => {
      console.log(response);
      container.value.scrollIntoView( {behavior: "smooth"})
    })
    return {
      response,
      container
    }
  }
}
</script>

<style scoped>
h3 {
  margin: 40px 0 0;
}
ul {
  list-style-type: none;
  padding: 0;
}
li {
  display: inline-block;
  margin: 0 10px;
}
a {
  color: #42b983;
}
</style>
