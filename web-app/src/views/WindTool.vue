<template>
  <RequestWindData @request-received="reactToRequest" @response-received="reactToResponse"></RequestWindData>
  <PresentWindData v-if="show_response"></PresentWindData>
  <LoadingBar v-if="loading"></LoadingBar>
</template>

<script>
import RequestWindData from "@/components/RequestWindData.vue"
import PresentWindData from "@/components/PresentWindData.vue"
import LoadingBar from "@/components/LoadingBar.vue"
export default {
  name: "WindTool.vue",
  components:
  {
    RequestWindData,
    PresentWindData,
    LoadingBar
  },
  data () {
    return {
      show_response: false,
      loading: false
    }
  },
  methods:
  {
    reactToRequest() {
      this.loading = true;
      this.show_response = false;
    },
    reactToResponse() {
      this.loading = false;
      this.show_response = true;
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