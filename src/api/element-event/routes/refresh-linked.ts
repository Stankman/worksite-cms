export default {
  routes: [
    {
      method: 'POST',
      path: '/element-events-refresh-linked',
      handler: 'element-event.refreshLinked',
      config: {
        auth: false,
        policies: [],
        middlewares: [],
      },
    },
  ],
};
