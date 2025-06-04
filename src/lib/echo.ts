// // lib/echo.ts
// import Echo from 'laravel-echo';
// import Pusher from 'pusher-js';

// export const createEchoInstance = () => {
//   if (typeof window !== 'undefined') {
//     window.Pusher = Pusher;

//     return new Echo({
//       broadcaster: 'pusher',
//       key: process.env.NEXT_PUBLIC_REVERB_KEY!,
//       wsHost: process.env.NEXT_PUBLIC_REVERB_HOST,
//       wsPort: parseInt(process.env.NEXT_PUBLIC_REVERB_PORT || '8080'),
//       forceTLS: false,
//       disableStats: true,
//       enabledTransports: ['ws'],
//     });
//   }

//   return null;
// };
