import { useMutation, UseMutationOptions } from "@tanstack/react-query";
import { ApiUrl } from "./api-url";
import { RegisterEmailReq, RegisterEmailRes } from "./type.interface";
import request from "./request";

export const useRegisterEmailMutation = (
  options?: UseMutationOptions<RegisterEmailRes, Error, RegisterEmailReq>
) => {
  return useMutation({
    mutationFn: ({ data, params }) =>
      request
        .POST({ url: ApiUrl.registers, data, params })
        .then((res) => res.data),
    ...options,
  });
};
