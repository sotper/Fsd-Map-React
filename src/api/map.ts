import http from "../utils/http";

export const GetMapText = () => {
  return http.get(import.meta.env.VITE_WHAZZUP_TXT_URL, {
    headers: { "Cache-Control": "no-cache" },
  });
};

export const GetAirportsLonAndLatApi = (ident: string) => {
  return http.get("/api/airportsll.php?ident=" + ident);
};
export const GetnavigationLonAndLatApi = (navigation: string) => {
  return http.get("/api/navigation.php?na=" + navigation);
};
export const GetnavigationTrackApi = (
  route: string,
  dep: string,
  arr: string
) => {
  return http.get("/api/test.php", {
    params: {
      route: route,
      dep: dep,
      arr: arr,
    },
    headers: {
      "Content-Type": "application/json;charset=UTF-8",
    },
    timeout: 10000,
  });
};
