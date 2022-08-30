import http from "../utils/http";

// export const GetMapData = () => {
//   return http.get<{ data: string[][] }>("/api/system/get/whazzup");
// };

// export const GetMapText = () => {
//   return http.get("/web/whazzup.txt", {
//     headers: { "Cache-Control": "no-cache" },
//   });
// };

export const GetMapText = () => {
  return http.get("/whazzup/system/get/whazzup.txt", {
    headers: { "Cache-Control": "no-cache" },
  });
};

export const GetAirportsLonAndLatApi = (ident: string) => {
  return http.get("/api/airportsll.php?ident=" + ident);
};
export const GetnavigationLonAndLatApi = (navigation: string) => {
  return http.get("/api/navigation.php?na=" + navigation);
};

export const GetAirportText = () => {
  return http.get("/web/airports.txt", {
    // headers: {
    //   "Cache-Control": "no-cache",
    // },
    timeout: 100000,
  });
};
