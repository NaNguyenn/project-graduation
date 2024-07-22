export type RegisterEmailReq = {
  params: { locale: string };
  data: { email: string };
};
export type RegisterEmailRes = {
  email: string;
};
