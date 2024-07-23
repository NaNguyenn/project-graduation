import crypto from "crypto";

export const generateUniqueToken = (bytes?: number) => {
  return crypto.randomBytes(bytes || 32).toString("hex");
};

export const getMessage = (error: any): string => {
  const details = error?.data?.details;
  let msg =
    error?.data?.error?.message ||
    error?.data?.message ||
    error?.error_description ||
    error?.error?.message ||
    error?.message ||
    error?.error?.code ||
    "ERROR";
  if (details?.length) {
    msg = details?.[0]?.target + " " + details?.[0]?.message;
  }
  return msg;
};
