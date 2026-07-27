import { client } from "./client";

export interface Notification {
  id: string;
  userId: string;
  title: string;
  message: string | null;
  type: string;
  referenceId: string | null;
  isRead: boolean;
  createdAt: string;
  updatedAt: string;
}

interface NotificationResponse {
  count: number;
}

export async function fetchNotifications(unreadOnly = false): Promise<Notification[]> {
  const { data } = await client.get("/api/notifications/", {
    params: { unread_only: unreadOnly },
  });
  return data;
}

export async function getUnreadCount(): Promise<number> {
  const { data } = await client.get<NotificationResponse>("/api/notifications/unread-count");
  return data.count;
}

export async function markAsRead(notificationId: string): Promise<Notification> {
  const { data } = await client.patch(`/api/notifications/${notificationId}/read`);
  return data;
}

export async function markAllAsRead(): Promise<void> {
  await client.patch("/api/notifications/read-all");
}

export async function deleteNotification(notificationId: string): Promise<void> {
  await client.delete(`/api/notifications/${notificationId}`);
}
