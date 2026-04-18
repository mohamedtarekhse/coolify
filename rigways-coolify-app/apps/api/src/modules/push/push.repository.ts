import { prisma } from '@rigways/db';

export function findPushSubscription(userId: string, endpoint: string) {
  return prisma.pushSubscription.findFirst({
    where: { userId, endpoint },
  });
}

export function createPushSubscription(data: {
  userId: string;
  endpoint: string;
  p256dh: string;
  auth: string;
  userAgent?: string | null;
}) {
  return prisma.pushSubscription.create({ data });
}

export function updatePushSubscription(id: string, data: Record<string, unknown>) {
  return prisma.pushSubscription.update({
    where: { id },
    data: data as never,
  });
}

export function deletePushSubscription(userId: string, endpoint: string) {
  return prisma.pushSubscription.deleteMany({
    where: { userId, endpoint },
  });
}

export function countPushSubscriptions(userId: string) {
  return prisma.pushSubscription.count({
    where: { userId },
  });
}

export function listPushSubscriptionsByUser(userId: string) {
  return prisma.pushSubscription.findMany({
    where: { userId },
  });
}

export function listPushSubscriptionsByRoles(roles: string[]) {
  return prisma.pushSubscription.findMany({
    where: {
      user: {
        role: { in: roles as never[] },
        isActive: true,
      },
    },
  });
}

export function deletePushSubscriptionById(id: string) {
  return prisma.pushSubscription.delete({
    where: { id },
  });
}
