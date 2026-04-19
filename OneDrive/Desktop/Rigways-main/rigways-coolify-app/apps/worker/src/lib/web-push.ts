import webpush from 'web-push';

const vapidPublicKey = process.env.VAPID_PUBLIC_KEY || '';
const vapidPrivateKey = process.env.VAPID_PRIVATE_KEY || '';
const vapidSubject = process.env.VAPID_SUBJECT || 'mailto:admin@example.com';

export function configureWebPush() {
  if (!vapidPublicKey || !vapidPrivateKey) return false;
  webpush.setVapidDetails(vapidSubject, vapidPublicKey, vapidPrivateKey);
  return true;
}

export async function sendPushNotification(
  subscription: { endpoint: string; keys: { p256dh: string; auth: string } },
  payload: Record<string, unknown>,
) {
  if (!configureWebPush()) return { ok: false, status: 0, gone: false, skipped: true };

  try {
    await webpush.sendNotification(subscription as never, JSON.stringify(payload));
    return { ok: true, status: 201, gone: false, skipped: false };
  } catch (error: any) {
    const status = Number(error?.statusCode || 0);
    return {
      ok: false,
      status,
      gone: status === 404 || status === 410,
      skipped: false,
    };
  }
}
