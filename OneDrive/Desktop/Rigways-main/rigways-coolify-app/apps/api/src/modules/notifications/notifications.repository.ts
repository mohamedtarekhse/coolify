import { prisma } from '@rigways/db';

export function countUnreadNotifications(userId: string) {
  return prisma.notification.count({
    where: { userId, isRead: false },
  });
}

export function markAllNotificationsRead(userId: string) {
  return prisma.notification.updateMany({
    where: { userId, isRead: false },
    data: { isRead: true, readAt: new Date() },
  });
}

export function listNotifications(userId: string, unreadOnly: boolean, limit: number, offset: number) {
  return prisma.notification.findMany({
    where: {
      userId,
      ...(unreadOnly ? { isRead: false } : {}),
    },
    orderBy: { createdAt: 'desc' },
    skip: offset,
    take: limit,
  });
}

export function findNotificationById(id: string) {
  return prisma.notification.findUnique({
    where: { id },
  });
}

export function updateNotification(id: string, data: Record<string, unknown>) {
  return prisma.notification.update({
    where: { id },
    data: data as never,
  });
}

export function deleteNotification(id: string) {
  return prisma.notification.delete({
    where: { id },
  });
}

export function createNotification(data: Record<string, unknown>) {
  return prisma.notification.create({
    data: data as never,
  });
}

export function findUsersByRoles(roles: string[]) {
  return prisma.user.findMany({
    where: {
      role: { in: roles as never[] },
      isActive: true,
    },
    select: { id: true },
    take: 300,
  });
}
