const getElement451BaseUrl = () => {
  return (process.env.NEXT_PUBLIC_ELEMENT451_URL || process.env.ELEMENT451_URL || '').replace(/\/$/, '');
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

const buildElementUrl = (path: string) => {
  const baseUrl = getElement451BaseUrl();
  const token = process.env.ELEMENT451_FEATURE_TOKEN || '';

  if (!baseUrl || !token) {
    return null;
  }

  const url = new URL(path.replace(/^\//, ''), `${baseUrl}/`);
  url.searchParams.set('feature', token);

  return url;
};

const readPayloadFromResponse = (body: any): Record<string, any> | null => {
  if (Array.isArray(body)) {
    return body[0] && typeof body[0] === 'object' ? body[0] : null;
  }

  if (!body || typeof body !== 'object') {
    return null;
  }

  if (Array.isArray(body.data)) {
    return body.data[0] && typeof body.data[0] === 'object' ? body.data[0] : null;
  }

  const objectContainers = ['data', 'event', 'item', 'result'];

  for (const key of objectContainers) {
    if (body[key] && typeof body[key] === 'object') {
      return body[key];
    }
  }

  return body;
};

const fetchPayloadByGuid = async (externalId: string) => {
  const url = buildElementUrl(`/v2/events/list/${encodeURIComponent(externalId)}`);

  if (!url) {
    strapi.log.warn(
      '[element-event] Missing NEXT_PUBLIC_ELEMENT451_URL (or ELEMENT451_URL) or ELEMENT451_FEATURE_TOKEN. Skipping payload resolution.'
    );
    return null;
  }
  try {
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        Accept: 'application/json',
      },
    });

    if (!response.ok) {
      return null;
    }

    const body = await parseResponseBody(response);
    return readPayloadFromResponse(body);
  } catch {
    return null;
  }
};

const normalizeExternalId = (value: unknown) => {
  return typeof value === 'string' && value.trim().length > 0 ? value.trim() : null;
};

const shouldResolvePayload = (data: Record<string, any>) => {
  return !!(data && typeof data === 'object');
};

const resolveExternalIdForUpdate = async (event: any, data: Record<string, any>) => {
  const fromData = normalizeExternalId(data.external_id);

  if (fromData) {
    return fromData;
  }

  const where = event?.params?.where;

  if (!where || typeof where !== 'object') {
    return null;
  }

  const existing = await strapi.db.query('api::element-event.element-event').findOne({
    where,
    select: ['external_id'],
  });

  return normalizeExternalId(existing?.external_id);
};

const resolvePayloadByExternalId = async (data: Record<string, any>) => {
  const externalId = data.external_id?.trim();

  if (!externalId) {
    return;
  }

  const payload = await fetchPayloadByGuid(externalId);
  data.payload = payload;
};

export default {
  async beforeCreate(event) {
    const data = event.params?.data;

    if (shouldResolvePayload(data)) {
      try {
        const externalId = normalizeExternalId(data.external_id);

        if (externalId) {
          data.external_id = externalId;
          await resolvePayloadByExternalId(data);
        }
      } catch (error) {
        strapi.log.warn(
          `[element-event] Payload resolution failed for ${data?.external_id ?? 'unknown'}: ${error.message}`
        );
      }
    }
  },

  async beforeUpdate(event) {
    const data = event.params?.data;

    if (shouldResolvePayload(data)) {
      try {
        const externalId = await resolveExternalIdForUpdate(event, data);

        if (externalId) {
          data.external_id = externalId;
          await resolvePayloadByExternalId(data);
        }
      } catch (error) {
        strapi.log.warn(
          `[element-event] Payload resolution failed for ${data?.external_id ?? 'unknown'}: ${error.message}`
        );
      }
    }
  },
};
