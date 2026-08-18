import { useState } from 'react';
import { getFetchClient } from '@strapi/strapi/admin';

type SyncResult = {
  startedAt?: string;
  scanned?: number;
  refreshed?: number;
  skipped?: number;
  failed?: number;
  finishedAt?: string;
};

const App = () => {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<SyncResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const onRefresh = async () => {
    setLoading(true);
    setError(null);

    try {
      const { post } = getFetchClient();
      const response = await post('/api/element-events-refresh-linked');
      setResult(response?.data ?? null);
    } catch (err: any) {
      const message =
        err?.response?.data?.error?.message ||
        err?.response?.data?.message ||
        err?.message ||
        'Failed to refresh linked Element451 payloads.';
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <main style={{ padding: '2rem', maxWidth: 820 }}>
      <h1 style={{ marginBottom: '0.5rem' }}>Element Links</h1>
      <p style={{ marginTop: 0, color: '#666' }}>
        Manually refresh payloads for all linked Element Events.
      </p>

      <button
        type="button"
        onClick={onRefresh}
        disabled={loading}
        style={{
          border: 'none',
          borderRadius: 6,
          padding: '0.7rem 1rem',
          cursor: loading ? 'default' : 'pointer',
          background: '#1f63ff',
          color: '#fff',
          fontWeight: 600,
        }}
      >
        {loading ? 'Refreshing...' : 'Refresh All Links'}
      </button>

      {error ? (
        <pre
          style={{
            marginTop: '1rem',
            background: '#fff1f0',
            color: '#a8071a',
            padding: '1rem',
            borderRadius: 6,
            overflowX: 'auto',
          }}
        >
          {error}
        </pre>
      ) : null}

      {result ? (
        <pre
          style={{
            marginTop: '1rem',
            background: '#f6ffed',
            color: '#135200',
            padding: '1rem',
            borderRadius: 6,
            overflowX: 'auto',
          }}
        >
          {JSON.stringify(result, null, 2)}
        </pre>
      ) : null}
    </main>
  );
};

export default App;
