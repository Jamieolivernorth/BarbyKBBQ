import { useState, useEffect } from 'react';
import { SlotAvailability } from '@shared/schema';

export function useAvailability() {
  const [availability, setAvailability] = useState<SlotAvailability[]>([]);
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const wsUrl = `${protocol}//${window.location.host}/ws`;
    const socket = new WebSocket(wsUrl);

    socket.onopen = () => {
      console.log('Connected to availability tracker');
      setIsConnected(true);
    };

    socket.onmessage = (event) => {
      const message = JSON.parse(event.data);
      if (message.type === 'availability_update') {
        setAvailability(message.data);
      }
    };

    socket.onclose = () => {
      console.log('Disconnected from availability tracker');
      setIsConnected(false);
    };

    return () => {
      socket.close();
    };
  }, []);

  return {
    availability,
    isConnected
  };
}
