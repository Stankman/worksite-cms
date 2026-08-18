import controllers from './server/src/controllers';
import services from './server/src/services';
import routes from './server/src/routes';

const readBoolEnv = (name: string, defaultValue: boolean) => {
  const rawValue = process.env[name];

  if (rawValue === undefined) {
    return defaultValue;
  }

  const normalized = rawValue.trim().toLowerCase();

  if (['1', 'true', 'yes', 'on'].includes(normalized)) {
    return true;
  }

  if (['0', 'false', 'no', 'off'].includes(normalized)) {
    return false;
  }

  return defaultValue;
};

const isValidCronRule = (rule: string) => {
  const parts = rule.trim().split(/\s+/);
  return parts.length >= 5 && parts.length <= 6;
};

const registerCronTask = ({
  strapi,
  key,
  rule,
  task,
  label,
}: {
  strapi: any;
  key: string;
  rule: string;
  task: () => Promise<void>;
  label: string;
}) => {
  if (!isValidCronRule(rule)) {
    strapi.log.warn(`[element] Invalid ${label} cron rule "${rule}". Task not scheduled.`);
    return;
  }

  strapi.cron.add({
    [key]: {
      task,
      options: {
        rule,
      },
    },
  });

  strapi.log.info(`[element] ${label} enabled with rule ${rule}`);
};

const plugin = {
  controllers,
  services,
  routes,
  bootstrap({ strapi }) {
    const syncEnabled = readBoolEnv('ELEMENT451_SYNC_ENABLED', true);
    const linkedRefreshEnabled = readBoolEnv('ELEMENT451_REFRESH_LINKED_ENABLED', true);
    const syncRule = process.env.ELEMENT451_SYNC_CRON || '*/30 * * * *';
    const linkedRefreshRule = process.env.ELEMENT451_REFRESH_LINKED_CRON || '*/20 * * * *';

    if (syncEnabled) {
      registerCronTask({
        strapi,
        key: 'element451Sync',
        rule: syncRule,
        label: 'Scheduled full sync',
        task: async () => {
          try {
            await strapi.plugin('element').service('element').syncEvents();
          } catch (error) {
            strapi.log.error(`[element] Scheduled sync failed: ${error.message}`);
          }
        },
      });
    } else {
      strapi.log.info('[element] Scheduled full sync disabled.');
    }

    if (linkedRefreshEnabled) {
      registerCronTask({
        strapi,
        key: 'element451RefreshLinked',
        rule: linkedRefreshRule,
        label: 'Scheduled linked payload refresh',
        task: async () => {
          try {
            await strapi.plugin('element').service('element').refreshLinkedEvents();
          } catch (error) {
            strapi.log.error(`[element] Scheduled linked refresh failed: ${error.message}`);
          }
        },
      });
    } else {
      strapi.log.info('[element] Scheduled linked payload refresh disabled.');
    }
  },
};

export default plugin;
