export default {
  routes: [
    {
      method: 'POST',
      path: '/sync',
      handler: 'element.sync',
      config: {
        auth: false,
        policies: [],
        middlewares: [],
      },
    },
    {
      method: 'POST',
      path: '/refresh-linked',
      handler: 'element.refreshLinked',
      config: {
        auth: false,
        policies: [],
        middlewares: [],
      },
    },
  ],
};
