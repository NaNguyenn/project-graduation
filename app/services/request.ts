import axios from "axios";

export const request = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL,
  timeout: 5 * 60 * 1000,
});
