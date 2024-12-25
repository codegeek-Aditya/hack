import { useUser } from "~/hooks/useUser";
import createApi from "~/lib/api";

export const useApi = () => {
  const { accessToken } = useUser();
  return createApi(accessToken || "");
};
