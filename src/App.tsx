import { useEffect, useRef, useState } from "react";
import aircraft from "@/assets/aircraft_autonavi.png";
import atcImg from "@/assets/tower.svg";
import { GetAirportText, GetMapText } from "./api/map";

import { Button, Card, Col, Row, Table, Tag, Tooltip } from "antd";
import {
  CloseOutlined,
  UsergroupDeleteOutlined,
  WifiOutlined,
} from "@ant-design/icons";
import TextArea from "antd/lib/input/TextArea";
import FlightImg from "@/flight.png";
// import { UsergroupDeleteOutlined } from "@ant-design/icons";
import navigation from "@/assets/navigation.json";
import airportsText from "@/assets/airports.txt";
import axios from "axios";
import MeMap from "./MeMap";

function App() {
  // const [atcDataList, setAtcDataList] = useState<string[][]>([]);
  // const [PilotDataList, setPilotDataList] = useState<string[][]>([]);
  // const [infoData, setInfoData] = useState<string[]>([]);
  // const [airportPlannedTrack, setAirportPlannedTrack] = useState<any[][]>([]);
  // const [airportDataList, setAirportDataList] = useState<any[][]>([]);
  // const onLoading = async () => {
  //   try {
  //     const resData: any = await GetMapText();
  //     const atcData: string[][] = [];
  //     const pilotData: string[][] = [];
  //     const whazzup = resData
  //       .substring(resData.indexOf("!CLIENTS") + 9, resData.indexOf("!SERVERS"))
  //       .trim();
  //     // 服务器是Linux的请使用这一条代码
  //     const whazzupData = whazzup.split("\n");
  //     // 服务器是Windows的请使用这一条代码
  //     // const whazzupData = whazzup.split("\r\n");
  //     whazzupData.map((item: string) => {
  //       const data = item.split(":");
  //       if (data[3] === "ATC") {
  //         atcData.push(data);
  //       }
  //       if (data[3] === "PILOT") {
  //         pilotData.push(data);
  //       }
  //     });
  //     setAtcDataList(atcData);
  //     setPilotDataList(pilotData);
  //   } catch (error) {}
  // };
  // const [center, setCenter] = useState([110, 34]);
  // const [isPilotInfoVisible, setIsPilotInfoVisible] = useState<boolean>(false);
  // const [isPilotListVisible, setIsPilotListVisible] = useState<boolean>(false);
  // const [isAtcListVisible, setIsAtcListVisible] = useState<boolean>(false);
  // const [isAirportPlannedTrackVisible, setIsAirportPlannedTrackVisible] =
  //   useState<boolean>(false);
  // const [isAtcInfoVisible, setIsAtcInfoVisible] = useState<boolean>(false);
  // const [time, setTime] = useState<any>();
  // const mapRef = useRef<any>();
  // useEffect(() => {
  //   initAirportData();
  //   console.log(getAirportLonAndLat("ZBAA"));

  //   onLoading();
  //   setInterval(() => {
  //     const time = new Date();
  //     setTime(
  //       "UTC " +
  //         time.getUTCHours() +
  //         ":" +
  //         time.getUTCMinutes() +
  //         ":" +
  //         time.getUTCSeconds()
  //     );
  //   }, 1000);
  //   setInterval(onLoading, 5000);
  // }, []);

  // const GetNavigationData = (na: string) => {
  //   let data: number[] = [];
  //   const YData: any = navigation;
  //   // const resData: {
  //   //   name: string;
  //   //   lon: number;
  //   //   lat: number;
  //   // }[] = [];
  //   for (let index = 0; index < YData.length; index++) {
  //     const item = YData[index];
  //     if (item[0] === na) {
  //       data = [Number(item[1]), Number(item[2])];
  //       break;
  //     }
  //   }
  //   return data;
  // };
  // const getNavigationDataList: any = (dataList: string) => {
  //   const data: string[] = dataList.split(" ");
  //   let res: number[][] = [];
  //   data.map((item: string) => {
  //     let d = GetNavigationData(item);
  //     if (d[0] !== undefined || d[1] !== undefined) {
  //       res.push(d);
  //     }
  //   });
  //   return res;
  // };
  // const initAirportData = () => {
  //   axios
  //     .get("/web/airports.txt", {
  //       headers: {
  //         "Content-Type": "application/text;charset=UTF-8",
  //       },
  //     })
  //     .then((e) => {
  //       const d: string = e.data;
  //       const da: string[] = d.split("\r\n");
  //       const data: string[][] = [];
  //       da.map((item) => {
  //         data.push(item.split("|"));
  //       });
  //       setAirportDataList(data);
  //     });
  // };
  // const getAirportLonAndLat = (icao: string) => {
  //   let ll: number[] = [];
  //   airportDataList.map((item) => {
  //     if (item[1] === icao) {
  //       ll = [Number(item[4]), Number(item[5])];
  //     }
  //   });
  //   return ll;
  // };

  // const getAirportPlannedTrack = (
  //   upAirport: string,
  //   downAirport: string,
  //   route: string
  // ) => {
  //   const resUpAirportLlData = getAirportLonAndLat(upAirport);
  //   const resDownAirportLlData = getAirportLonAndLat(downAirport);
  //   if (
  //     resUpAirportLlData[0] === 0 ||
  //     resUpAirportLlData[1] === 0 ||
  //     resDownAirportLlData[0] === 0 ||
  //     resDownAirportLlData[1] === 0
  //   ) {
  //     setIsAirportPlannedTrackVisible(false);
  //   } else {
  //     setAirportPlannedTrack([
  //       [resUpAirportLlData[0], resUpAirportLlData[1]],
  //       ...getNavigationDataList(route),
  //       [resDownAirportLlData[0], resDownAirportLlData[1]],
  //     ]);
  //     setIsAirportPlannedTrackVisible(true);
  //   }
  // };

  // const pilotColumns = [
  //   {
  //     title: "航班号",
  //     dataIndex: "flightCall",
  //     key: "flightCall",
  //     width: 78,
  //     render: (_: any, data: any) => {
  //       return data[0];
  //     },
  //   },
  //   {
  //     title: "飞行员",
  //     dataIndex: "pilot",
  //     key: "pilot",
  //     width: 78,
  //     render: (_: any, data: any) => {
  //       return data[1];
  //     },
  //   },
  //   {
  //     title: "起飞机场",
  //     dataIndex: "startAirport",
  //     key: "startAirport",
  //     width: 78,
  //     render: (_: any, data: any) => {
  //       return data[11];
  //     },
  //   },
  //   {
  //     title: "落地机场",
  //     dataIndex: "endAirport",
  //     key: "endAirport",
  //     width: 78,
  //     render: (_: any, data: any) => {
  //       return data[13];
  //     },
  //   },
  //   {
  //     title: "状态",
  //     dataIndex: "state",
  //     key: "state",
  //     width: 78,
  //     render: (_: any, data: any) => {
  //       return (
  //         <>
  //           {Number(data[8]) === 0 ? (
  //             <Tag>候机中</Tag>
  //           ) : Number(data[8]) <= 50 ? (
  //             <Tag color={"blue"}>划行中</Tag>
  //           ) : (
  //             <Tag color={"rgb(0,176,240)"}>持飞中</Tag>
  //           )}
  //         </>
  //       );
  //     },
  //   },
  // ];
  // const atcColumns = [
  //   {
  //     title: "管制席位",
  //     dataIndex: "flightCall",
  //     key: "flightCall",
  //     render: (_: any, data: any) => {
  //       return data[0];
  //     },
  //   },
  //   {
  //     title: "管制员",
  //     dataIndex: "pilot",
  //     key: "pilot",
  //     render: (_: any, data: any) => {
  //       return data[1];
  //     },
  //   },
  //   {
  //     title: "管制范围",
  //     dataIndex: "startAirport",
  //     key: "startAirport",
  //     render: (_: any, data: any) => {
  //       return data[19];
  //     },
  //   },
  //   {
  //     title: "频率",
  //     dataIndex: "endAirport",
  //     key: "endAirport",
  //     render: (_: any, data: any) => {
  //       return data[4];
  //     },
  //   },
  // ];
  return <MeMap />;
}

export default App;
