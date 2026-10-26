import PusherClient from 'pusher-js';

let pusherClientInstance: PusherClient | null = null;

export const getPusherClient = (): PusherClient | null => {
  if (typeof window === 'undefined') return null;

  const key = process.env.NEXT_PUBLIC_PUSHER_KEY || '723d06c12d70a5c1acc8';
  const cluster = process.env.NEXT_PUBLIC_PUSHER_CLUSTER || 'ap2';

  if (!key) return null;

  if (!pusherClientInstance) {
    pusherClientInstance = new PusherClient(key, {
      cluster,
    });
  }

  return pusherClientInstance;
};
