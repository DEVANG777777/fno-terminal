import { useEffect, useRef, useState } from 'react';

export function useLiveSocket(onTick: (tick: any) => void) {
  const [isConnected, setIsConnected] = useState(false);
  const wsRef = useRef<WebSocket | null>(null);

  useEffect(() => {
    let reconnectTimer: any = null;

    const connect = () => {
      try {
        const ws = new WebSocket('ws://127.0.0.1:8000/ws/feed');
        wsRef.current = ws;

        ws.onopen = () => {
          setIsConnected(true);
        };

        ws.onmessage = (event) => {
          try {
            const data = JSON.parse(event.data);
            onTick(data);
          } catch {}
        };

        ws.onclose = () => {
          setIsConnected(false);
          reconnectTimer = setTimeout(connect, 3000);
        };

        ws.onerror = () => {
          ws.close();
        };
      } catch {
        reconnectTimer = setTimeout(connect, 3000);
      }
    };

    connect();

    return () => {
      if (reconnectTimer) clearTimeout(reconnectTimer);
      if (wsRef.current) wsRef.current.close();
    };
  }, [onTick]);

  return { isConnected };
}
