<template>
  <div class="navbar bg-base-100 sticky top-0 z-50">
    <div class="flex-1">
      <router-link class="btn btn-ghost normal-case text-xl" to="/">C2C Data Platform</router-link>
    </div>
    <div class="flex-none">
      <ul class="menu menu-horizontal p-0">
        <li tabindex="0">
          <a>
            Wind
            <svg
              class="fill-current"
              xmlns="http://www.w3.org/2000/svg"
              width="20"
              height="20"
              viewBox="0 0 24 24"
            >
              <path
                d="M7.41,8.58L12,13.17L16.59,8.58L18,10L12,16L6,10L7.41,8.58Z"
              />
            </svg>
          </a>
          <ul class="p-2 bg-base-100">
            <li><router-link to="/WindTool">Wind Tool</router-link></li>
            <li><a>Wind Data Sources</a></li>
          </ul>
        </li>
        <li tabindex="0">
          <a
            >Solar
            <svg
              class="fill-current"
              xmlns="http://www.w3.org/2000/svg"
              width="20"
              height="20"
              viewBox="0 0 24 24"
            >
              <path
                d="M7.41,8.58L12,13.17L16.59,8.58L18,10L12,16L6,10L7.41,8.58Z"
              />
            </svg>
          </a>
          <ul class="p-2 bg-base-100">
            <li><a>Solar Tool</a></li>
            <li><a>Solar Data Sources</a></li>
          </ul>
        </li>
        <li><a>About</a></li>
      </ul>
    </div>
  </div>
</template>

<script>
export default {
  name: "NavigationMenu",
};
</script>

<style scoped>
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