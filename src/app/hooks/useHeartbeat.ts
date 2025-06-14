'use client';
import { useEffect } from 'react';

export default function useHeartbeat() {
  useEffect(() => {
    const ping = () => {
      fetch(`${process.env.NEXT_PUBLIC_API_URL}/now-playing`);
    };

    ping(); // ping immediately
    const interval = setInterval(ping, 10000); // ping every 30 seconds

    return () => clearInterval(interval);
  }, []);
}
