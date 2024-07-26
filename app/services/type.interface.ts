import { RegisterType } from "../api/models/Register";

export type RegisterEmailReq = {
  params: { locale: string };
  data: { email: string };
};
export type RegisterEmailRes = {
  email: string;
};

export type CheckTokenReq = {
  locale: string;
  email: string;
  token: string;
  expiryDate: string;
};

export type CheckTokenRes = Partial<RegisterType>;

export type RegisterUserReq = {
  params: { locale: string };
  data: Partial<RegisterType>;
};
