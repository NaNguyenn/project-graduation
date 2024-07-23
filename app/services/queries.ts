import { useQuery, UseQueryOptions } from "@tanstack/react-query";
import { ApiUrl } from "./api-url";
import request from "./request";
import { CheckTokenReq } from "./type.interface";

export const useCheckTokenQuery = (
  params: CheckTokenReq,
  options?: UseQueryOptions<string>
) => {
  return useQuery({
    queryKey: ["check-token", params],
    queryFn: () =>
      request.GET({ url: ApiUrl.users, params }).then((res) => res.data),
    ...options,
  });
};
