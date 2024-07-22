import axios, { AxiosRequestConfig } from "axios";

export const axiosInstance = axios.create({
  baseURL: process.env.NEXT_PUBLIC_BASE_URL + "/api",
  timeout: 5 * 60 * 1000,
});

const request = {
  async POST<T, O>(apiConfig: AxiosRequestConfig) {
    const { url = "", data } = apiConfig;
    return axiosInstance
      .post<T, O>(url, data, { ...apiConfig })
      .then((response: any) => response?.data)
      .catch((err) => {
        return Promise.reject(err.response);
      });
  },
};

export default request;
