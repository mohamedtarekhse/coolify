import { prisma } from '@rigways/db';

import { sendPushNotification } from '../lib/web-push.js';

export async function createNotification(
  userId: string,
  type: string,
  title: string,
  body: string,
  refType: string,
  refId: string,
) {
  await prisma.notification.create({
    data: {
      userId,
      type,
      title,
      body,
      refType,
      refId,
      isRead: false,
    },
  });
}

export async function notifyRoles(
  roles: string[],
  type: string,
  title: string,
  body: string,
  refType: string,
  refId: string,
  excludeUserIds: string[] = [],
) {
  const excluded = new Set(excludeUserIds.filter(Boolean));
  const users = await prisma.user.findMany({
    where: {
      role: { in: roles as never[] },
      isActive: true,
    },
    select: { id: true },
    take: 300,
  });

  for (const user of users) {
    if (excluded.has(user.id)) continue;
    await createNotification(user.id, type, title, body, refType, refId);
    await sendPushToUser(user.id, { title, body, url: '/notifications.html', tag: `${type}-${refId}` });
  }
}

export async function sendPushToUser(userId: string, payload: Record<string, unknown>) {
  const subscriptions = await prisma.pushSubscription.findMany({
    where: { userId },
  });

  for (const sub of subscriptions) {
    const result = await sendPushNotification(
      {
        endpoint: sub.endpoint,
        keys: { p256dh: sub.p256dh, auth: sub.auth },
      },
      payload,
    );
    if (result.gone) {
      await prisma.pushSubscription.delete({ where: { id: sub.id } }).catch(() => {});
    }
  }
}

export async function sendPushToRoles(roles: string[], payload: Record<string, unknown>, excludeUserId?: string | null) {
  const subscriptions = await prisma.pushSubscription.findMany({
    where: {
      user: {
        role: { in: roles as never[] },
        isActive: true,
      },
    },
  });

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
      await prisma.pushSubscription.delete({ where: { id: sub.id } }).catch(() => {});
    }
  }
}
