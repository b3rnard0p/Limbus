import { createRouter, createWebHistory } from "vue-router";
import PublicMapView from "../views/PublicMapView.vue";
import LoginView from "../views/LoginView.vue";
import AdminMapView from "../views/AdminMapView.vue";
import NotFoundView from "../views/NotFoundView.vue";
import { getToken } from "../services/api";

const router = createRouter({
  history: createWebHistory(),
  routes: [
    {
      path: "/",
      name: "public-map",
      component: PublicMapView
    },
    {
      path: "/login",
      name: "login",
      component: LoginView
    },
    {
      path: "/admin/mapa",
      name: "admin-map",
      component: AdminMapView,
      beforeEnter: () => {
        if (!getToken()) {
          return { name: "login" };
        }

        return true;
      }
    },
    {
      path: "/:pathMatch(.*)*",
      name: "not-found",
      component: NotFoundView
    }
  ]
});

export default router;
