import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import axiosInstance from "../config/AxiosInstance";

export function useUsersList() {
  return useQuery({
    queryKey: ["admin-users"],
    queryFn: async () => {
      const res = await axiosInstance.get("/users/list");
      return res.data.users || [];
    },
  });
}

export function useManagersList(enabled = true) {
  return useQuery({
    queryKey: ["managers"],
    queryFn: async () => {
      const res = await axiosInstance.get("/auth/managers");
      return res.data.managers || [];
    },
    enabled,
  });
}

export function useDeleteUser() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id) => axiosInstance.delete(`/users/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-users"] });
    },
  });
}
