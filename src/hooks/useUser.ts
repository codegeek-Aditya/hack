import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useSelector, useDispatch } from "react-redux";
import { setUser, setTokens, clearUser } from "~/store/features/user/userSlice";
import { RootState } from "~/store/store";
import { UserType } from "~/lib/types";
import { useState, useEffect } from "react";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

export const useUser = () => {
  const dispatch = useDispatch();
  const queryClient = useQueryClient();
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  const user = useSelector((state: RootState) => state.user.currentUser);
  const accessToken = useSelector((state: RootState) => state.user.accessToken);
  const refreshToken = useSelector(
    (state: RootState) => state.user.refreshToken,
  );

  const {
    data: userDetails,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["user"],
    queryFn: async () => {
      if (!isClient) return null;

      const storedUserId = user?._id || localStorage.getItem("userId");
      if (!storedUserId) return null;

      const currentToken = accessToken || localStorage.getItem("accessToken");
      if (!currentToken) {
        throw new Error("Token not found");
      }

      try {
        const response = await fetch(`${API_URL}/api/user/getUserById`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${currentToken}`,
          },
          body: JSON.stringify({ userId: storedUserId }),
        }).catch(() => {
          throw new Error("Network error occurred while fetching user data");
        });

        if (!response.ok) {
          if (response.status === 401) {
            try {
              const refreshResponse = await fetch(
                `${API_URL}/api/auth/refreshToken`,
                {
                  method: "POST",
                  headers: {
                    "Content-Type": "application/json",
                  },
                  body: JSON.stringify({ token: refreshToken }),
                },
              ).catch(() => {
                throw new Error(
                  "Network error occurred while refreshing token",
                );
              });

              if (!refreshResponse.ok) {
                logout();
                throw new Error(
                  `Session expired. Status: ${refreshResponse.status}`,
                );
              }

              const refreshData = await refreshResponse.json();
              updateTokens(refreshData.accessToken, refreshData.refreshToken);

              const retryResponse = await fetch(
                `${API_URL}/api/user/getUserById`,
                {
                  method: "POST",
                  headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${refreshData.accessToken}`,
                  },
                  body: JSON.stringify({ userId: storedUserId }),
                },
              );

              if (!retryResponse.ok) {
                throw new Error("Failed to fetch");
              }

              const retryData = await retryResponse.json();
              updateUser(retryData.user);
              return retryData.user;
            } catch (refreshError) {
              logout();
              throw refreshError instanceof Error
                ? refreshError
                : new Error("Failed to refresh token");
            }
          }
          const errorMessage = await response
            .text()
            .catch(() => "Unknown error");
          throw new Error(
            `Failed to fetch user data. Status: ${response.status}. ${errorMessage}`,
          );
        }

        const data = await response.json().catch(() => {
          throw new Error("Invalid JSON response from server");
        });

        if (!data.user) {
          throw new Error("Invalid user data received from server");
        }

        updateUser(data.user);
        return data.user;
      } catch (error) {
        if (error instanceof Error) {
          throw error;
        }
        throw new Error("An unexpected error occurred");
      }
    },
    enabled: isClient && !!(localStorage.getItem("userId") || user?._id),
    staleTime: Infinity,
  });

  const updateUser = (userData: UserType) => {
    dispatch(setUser(userData));
    queryClient.setQueryData(["user"], userData);
  };

  const updateTokens = (accessToken: string, refreshToken: string) => {
    dispatch(setTokens({ accessToken, refreshToken }));
    localStorage.setItem("accessToken", accessToken);
    localStorage.setItem("refreshToken", refreshToken);
  };

  const initializeUserSession = (
    userData: UserType,
    accessToken: string,
    refreshToken: string,
  ) => {
    localStorage.setItem("userId", userData._id);
    updateTokens(accessToken, refreshToken);
    updateUser(userData);
  };

  const logout = () => {
    localStorage.removeItem("userId");
    localStorage.removeItem("accessToken");
    localStorage.removeItem("refreshToken");
    dispatch(clearUser());
    queryClient.clear();
    window.location.href = "/auth/login";
  };

  return {
    user: userDetails || user,
    isLoading,
    error,
    accessToken,
    refreshToken,
    updateUser,
    updateTokens,
    initializeUserSession,
    logout,
  };
};
