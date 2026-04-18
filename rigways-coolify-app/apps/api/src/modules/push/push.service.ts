import { config } from '../../config.js';
import { sendPushNotification } from '../../lib/web-push.js';
import {
  countPushSubscriptions,
  createPushSubscription,
  deletePushSubscription,
  deletePushSubscriptionById,
  findPushSubscription,
  listPushSubscriptionsByRoles,
  listPushSubscriptionsByUser,
  updatePushSubscription,
} from './push.repository.js';

export async function subscribe(userId: string, userAgent: string | null, body: Record<string, unknown>) {
  const endpoint = String(body.endpoint || '');
  const p256dh = body.keys && typeof body.keys === 'object' ? String((body.keys as any).p256dh || '') : '';
  const auth = body.keys && typeof body.keys === 'object' ? String((body.keys as any).auth || '') : '';
  if (!endpoint || !p256dh || !auth) throw new Error('Missing subscription fields (endpoint, keys.p256dh, keys.auth)');

  const existing = await findPushSubscription(userId, endpoint);
  if (existing) {
    await updatePushSubscription(existing.id, { p256dh, auth, userAgent });
    return { subscribed: true, updated: true };
  }

  await createPushSubscription({ userId, endpoint, p256dh, auth, userAgent });
  return { subscribed: true };
}

export async function unsubscribe(userId: string, body: Record<string, unknown>) {
  const endpoint = String(body.endpoint || '');
  if (!endpoint) throw new Error('Missing endpoint');
  await deletePushSubscription(userId, endpoint);
  return { unsubscribed: true };
}

export async function getStatus(userId: string) {
  const count = await countPushSubscriptions(userId);
  return { subscribed: count > 0, count };
}

export function getVapidPublicKey() {
  return { publicKey: config.vapidPublicKey || '' };
}

export async function sendPushToUser(userId: string, payload: Record<string, unknown>) {
  const subscriptions = await listPushSubscriptionsByUser(userId);
  for (const sub of subscriptions) {
    const result = await sendPushNotification(
      {
        endpoint: sub.endpoint,
        keys: { p256dh: sub.p256dh, auth: sub.auth },
      },
      payload,
    );
    if (result.gone) {
      await deletePushSubscriptionById(sub.id).catch(() => {});
    }
  }
}

export async function sendPushToRoles(roles: string[], payload: Record<string, unknown>, excludeUserId?: string | null) {
  const subscriptions = await listPushSubscriptionsByRoles(roles);
  for (const sub of subscriptions) {
    if (excludeUserId && sub.userId === excludeUserId) continue;
    const result = await sendPushNotification(
      {
        endpoint: sub.endpoint,
        keys: { p256dh: sub.p256dh, auth: sub.auth },
      },
      payload,
    );
    if (result.gone) {
      await deletePushSubscriptionById(sub.id).catch(() => {});
    }
  }
}

export async function batchNotify(userId: string, count: number, message?: string) {
  if (count < 1) throw new Error('Count must be at least 1');
  const payload = {
    title: 'Certificates Uploaded',
    body: message || `${count} certificate${count !== 1 ? 's' : ''} have been uploaded.`,
    url: '/certificates.html',
    tag: 'batch-cert-upload',
  };

  await sendPushToUser(userId, payload);
  await sendPushToRoles(['admin', 'manager'], payload, userId);
  return { notified: true, count };
}

export async function sendTestToUser(userId: string) {
  const payload = {
    title: 'Test Notification',
    body: 'This is a test notification for your device.',
    url: '/notifications.html',
    tag: 'test-push-individual',
  };
  await sendPushToUser(userId, payload);
  return { success: true, message: 'Test notification sent to your device.' };
}

export async function sendTestToRoles(name: string) {
  const payload = {
    title: 'Global Push Test',
    body: `Push test triggered by ${name}.`,
    url: '/notifications.html',
    tag: 'test-push-global',
  };
  await sendPushToRoles(['admin', 'manager'], payload);
  return { success: true, message: 'Global test notification broadcasted to all admins/managers.' };
}

export function getPushDiag(requestUserAgent: string | null) {
  return {
    vapid: {
      public_key_present: config.vapidPublicKey.length > 0,
      private_key_present: config.vapidPrivateKey.length > 0,
      public_key_len: config.vapidPublicKey.length,
      subject: config.vapidSubject || 'Not set',
    },
    cryptoTest: {
      ok: Boolean(config.vapidPublicKey && config.vapidPrivateKey),
      error: null,
      version: 'web-push-node',
    },
    system: {
      timestamp: new Date().toISOString(),
      userAgent: requestUserAgent,
    },
  };
}
