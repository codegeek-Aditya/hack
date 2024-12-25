import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useApi } from "./useApi";
import { Stock } from "../lib/types";
import { useUser } from "./useUser";
import { toast } from "./use-toast";

export const useStock = () => {
  const api = useApi();

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ["stockInventory"],
    queryFn: async () => {
      const response = await api.get<{ inventory: Stock[] }>(
        "api/stock/getAll",
      );
      return response.inventory;
    },
  });

  return {
    stock: data ?? [],
    isLoading,
    error: error ? (error as Error).message : null,
    refetch,
  };
};

export const useOrderStock = () => {
  const api = useApi();
  const { user } = useUser();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (cart: any[]) => {
      const cartWithHospitalId = cart.map((item) => ({
        ...item,
        hospitalId: user?.hospitalId,
      }));

      const response = await api.post("api/stock/order", cartWithHospitalId);
      return response;
    },
    onSuccess: () => {
      toast({
        title: "Order placed",
        description: "Order has been placed successfully",
      });
      queryClient.invalidateQueries({ queryKey: ["Inventory"] });
    },
    onError: (error) => {
      console.error("Failed to place order:", error);
      toast({
        title: "Error",
        description: "Failed to place order",
        variant: "destructive",
      });
    },
  });
};
