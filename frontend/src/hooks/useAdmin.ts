import { useQuery } from "@tanstack/react-query";
import * as adminService from "../services/admin";

export function useAdminUsers() {
  return useQuery({
    queryKey: ["admin", "users"],
    queryFn: adminService.getUsers,
  });
}

export function useAdminTimeLogs(userId?: string) {
  return useQuery({
    queryKey: ["admin", "timelogs", userId ?? "all"],
    queryFn: () => adminService.getTimeLogs(userId),
  });
}
