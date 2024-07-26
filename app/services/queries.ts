import { useQuery, UseQueryOptions } from "@tanstack/react-query";
import { ApiUrl } from "./api-url";
import request from "./request";
import { CheckTokenReq, CheckTokenRes } from "./type.interface";

export const useCheckTokenQuery = (
  params: CheckTokenReq,
  options?: Partial<UseQueryOptions<CheckTokenRes>>
) => {
  return useQuery({
    queryKey: ["check-token", params],
    queryFn: () =>
      request.GET({ url: ApiUrl.users, params }).then((res) => res),
    refetchOnWindowFocus: false,
    ...options,
  });
};
