import axios, { AxiosRequestConfig, AxiosResponse } from "axios";

export interface HttpResponse<T = unknown> {
  status: number;
  message: string;
  code: number;
  data: T;
}
const http = axios.create({
  timeout: 2000,
  // headers: {
  //   "Content-Type": "application/json;charset=UTF-8",
  // },
});
http.interceptors.request.use(
  (config: AxiosRequestConfig) => {
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);
http.interceptors.response.use(
  (response: AxiosResponse<HttpResponse>) => {
    const res = response.data;
    // const navigate = useNavigate();
    if (res.code !== 200) {
      if (res.code === 401) {
        window.location.href = "/login";
      }
    }
    return res;
  },
  (error) => {
    console.log(error);
    return Promise.reject(error);
  }
);

export default http;
