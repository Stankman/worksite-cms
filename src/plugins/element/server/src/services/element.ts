import type { NormalizedElementEvent } from '../types';

const EVENTS_ENDPOINT = '/v2/events/list';

const getElement451BaseUrl = () => {
  return (process.env.NEXT_PUBLIC_ELEMENT451_URL || process.env.ELEMENT451_URL || '').replace(/\/$/, '');
};

const getElementConfig = () => {
  const baseUrl = getElement451BaseUrl();
  const token = process.env.ELEMENT451_FEATURE_TOKEN || '';

  if (!baseUrl || !token) {
    throw new Error('Missing NEXT_PUBLIC_ELEMENT451_URL (or ELEMENT451_URL) or ELEMENT451_FEATURE_TOKEN');
  }

  return { baseUrl, token };
};

const hasElementConfig = () => {
  const baseUrl = getElement451BaseUrl().trim();
  const token = (process.env.ELEMENT451_FEATURE_TOKEN || '').trim();

  return Boolean(baseUrl && token);
};

const getAuthHeaders = (token: string) => ({
  Accept: 'application/json',
});

const buildElementUrl = (path: string, token: string) => {
  const baseUrl = getElement451BaseUrl();

  if (!baseUrl || !token) {
    return null;
  }

  const url = new URL(path.replace(/^\//, ''), `${baseUrl}/`);
  url.searchParams.set('feature', token);

  return url;
};

const parseResponseBody = async (response: Response) => {
  const rawText = await response.text();

  if (!rawText.trim()) {
    return null;
  }

  try {
    return JSON.parse(rawText);
  } catch {
    return {
      raw: rawText,
      status: response.status,
      statusText: response.statusText,
    };
  }
};

const parseConcurrency = () => {
  const rawValue = Number(process.env.ELEMENT451_REFRESH_CONCURRENCY || 3);

  if (!Number.isFinite(rawValue) || rawValue < 1) {
    return 3;
  }

  return Math.min(Math.floor(rawValue), 10);
};

const runWithConcurrency = async <T>(
  items: T[],
  concurrency: number,
  worker: (item: T) => Promise<void>
) => {
  let currentIndex = 0;

  const queue = new Array(Math.min(concurrency, items.length)).fill(null).map(async () => {
    while (currentIndex < items.length) {
      const item = items[currentIndex];
      currentIndex += 1;
      await worker(item);
    }
  });

  await Promise.all(queue);
};

const normalizeExternalId = (value: unknown) => String(value ?? '').trim();

const extractExternalId = (event: Record<string, any>) => {
  const candidates = [
    event.external_id,
    event.guid,
    event.id,
    event.event_id,
    event.uuid,
    event.slug,
    event.code,
  ];

  for (const candidate of candidates) {
    const id = normalizeExternalId(candidate);

    if (id) {
      return id;
    }
  }

  return '';
};

const readEventsFromBody = (body: any): any[] => {
  if (Array.isArray(body)) {
    return body;
  }

  if (!body || typeof body !== 'object') {
    return [];
  }

  const containers = ['events', 'data', 'results', 'items'];

  for (const key of containers) {
    if (Array.isArray(body[key])) {
      return body[key];
    }
  }

  return [];
};

const readSingleEventFromBody = (body: any): Record<string, any> | null => {
  if (Array.isArray(body)) {
    return typeof body[0] === 'object' && body[0] !== null ? body[0] : null;
  }

  if (!body || typeof body !== 'object') {
    return null;
  }

  const firstFromContainer = readEventsFromBody(body)[0];

  if (firstFromContainer && typeof firstFromContainer === 'object') {
    return firstFromContainer;
  }

  if (body.data && typeof body.data === 'object') {
    return body.data;
  }

  const objectContainers = ['event', 'item', 'result'];

  for (const key of objectContainers) {
    if (body[key] && typeof body[key] === 'object') {
      return body[key];
    }
  }

  return body;
};

const mapEvent = (event: Record<string, any>): NormalizedElementEvent | null => {
  const externalId = extractExternalId(event);

  if (!externalId) {
    return null;
  }

  return {
    externalId,
    payload: event,
  };
};

const fetchEvents = async () => {
  const { token } = getElementConfig();
  const url = buildElementUrl(EVENTS_ENDPOINT, token);

  if (!url) {
    throw new Error('Missing NEXT_PUBLIC_ELEMENT451_URL (or ELEMENT451_URL) or ELEMENT451_FEATURE_TOKEN');
  }

  const response = await fetch(url, {
    method: 'GET',
    headers: getAuthHeaders(token),
  });

  if (!response.ok) {
    throw new Error(`Element451 responded with ${response.status} ${response.statusText}`);
  }

  const body = await parseResponseBody(response);
  return readEventsFromBody(body)
    .map((event) => mapEvent(event))
    .filter((event): event is NormalizedElementEvent => Boolean(event));
};

const fetchEventByGuid = async (guid: string) => {
  const normalizedGuid = normalizeExternalId(guid);

  if (!normalizedGuid) {
    return null;
  }

  const { token } = getElementConfig();
  const url = buildElementUrl(`${EVENTS_ENDPOINT}/${encodeURIComponent(normalizedGuid)}`, token);

  if (!url) {
    throw new Error('Missing NEXT_PUBLIC_ELEMENT451_URL (or ELEMENT451_URL) or ELEMENT451_FEATURE_TOKEN');
  }

  const response = await fetch(url, {
    method: 'GET',
    headers: getAuthHeaders(token),
  });

  if (!response.ok) {
    if (response.status === 404) {
      return null;
    }

    throw new Error(`Element451 responded with ${response.status} ${response.statusText}`);
  }

  const body = await parseResponseBody(response);
  const rawEvent = readSingleEventFromBody(body);

  if (!rawEvent) {
    return null;
  }

  const mapped = mapEvent(rawEvent);

  if (mapped) {
    return mapped;
  }

  return {
    externalId: normalizedGuid,
    payload: rawEvent,
  };
};

const upsertEvents = async (events: NormalizedElementEvent[]) => {
  const query = strapi.db.query('api::element-event.element-event');

  let created = 0;
  let updated = 0;

  for (const event of events) {
    const existing = await query.findOne({
      where: { external_id: event.externalId },
    });

    const data = {
      external_id: event.externalId,
      payload: event.payload,
      publishedAt: new Date(),
    };

    if (existing?.id) {
      await query.update({
        where: { id: existing.id },
        data,
      });
      updated += 1;
    } else {
      await query.create({ data });
      created += 1;
    }
  }

  return { created, updated };
};

export default () => ({
  async findEventByExternalId(externalId: string) {
    if (!hasElementConfig()) {
      strapi.log.warn('[element] Missing ELEMENT451_URL or ELEMENT451_FEATURE_TOKEN. Payload resolution skipped.');
      return null;
    }

    try {
      return await fetchEventByGuid(externalId);
    } catch (error) {
      strapi.log.error(`[element] Failed to resolve payload for guid ${externalId}: ${error.message}`);
      return null;
    }
  },

  async syncEvents() {
    const startedAt = new Date().toISOString();

    const events = await fetchEvents();
    const { created, updated } = await upsertEvents(events);

    const result = {
      startedAt,
      fetched: events.length,
      created,
      updated,
      finishedAt: new Date().toISOString(),
    };

    strapi.log.info(`[element] Sync complete. fetched=${result.fetched} created=${created} updated=${updated}`);

    return result;
  },

  async refreshLinkedEvents() {
    const startedAt = new Date().toISOString();

    if (!hasElementConfig()) {
      strapi.log.warn('[element] Missing ELEMENT451_URL or ELEMENT451_FEATURE_TOKEN. Linked payload refresh skipped.');

      return {
        startedAt,
        scanned: 0,
        refreshed: 0,
        skipped: 0,
        failed: 0,
        finishedAt: new Date().toISOString(),
      };
    }

    const query = strapi.db.query('api::element-event.element-event');
    const records = await query.findMany({
      select: ['id', 'external_id'],
    });

    const linkedRecords = records.filter((record) => normalizeExternalId(record.external_id));
    const concurrency = parseConcurrency();

    const stats = {
      refreshed: 0,
      skipped: 0,
      failed: 0,
    };

    await runWithConcurrency(linkedRecords, concurrency, async (record) => {
      const externalId = normalizeExternalId(record.external_id);

      if (!externalId) {
        stats.skipped += 1;
        return;
      }

      try {
        const latestEvent = await fetchEventByGuid(externalId);

        if (!latestEvent?.payload) {
          stats.skipped += 1;
          return;
        }

        await query.update({
          where: { id: record.id },
          data: {
            payload: latestEvent.payload,
            publishedAt: new Date(),
          },
        });

        stats.refreshed += 1;
      } catch (error) {
        stats.failed += 1;
        strapi.log.warn(`[element] Refresh failed for guid ${externalId}: ${error.message}`);
      }
    });

    const result = {
      startedAt,
      scanned: linkedRecords.length,
      refreshed: stats.refreshed,
      skipped: stats.skipped,
      failed: stats.failed,
      finishedAt: new Date().toISOString(),
    };

    strapi.log.info(
      `[element] Linked refresh complete. scanned=${result.scanned} refreshed=${result.refreshed} skipped=${result.skipped} failed=${result.failed}`
    );

    return result;
  },
});
