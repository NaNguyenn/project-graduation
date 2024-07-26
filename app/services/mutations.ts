import { useMutation, UseMutationOptions } from "@tanstack/react-query";
import { ApiUrl } from "./api-url";
import {
  RegisterEmailReq,
  RegisterEmailRes,
  RegisterUserReq,
} from "./type.interface";
import request from "./request";
import { RegisterType } from "../api/models/Register";

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

export const useRegisterUserMutation = (
  options?: UseMutationOptions<Partial<RegisterType>, Error, RegisterUserReq>
) => {
  return useMutation({
    mutationFn: ({ data, params }) =>
      request.POST({ url: ApiUrl.users, data, params }).then((res) => res.data),
    ...options,
  });
};
