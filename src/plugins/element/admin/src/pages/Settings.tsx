import { useState } from 'react';

type RefreshResult = {
  startedAt?: string;
  scanned?: number;
  refreshed?: number;
  skipped?: number;
  failed?: number;
  finishedAt?: string;
};

const SettingsPage = () => {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<RefreshResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const refreshAllLinks = async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/element-events-refresh-linked', {
        method: 'POST',
        credentials: 'include',
      });

      const data: any = await response.json().catch(() => null);

      if (!response.ok) {
        const message =
          data?.error?.message ||
          data?.message ||
          `Request failed with status ${response.status}`;
        throw new Error(message);
      }

      setResult(data);
    } catch (err: any) {
      setError(err?.message || 'Failed to refresh linked payloads.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <main style={{ padding: '2rem', maxWidth: 820 }}>
      <h1 style={{ marginBottom: '0.5rem' }}>Element Links</h1>
      <p style={{ marginTop: 0, color: '#666' }}>
        Refresh payloads for all linked Element Events.
      </p>

      <button
        type="button"
        onClick={refreshAllLinks}
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

export default SettingsPage;
