import { useQuery, useMutation } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { apiRequest, queryClient } from "@/lib/queryClient";

export interface User {
  id: string;
  username: string;
  role: string;
}

export function useAuth() {
  const [, setLocation] = useLocation();

  const { data: user, isLoading } = useQuery<User | null>({
    queryKey: ["/api/auth/me"],
    queryFn: async () => {
      try {
        const response = await apiRequest("GET", "/api/auth/me", undefined);
        if (!response.ok) {
          return null;
        }
        return await response.json();
      } catch {
        return null;
      }
    },
    retry: false,
    staleTime: 1000 * 60 * 5,
  });

  const logoutMutation = useMutation({
    mutationFn: async () => {
      await apiRequest("POST", "/api/auth/logout", {});
    },
    onSuccess: () => {
      queryClient.setQueryData(["/api/auth/me"], null);
      setLocation("/admin/login");
    },
  });

  return {
    user,
    isLoading,
    isAuthenticated: !!user,
    logout: () => logoutMutation.mutate(),
  };
}
