import {
  countUnreadNotifications,
  createNotification,
  deleteNotification,
  findNotificationById,
  findUsersByRoles,
  listNotifications,
  markAllNotificationsRead,
  updateNotification,
} from './notifications.repository.js';

export async function getUnreadCount(userId: string) {
  return { count: await countUnreadNotifications(userId) };
}

export async function markAllRead(userId: string) {
  await markAllNotificationsRead(userId);
  return { marked: true };
}

export async function getNotifications(userId: string, query: URLSearchParams) {
  const limit = Math.min(Number(query.get('limit') || 50), 200);
  const offset = Number(query.get('offset') || 0);
  const unreadOnly = query.get('unread') === 'true';

  return {
    notifications: await listNotifications(userId, unreadOnly, limit, offset),
    limit,
    offset,
  };
}

export async function patchNotificationRecord(id: string, userId: string, body: Record<string, unknown>) {
  const notification = await findNotificationById(id);
  if (!notification) return null;
  if (notification.userId !== userId) return 'FORBIDDEN';

  const patch: Record<string, unknown> = {};
  if (typeof body.is_read === 'boolean') {
    patch.isRead = body.is_read;
    patch.readAt = body.is_read ? new Date() : null;
  }
  if (!Object.keys(patch).length) throw new Error('No fields to update');

  return updateNotification(id, patch);
}

export async function removeNotification(id: string, userId: string) {
  const notification = await findNotificationById(id);
  if (!notification) return null;
  if (notification.userId !== userId) return 'FORBIDDEN';
  await deleteNotification(id);
  return { id, deleted: true };
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
  const users = await findUsersByRoles(roles);
  const recipients = users.map((user) => user.id).filter((id) => !excluded.has(id));

  await Promise.allSettled(
    recipients.map((userId) =>
      createNotification({
        userId,
        type,
        title,
        body,
        refType,
        refId,
        isRead: false,
      }),
    ),
  );
}
