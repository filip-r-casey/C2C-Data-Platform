import { createRouter, createWebHistory } from "vue-router";
import HomePage from "../views/HomePage.vue";
import WindTool from "../views/WindTool.vue";

const routes = [
  {
    path: "/",
    name: "HomePage",
    component: HomePage,
  },
  {
    path: "/WindTool",
    name: "WindTool",
    component: WindTool,
  },
];

const router = createRouter({
  history: createWebHistory(process.env.BASE_URL),
  routes,
});

export default router;
