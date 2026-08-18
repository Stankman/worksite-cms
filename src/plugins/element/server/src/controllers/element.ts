const sync = async (ctx) => {
  const result = await strapi.plugin('element').service('element').syncEvents();
  ctx.body = result;
};

const refreshLinked = async (ctx) => {
  const result = await strapi.plugin('element').service('element').refreshLinkedEvents();
  ctx.body = result;
};

export default {
  sync,
  refreshLinked,
};
