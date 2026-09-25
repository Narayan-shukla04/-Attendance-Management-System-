import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import axiosInstance from "../config/AxiosInstance";

const localToday = () => new Date().toLocaleDateString("en-CA");

export function useMyAttendance(params = {}) {
  return useQuery({
    queryKey: ["my-attendance", params],
    queryFn: async () => {
      const res = await axiosInstance.get("/attendance/my-attendance", { params });
      return res.data.records || [];
    },
  });
}

export function useTodayStatus() {
  return useQuery({
    queryKey: ["my-attendance-today"],
    queryFn: async () => {
      const r = await axiosInstance.get("/attendance/my-attendance", { params: { limit: 5 } });
      const today = localToday();
      const rec = r.data.records?.find(
        (x) => x.date === today || (x.punchIn && new Date(x.punchIn).toLocaleDateString("en-CA") === today)
      );
      if (rec?.punchOut) return "out";
      if (rec?.punchIn) return "in";
      return null;
    },
  });
}

export function useTeamAttendance() {
  return useQuery({
    queryKey: ["team-attendance"],
    queryFn: async () => {
      const res = await axiosInstance.get("/attendance/team-attendance");
      return res.data.records || [];
    },
  });
}

export function useAllAttendance(date = null) {
  const isReport = Boolean(date);
  return useQuery({
    queryKey: ["admin-attendance", isReport ? date : "all"],
    queryFn: async () => {
      if (isReport) {
        const res = await axiosInstance.get("/attendance/report", { params: { date } });
        return res.data.records || [];
      }
      const res = await axiosInstance.get("/attendance/all-attendance");
      return res.data.records || [];
    },
  });
}

export function usePunchIn(onSuccess, onError) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (formData) => axiosInstance.post("/attendance/check-in", formData),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["my-attendance-today"] });
      queryClient.invalidateQueries({ queryKey: ["my-attendance"] });
      onSuccess?.(data);
    },
    onError,
  });
}

export function usePunchOut(onSuccess, onError) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (formData) => axiosInstance.post("/attendance/check-out", formData),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["my-attendance-today"] });
      queryClient.invalidateQueries({ queryKey: ["my-attendance"] });
      onSuccess?.(data);
    },
    onError,
  });
}

export function useRequestOT() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id) => axiosInstance.post(`/attendance/request-ot/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["my-attendance"] });
    },
  });
}

export function useDecideOT() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, decision }) =>
      axiosInstance.post(`/attendance/ot-decision/${id}`, { decision }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["team-attendance"] });
    },
  });
}

export function useValidateAttendance(invalidateKey = "team-attendance") {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, status, remarks }) =>
      axiosInstance.post(`/attendance/validate/${id}`, {
        validationStatus: status,
        remarks,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [invalidateKey] });
    },
  });
}
