<template>
  <router-view></router-view>
  <SourceCarousel></SourceCarousel>
</template>

<script>
import SourceCarousel from "@/components/SourceCarousel.vue";
export default {
  name: "HomePage",
  components: { SourceCarousel },
};
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
