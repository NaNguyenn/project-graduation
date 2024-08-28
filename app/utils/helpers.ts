import crypto, { createHash } from "crypto";

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

export const hashPassword = (password: string) => {
  return createHash("sha256").update(password).digest("hex");
};

export const comparePassword = (password: string, hashedPassword: string) => {
  return hashPassword(password) === hashedPassword;
};
