import api from "./client";

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
  const { data } = await api.get("/api/notifications/", {
    params: { unread_only: unreadOnly },
  });
  return data;
}

export async function getUnreadCount(): Promise<number> {
  const { data } = await api.get<NotificationResponse>("/api/notifications/unread-count");
  return data.count;
}

export async function markAsRead(notificationId: string): Promise<Notification> {
  const { data } = await api.patch(`/api/notifications/${notificationId}/read`);
  return data;
}

export async function markAllAsRead(): Promise<void> {
  await api.patch("/api/notifications/read-all");
}

export async function deleteNotification(notificationId: string): Promise<void> {
  await api.delete(`/api/notifications/${notificationId}`);
}
