import Vue from 'vue';
import Router from 'vue-router';

Vue.use(Router);

export default new Router({
  routes: [
    {
      path: '/',
      redirect: '/home',
    },

    {
      path: '/home',
      name: 'home',
      component: require('@/components/home-page').default,
    },

    {
      path: '/award',
      name: 'award',
      component: require('@/components/award-page').default,
    },

    {
      path: '/driver',
      name: 'driver',
      component: require('@/components/driver-page').default,
    },

    {
      path: '/luckdraw',
      name: 'luckdraw',
      component: require('@/components/luckdraw-page').default,
    },

    {
      path: '/debug',
      name: 'debug',
      component: require('@/components/debug-page').default,
    },

    {
      path: '*',
      redirect: '/home',
    },
  ],
});
