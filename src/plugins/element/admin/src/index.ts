import React from 'react';
import pluginId from './pluginId';

const Icon = () => {
  return React.createElement('span', { style: { fontWeight: 700 } }, 'E');
};

export default {
  register(app: any) {
    app.addMenuLink({
      to: `/plugins/${pluginId}`,
      icon: Icon,
      intlLabel: {
        id: `${pluginId}.plugin.name`,
        defaultMessage: 'Element451 Integration',
      },
      Component: () => {
        return import('./pages/App.js').then((module) => ({
          default: module.default,
        }));
      },
      permissions: [],
    });

    app.registerPlugin({
      id: pluginId,
      name: 'Element451 Integration',
    });
  },

  bootstrap() {},

  async registerTrads() {
    return [];
  },
};
