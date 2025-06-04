// 'use client'

// import { useEffect, useRef, useState } from 'react'
// import useLivemusic from '../hooks/useLivemusic'

// interface NowPlayingData {
//   title: string
//   file_url: string | null
//   start_offset: number
// }

// export default function NowPlaying() {
//   const echoRef = useRef<any>(null)
//   const audioRef = useRef<HTMLAudioElement | null>(null)
//   const [nowPlaying, setNowPlaying] = useState<NowPlayingData | null>(null)
//   const { url, message, isLoading, isError, mutate }  = useLivemusic();
  
// console.log(url);
//   useEffect(() => {
//     const initEcho = async () => {
//       const Echo = (await import('laravel-echo')).default
//       const Pusher = (await import('pusher-js')).default

//       // @ts-ignore
//       window.Pusher = Pusher

//       const echo = new Echo({
//         broadcaster: 'pusher',
//         key: process.env.NEXT_PUBLIC_REVERB_APP_KEY || 'a8b3tiure46hfnkis0gy',
//         cluster: 'mt1',
//         wsHost: process.env.NEXT_PUBLIC_REVERB_HOST || 'localhost',
//         wsPort: Number(process.env.NEXT_PUBLIC_REVERB_PORT) || 6001,
//         forceTLS: false,
//         disableStats: true,
//         enabledTransports: ['ws'],
//       })

//       echoRef.current = echo

//       echo.connector.pusher.connection.bind('connected', () => {
//         console.log('✅ Echo connected to WebSocket server')
//       })

//       echo.connector.pusher.connection.bind('error', (err: any) => {
//         console.error('❌ Echo connection error:', err)
//       })

//       echo.connector.pusher.connection.bind('state_change', (states: any) => {
//         console.log('🔄 Echo state changed:', states)
//       })

//       echo.channel('now-playing').listen('.NowPlayingEvent', (event: any) => {
//         console.log('🎧 Received song event:', event)

//         setNowPlaying({
//           title: event.title,
//           file_url: event.file_url ?? null,
//           start_offset: event.start_offset ?? 0,
//         })
//       })
//     }

//     initEcho()

//     return () => {
//       echoRef.current?.leave('now-playing')
//     }
//   }, [])

//   useEffect(() => {
//     if (nowPlaying && audioRef.current && nowPlaying.file_url) {
//       const audio = audioRef.current

//       // If already loaded and playable, seek immediately
//       if (audio.readyState >= 2) {
//         audio.currentTime = nowPlaying.start_offset
//       } else {
//         // Wait until audio is ready before seeking
//         const onCanPlay = () => {
//           audio.currentTime = nowPlaying.start_offset
//           audio.removeEventListener('canplay', onCanPlay)
//         }
//         audio.addEventListener('canplay', onCanPlay)
//       }

//       audio.play().catch((err) => {
//         console.error('⚠️ Audio play error:', err)
//       })
//     }
//   }, [nowPlaying])

//   return (
//     <div className="p-4 border rounded shadow text-black">
//       <h2 className="text-lg font-bold mb-2">Now Playing</h2>
//       {nowPlaying ? (
//         <div>
//           <p>🎵 <strong>{nowPlaying.title}</strong></p>
//           {nowPlaying.file_url ? (
//             <audio
//               ref={audioRef}
//               src={nowPlaying.file_url}
//               controls
//               autoPlay
//               className="mt-2 w-full"
//               onError={() => console.error('⚠️ Failed to load audio file')}
//             />
//           ) : (
//             <p className="text-red-600 mt-2">⚠️ Audio file not available</p>
//           )}
//         </div>
//       ) : (
//         <p>Waiting for broadcast...</p>
//       )}
//     </div>
//   )
// }
'use client';

import { useEffect, useRef, useState } from "react";
import useLivemusic from '../hooks/useLiveMusic';

export default function NowPlaying() {
  const { title, fileUrl, startedAt, isLoading, isError } = useLivemusic();
  const audioRef = useRef<HTMLAudioElement>(null);
  const [offset, setOffset] = useState(0);
  const [userInteracted, setUserInteracted] = useState(false);

  // Calculate offset once data is ready
  useEffect(() => {
    if (fileUrl && startedAt) {
      const now = Math.floor(Date.now() / 1000);
      setOffset(Math.max(now - startedAt, 0));
    }
  }, [fileUrl, startedAt]);

  // Play audio after user interaction
  const handleUserStart = () => {
    if (!audioRef.current) return;
    setUserInteracted(true);

    const audio = audioRef.current;
    if (audio.readyState >= 2) {
      audio.currentTime = offset;
      audio.play().catch((err) => console.error("Playback failed:", err));
    } else {
      audio.addEventListener('loadedmetadata', () => {
        audio.currentTime = offset;
        audio.play().catch((err) => console.error("Playback failed:", err));
      }, { once: true });
    }
  };

  if (isLoading) return <p>Loading...</p>;
  if (isError) return <p>Error loading song</p>;

  return (
    <div className="p-4 border rounded shadow text-black">
      <h2 className="text-lg font-bold mb-2">Now Playing</h2>
      {title && fileUrl ? (
        <div>
          <p>🎵 <strong>{title}</strong></p>
          {!userInteracted && (
            <button
              onClick={handleUserStart}
              className="mt-3 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
            >
              ▶ Start Playback
            </button>
          )}
          <audio
            ref={audioRef}
            src={fileUrl}
            controls
            className="mt-2 w-full"
          />
        </div>
      ) : (
        <p>No song currently playing</p>
      )}
    </div>
  );
}
