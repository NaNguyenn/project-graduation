import axios from "axios";

export const request = axios.create({
  baseURL: process.env.NEXT_PUBLIC_BASE_URL + "/api",
  timeout: 5 * 60 * 1000,
});
