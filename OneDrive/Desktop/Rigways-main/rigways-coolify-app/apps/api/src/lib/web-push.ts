import webpush from 'web-push';

import { config } from '../config.js';

export function getVapidConfig() {
  return {
    publicKey: config.vapidPublicKey,
    privateKey: config.vapidPrivateKey,
    subject: config.vapidSubject,
  };
}

export function configureWebPush() {
  const vapid = getVapidConfig();
  if (!vapid.publicKey || !vapid.privateKey) return false;
  webpush.setVapidDetails(vapid.subject, vapid.publicKey, vapid.privateKey);
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
