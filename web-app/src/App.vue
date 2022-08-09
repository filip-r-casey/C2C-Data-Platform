<template>
  <NavigationMenu></NavigationMenu>
  <router-view></router-view>
</template>

<script>
import NavigationMenu from "./components/NavigationMenu.vue";

export default {
  name: "App",
  components: {
    NavigationMenu
},
};
</script>

<style>
#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
}
</style>
