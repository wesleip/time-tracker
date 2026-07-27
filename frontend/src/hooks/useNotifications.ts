import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import * as notificationsService from "../services/notifications";
import { useTaskNotifications } from "./useTaskNotifications";

export function useNotifications() {
  const { notifications, overdueCount, dueTodayCount, totalCount, isLoading } = useTaskNotifications();
  const queryClient = useQueryClient();

  const unreadCountQuery = useQuery({
    queryKey: ["notifications", "unread-count"],
    queryFn: notificationsService.getUnreadCount,
    retry: false,
    staleTime: Infinity,
  });

  const markAsReadMutation = useMutation({
    mutationFn: notificationsService.markAsRead,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
    },
  });

  const markAllAsReadMutation = useMutation({
    mutationFn: notificationsService.markAllAsRead,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
    },
  });

  return {
    notifications,
    overdueCount,
    dueTodayCount,
    totalCount,
    unreadFromApi: unreadCountQuery.data ?? 0,
    isLoading,
    markAsRead: markAsReadMutation.mutate,
    markAllAsRead: markAllAsReadMutation.mutate,
  };
}
