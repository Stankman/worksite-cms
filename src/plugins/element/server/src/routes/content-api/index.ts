import element from './element';

export default () => ({
  type: 'content-api',
  routes: [...element.routes],
});
