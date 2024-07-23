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
