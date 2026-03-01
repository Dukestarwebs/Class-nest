import { useState, useEffect } from 'react';

export const useLiveToken = (roomName: string, participantName: string, role?: string) => {
  const [token, setToken] = useState<string | null>(null);
  const [serverUrl, setServerUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!roomName || !participantName) return;

    const fetchToken = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await fetch('/api/live/token', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ roomName, participantName, role }),
        });

        if (!response.ok) {
          const data = await response.json();
          throw new Error(data.error || 'Failed to fetch token');
        }

        const { token, serverUrl } = await response.json();
        setToken(token);
        setServerUrl(serverUrl);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchToken();
  }, [roomName, participantName]);

  return { token, serverUrl, error, loading };
};
