import React, { createRef, lazy, useEffect, useRef, useState } from "react";
import { Map, View, Feature } from "ol";
import { Tile as TileLayer, Vector as VectorLayer } from "ol/layer";
import XYZ from "ol/source/XYZ";
import "ol/ol.css";
import { fromLonLat } from "ol/proj";
import { GetMapText, GetnavigationTrackApi } from "./api/map";
import { Vector as VectorSource, Cluster } from "ol/source";
import { Circle, LineString, Point } from "ol/geom";
import { Style, Stroke, Fill, Icon, Text } from "ol/style";
import atcImg from "@/assets/tower.svg";
import aircraft from "@/assets/aircraft_autonavi.png";
import { ScaleLine } from "ol/control";
import { Button, Card, Col, Drawer, Row, Table, Tag, Tooltip } from "antd";
import {
  CloseOutlined,
  UsergroupDeleteOutlined,
  WifiOutlined,
} from "@ant-design/icons";
import FlightImg from "@/assets/flight.png";
import DownAirportImg from "@/assets/DownAirportImg.svg";
import UpAirportImg from "@/assets/UpAirportImg.svg";
import TextArea from "antd/lib/input/TextArea";
import { flyTo, flyToPoint } from "./utils/flyToUtil";
const pilotColumns = [
  {
    title: "航班号",
    dataIndex: "flightCall",
    key: "flightCall",
    render: (_: any, data: any) => {
      return data[0];
    },
  },
  {
    title: "飞行员",
    dataIndex: "pilot",
    key: "pilot",
    render: (_: any, data: any) => {
      return data[1];
    },
  },
  {
    title: "起飞机场",
    dataIndex: "startAirport",
    key: "startAirport",
    render: (_: any, data: any) => {
      return data[11];
    },
  },
  {
    title: "落地机场",
    dataIndex: "endAirport",
    key: "endAirport",
    render: (_: any, data: any) => {
      return data[13];
    },
  },
  {
    title: "状态",
    dataIndex: "state",
    key: "state",
    render: (_: any, data: any) => {
      return (
        <>
          {Number(data[8]) === 0 ? (
            <Tag>候机中</Tag>
          ) : Number(data[8]) <= 50 ? (
            <Tag color={"blue"}>滑行中</Tag>
          ) : (
            <Tag color={"rgb(0,176,240)"}>执飞中</Tag>
          )}
        </>
      );
    },
  },
];
const atcColumns = [
  {
    title: "管制席位",
    dataIndex: "Atc",
    key: "Atc",
    render: (_: any, data: any) => {
      return data[0];
    },
  },
  {
    title: "管制员",
    dataIndex: "call",
    key: "call",
    render: (_: any, data: any) => {
      return data[1];
    },
  },
  {
    title: "管制范围",
    dataIndex: "range",
    key: "range",
    render: (_: any, data: any) => {
      return data[19];
    },
  },
  {
    title: "频率",
    dataIndex: "frequency",
    key: "frequency",
    render: (_: any, data: any) => {
      return data[4];
    },
  },
];
function MeMap() {
  const map = useRef<any>();
  const MapElement = createRef<HTMLDivElement>();

  let AtcSource = new VectorSource();
  let AtcRangeSource = new VectorSource();
  let PilotSource = new VectorSource();
  let AtcLayer = new VectorLayer();
  let AtcRangeLayer = new VectorLayer();
  let PilotLayer = new VectorLayer();
  let AirportPlannedTrackLayer = new VectorLayer();
  let AirportPlannedTrackSource = new VectorSource();
  let AirportPlannedTrackLlLayer = new VectorLayer();
  let AirportPlannedTrackLlSource = new VectorSource();

  const [time, setTime] = useState<any>();
  const [pilotSum, setPilotSum] = useState<number>(0);
  const [atcSum, setAtcSum] = useState<number>(0);
  const [infoData, setInfoData] = useState<string[]>([]);
  const [atcDataList, setAtcDataList] = useState<string[][]>([]);
  const [PilotDataList, setPilotDataList] = useState<string[][]>([]);

  const [isPilotInfoVisible, setIsPilotInfoVisible] = useState<boolean>(false);
  const [isNo, setIsNo] = useState<boolean>(false);
  const [isPilotListVisible, setIsPilotListVisible] = useState<boolean>(false);
  const [isAtcListVisible, setIsAtcListVisible] = useState<boolean>(false);
  const [isAtcInfoVisible, setIsAtcInfoVisible] = useState<boolean>(false);
  const initMap = () => {
    map.current = new Map({
      target: "map",
      layers: [
        new TileLayer({
          source: new XYZ({
            url: "https://map.geoq.cn/ArcGIS/rest/services/ChinaOnlineStreetPurplishBlue/MapServer/tile/{z}/{y}/{x}",
            // url: "http://t0.tianditu.gov.cn/img_w/wmts?SERVICE=WMTS&REQUEST=GetTile&VERSION=1.0.0&LAYER=img&STYLE=default&TILEMATRIXSET=w&FORMAT=tiles&TILEMATRIX={z}&TILEROW={y}&TILECOL={x}&tk=f981559925515b9757e5b7f31b8752be",
          }),
        }),
        AtcLayer,
        AtcRangeLayer,
        PilotLayer,
      ],
      maxTilesLoading: 5000,
      view: new View({
        center: fromLonLat([110, 34]),
        zoom: 5,
        enableRotation: false,
      }),
    });
    map.current.addControl(new ScaleLine());
    map.current.on("click", function (evt: any) {
      let a = false;
      let pixel = map.current.getEventPixel(evt.originalEvent);
      map.current.forEachFeatureAtPixel(
        pixel,
        function (feature: any, layer: any) {
          if (!a) {
            const data = feature.getProperties()["title"];

            if (data[3] === "PILOT") {
              setIsNo(true);
              AirportPlannedTrackLlSource.clear();
              AirportPlannedTrackSource.clear();
              setInfoData(data);
              setIsAtcInfoVisible(false);
              setIsPilotInfoVisible(true);
              GetAirportsLonAndLat(
                data[11],
                data[13],
                data[30],
                data[5],
                data[6]
              );
            }
            if (data[3] === "ATC") {
              AirportPlannedTrackLlSource.clear();
              AirportPlannedTrackSource.clear();
              setInfoData(data);
              setIsAtcInfoVisible(true);
              setIsPilotInfoVisible(false);
              setTimeout(() => {
                flyToPoint(
                  map,
                  [Number(data[6]), Number(data[5]) - 0.03],
                  Number(data[19]) <= 30
                    ? 12
                    : Number(data[19]) <= 50
                    ? 11
                    : Number(data[19]) <= 150
                    ? 10
                    : Number(data[19]) <= 300
                    ? 9
                    : Number(data[19]) <= 800
                    ? 8
                    : Number(data[19]) <= 1300
                    ? 7
                    : 6
                );
              }, 200);
            }

            if (document.body.offsetWidth < 800) {
              setIsPilotListVisible(false);
              setIsAtcListVisible(false);
            }
            a = true;
          }
        }
      );
    });
  };

  const onLoading = async () => {
    try {
      const resData: any = await GetMapText();
      const atcData: string[][] = [];
      const pilotData: string[][] = [];
      const whazzup = resData
        .substring(resData.indexOf("!CLIENTS") + 9, resData.indexOf("!SERVERS"))
        .trim();
      // 服务器是Linux的请使用这一条代码
      const whazzupData = whazzup.split("\n");
      // 服务器是Windows的请使用这一条代码
      // const whazzupData = whazzup.split("\r\n");
      whazzupData.map((item: string) => {
        const data = item.split(":");
        if (data[3] === "ATC") {
          atcData.push(data);
        }
        if (data[3] === "PILOT") {
          pilotData.push(data);
        }
      });
      setAtcDataList(atcData);
      setPilotSum(pilotData.length);
      setAtcSum(atcData.length);
      setPilotDataList(pilotData);
      setAtcAndPilotSource(atcData, pilotData);
    } catch (error) {}
  };
  // 机组及管制的渲染方法
  const setAtcAndPilotSource = (data: string[][], pilotData: string[][]) => {
    AtcSource.clear();
    AtcRangeSource.clear();
    PilotSource.clear();
    const _AtcFeatures = data.map((item) => {
      const _feature = new Feature({
        title: item,
        geometry: new Point(fromLonLat([Number(item[6]), Number(item[5])])),
      });
      _feature.setStyle(
        new Style({
          image: new Icon({
            src: atcImg,
          }),
          text: new Text({
            font: "10px sans-serif",
            text: item[0],
            fill: new Fill({
              color: "rgba(255, 255, 255, 0.7)",
            }),
            offsetY: 20,
          }),
        })
      );
      return _feature;
    });
    const _AtcRangeFeatures = data.map((item) => {
      const _feature = new Feature({
        title: item,
        geometry: new Circle(
          fromLonLat([Number(item[6]), Number(item[5])]),
          (1852 * Number(item[19])) / 2
        ),
      });
      _feature.setStyle(
        new Style({
          zIndex:
            item[0].indexOf("GND") !== -1
              ? 10
              : item[0].indexOf("TWR") !== -1
              ? 9
              : item[0].indexOf("APP") !== -1
              ? 8
              : item[0].indexOf("CTR") !== -1
              ? 7
              : item[0].indexOf("FSS") !== -1
              ? 6
              : 5,
          stroke: new Stroke({
            color: "rgba(255, 255, 255, 0.3)",
            width: 2,
            // lineDash: [1, 1],
          }),
          fill: new Fill({
            color: "rgba(0, 0, 255, 0.3)",
          }),
        })
      );
      return _feature;
    });
    const _PilotFeatures = pilotData.map((item) => {
      const _feature = new Feature({
        title: item,
        geometry: new Point(fromLonLat([Number(item[6]), Number(item[5])])),
        zIndex: 100,
      });
      _feature.setStyle(
        new Style({
          image: new Icon({
            src: aircraft,
            rotation:
              item[38] !== "0"
                ? (((Number(item[38]) & 4092) >> 2) / 1024) * 360 * 0.02 >= 1
                  ? (((Number(item[38]) & 4092) >> 2) / 1024) * 360 * 0.002
                  : (((Number(item[38]) & 4092) >> 2) / 1024) * 360 * 0.02
                : 0,
            scale: 0.8,
          }),
          text: new Text({
            font: "10px sans-serif",
            text: item[0],
            fill: new Fill({
              color: "rgba(255, 255, 255, 0.7)",
            }),
            offsetY: -25,
          }),
        })
      );
      return _feature;
    });
    AtcSource.addFeatures(_AtcFeatures);
    PilotSource.addFeatures(_PilotFeatures);
    AtcRangeSource.addFeatures(_AtcRangeFeatures);
    PilotLayer.setSource(PilotSource);
    AtcLayer.setSource(AtcSource);
    AtcRangeLayer.setSource(AtcRangeSource);
    AtcLayer.setZIndex(99);
    map.current.addLayer(AtcLayer);
    map.current.addLayer(AtcRangeLayer);
    map.current.addLayer(PilotLayer);
  };
  // 航迹渲染方法
  const addAirportPlannedTrackSource = (data: number[][], ll: number[]) => {
    AirportPlannedTrackSource.clear();
    AirportPlannedTrackLlSource.clear();
    const routeData: any[] = [];
    const routeDataBf: any[] = [];
    const routeDataTwo: any[] = [];
    const routeDataIsLl: any[] = [];
    let IsAdd = false;
    let IsAddLat = 0;
    routeDataIsLl.push([data[0][1], data[0][2]]);
    routeDataIsLl.push([data[data.length - 1][1], data[data.length - 1][2]]);
    data.map((item: any) => {
      if (item[1] > 0) {
        routeData.push(fromLonLat([item[1], item[2]]));
        routeDataBf.push([item[1], item[2]]);
      } else {
        if (!IsAdd) {
          const m =
            (routeDataBf[routeDataBf.length - 1][1] & item[2]) +
            ((routeDataBf[routeDataBf.length - 1][1] ^ item[2]) >> 1);
          routeDataTwo.push(fromLonLat([-180, m]));
          IsAddLat = m;
        }
        routeDataTwo.push(fromLonLat([item[1], item[2]]));
        IsAdd = true;
      }
      routeDataIsLl.push([item[1], item[2], item[0]]);
    });
    IsAdd ? routeData.push(fromLonLat([180, IsAddLat])) : null;
    const _feature = new Feature({
      geometry: new LineString(routeData),
    });
    _feature.setStyle(
      new Style({
        stroke: new Stroke({
          width: 5,
          color: "#717171",
        }),
      })
    );

    const _featureTwo = new Feature({
      geometry: new LineString(routeDataTwo),
    });
    _featureTwo.setStyle(
      new Style({
        stroke: new Stroke({
          width: 5,
          color: "#717171",
        }),
      })
    );
    const d: number[][] = [];
    const dd: number[][] = [];
    if (IsAdd) {
      const m =
        (ll[1] & data[data.length - 1][2]) +
        ((ll[1] ^ data[data.length - 1][2]) >> 1);
      d.push(fromLonLat(ll));
      d.push(fromLonLat([180, m]));
      dd.push(fromLonLat([data[data.length - 1][1], data[data.length - 1][2]]));
      dd.push(fromLonLat([-180, m]));
    } else {
      d.push(fromLonLat(ll));
      d.push(fromLonLat([data[data.length - 1][1], data[data.length - 1][2]]));
    }
    const _featureLl = new Feature({
      geometry: new LineString(d),
    });
    _featureLl.setStyle(
      new Style({
        zIndex: 20,
        stroke: new Stroke({
          width: 2,
          color: "#717171",
          lineDash: [20, 10, 20, 10],
        }),
      })
    );
    const _featureLlTwo = new Feature({
      geometry: new LineString(dd),
    });
    _featureLlTwo.setStyle(
      new Style({
        zIndex: 20,
        stroke: new Stroke({
          width: 2,
          color: "#717171",
          lineDash: [20, 10, 20, 10],
        }),
      })
    );
    const _AirportPlannedTrackFeatures = routeDataIsLl.map((item, index) => {
      const _feature = new Feature({
        title: item,
        geometry: new Point(fromLonLat([item[0], item[1]])),
      });
      if (index === 0) {
        _feature.setStyle(
          new Style({
            zIndex: 20,
            image: new Icon({
              src: UpAirportImg,
            }),
          })
        );
      } else if (index === 1) {
        _feature.setStyle(
          new Style({
            zIndex: 20,
            image: new Icon({
              src: DownAirportImg,
            }),
          })
        );
      } else {
        _feature.setStyle(
          new Style({
            zIndex: 21,
            text: new Text({
              font: "10px sans-serif",
              text: item[2],
              fill: new Fill({
                color: "rgba(255, 255, 255, 0.7)",
              }),
              offsetY: -5,
            }),
          })
        );
      }
      return _feature;
    });
    AirportPlannedTrackSource.addFeatures([
      _feature,
      _featureLl,
      _featureTwo,
      _featureLlTwo,
    ]);
    AirportPlannedTrackLayer.setSource(AirportPlannedTrackSource);
    AirportPlannedTrackLayer.setZIndex(20);
    AirportPlannedTrackLlSource.addFeatures(_AirportPlannedTrackFeatures);
    AirportPlannedTrackLlLayer.setSource(AirportPlannedTrackLlSource);
    AirportPlannedTrackLlLayer.setZIndex(20);
    map.current.addLayer(AirportPlannedTrackLayer);
    map.current.addLayer(AirportPlannedTrackLlLayer);
  };

  const GetAirportsLonAndLat = async (
    upAirport: string,
    downAirport: string,
    route: string,
    lon: string,
    lat: string
  ) => {
    const resData: any = await GetnavigationTrackApi(
      route,
      upAirport,
      downAirport
    );
    addAirportPlannedTrackSource(resData, [Number(lat), Number(lon)]);
  };
  useEffect(() => {
    initMap();
    onLoading();
    setInterval(onLoading, 1000);
    setInterval(() => {
      const time = new Date();
      setTime(
        "UTC " +
          time.getUTCHours().toString().padStart(2, "0") +
          ":" +
          time.getUTCMinutes().toString().padStart(2, "0") +
          ":" +
          time.getUTCSeconds().toString().padStart(2, "0")
      );
    }, 1000);
  }, []);
  return (
    <div>
      <div
        className="relative overflow-hidden"
        style={{ width: "100%", height: "100%" }}
      >
        {/* 地图Div */}
        <div
          id="map"
          ref={MapElement}
          style={{
            width: "100vw",
            height: "100vh",
          }}
        >
          {/* 顶部 */}
          <div
            className="absolute top-0 left-0 z-50"
            style={{
              width: document.body.offsetWidth < 800 ? "100%" : "400px",
            }}
          >
            <Card
              bodyStyle={{
                padding: 10,
                width: "100%",
                height: "62px",
              }}
              className=" rounded-md"
            >
              <span className=" flex justify-center items-center h-full font-bold text-2xl">
                {time}
              </span>
            </Card>
            {/* 左侧按钮部分 */}
            <div
              className="absolute top-20 left-0 z-50"
              style={{
                width: "auto",
              }}
            >
              <Row>
                <Col>
                  <Tooltip placement="topLeft" title="在线机组列表">
                    <Button
                      style={{
                        marginLeft: "5px",
                        background: "#000",
                        border: 0,
                      }}
                      onClick={() => {
                        setIsPilotListVisible(!isPilotListVisible);
                        setIsAtcListVisible(false);
                        if (document.body.offsetWidth < 800) {
                          setIsPilotInfoVisible(false);
                          setIsAtcInfoVisible(false);
                        }
                      }}
                    >
                      <UsergroupDeleteOutlined />
                    </Button>
                  </Tooltip>
                </Col>
              </Row>
              <Row>
                <Col>
                  <Tooltip placement="bottomLeft" title="在线管制列表">
                    <Button
                      style={{
                        marginTop: "15px",
                        marginLeft: "5px",
                        background: "#000",
                        border: 0,
                      }}
                      onClick={() => {
                        setIsAtcListVisible(!isAtcListVisible);
                        setIsPilotListVisible(false);
                        if (document.body.offsetWidth < 800) {
                          setIsPilotInfoVisible(false);
                          setIsAtcInfoVisible(false);
                        }
                      }}
                    >
                      <WifiOutlined />
                    </Button>
                  </Tooltip>
                </Col>
              </Row>
            </div>
          </div>
          {/* 底部 */}
          <div
            className="absolute right-0 bottom-0 z-50"
            style={{ fontSize: 10 }}
          >
            © <a href="http://www.deteam.cn">DeStudio</a> ©{" "}
            <a href="https://openlayers.org/">Openlayers</a>
          </div>
          {/* 机组列表 */}
          {isPilotListVisible ? (
            <div
              className="absolute top-0 left-0 sm:ml-14 w-full sm:w-auto z-50"
              style={{
                marginTop: document.body.offsetWidth < 800 ? "200px" : "100px",
              }}
            >
              <Card
                bodyStyle={{ padding: 0 }}
                title={"在线机组列表(在线机组数量:" + pilotSum + "架)"}
                className="rounded-md overflow-hidden"
                style={{ overflowX: "hidden" }}
                extra={
                  <CloseOutlined
                    onClick={() => {
                      setIsPilotListVisible(false);
                    }}
                  />
                }
              >
                <Table
                  key="PilotList"
                  dataSource={PilotDataList}
                  scroll={{ x: true }}
                  pagination={{
                    pageSize: document.body.offsetWidth < 800 ? 3 : 10,
                  }}
                  columns={pilotColumns}
                  onRow={(record) => ({
                    onClick: () => {
                      setIsNo(true);
                      const layers = map.current.getLayers().getArray();
                      if (layers.length > 0) {
                        layers.forEach((item: any, index: any) => {
                          if (index > 3) {
                            item.getSource().refresh();
                          }
                        });
                      }
                      GetAirportsLonAndLat(
                        record[11],
                        record[13],
                        record[30],
                        record[5],
                        record[6]
                      );
                      flyToPoint(
                        map,
                        [
                          document.body.offsetWidth < 800
                            ? Number(record[6])
                            : Number(record[6]) + 0.003,
                          document.body.offsetWidth < 800
                            ? Number(record[5]) - 0.005
                            : Number(record[5]),
                        ],
                        15,
                        1000
                      );

                      setInfoData(record);
                      setIsPilotInfoVisible(true);
                      setIsAtcInfoVisible(false);
                      if (document.body.offsetWidth < 800) {
                        setIsPilotListVisible(false);
                        setIsAtcListVisible(false);
                      }
                    },
                  })}
                />
              </Card>
            </div>
          ) : null}
          {/* 管制列表 */}
          {isAtcListVisible ? (
            <div
              className="absolute top-0 left-0 sm:ml-14 w-full sm:w-96 z-50"
              style={{
                marginTop: document.body.offsetWidth < 800 ? "200px" : "100px",
              }}
            >
              <Card
                bodyStyle={{ padding: 0 }}
                title={"在线管制列表(管制在线人数：" + atcSum + ")"}
                className="rounded-md"
                extra={
                  <CloseOutlined
                    onClick={() => {
                      setIsAtcListVisible(false);
                    }}
                  />
                }
              >
                <Table
                  key="AtcList"
                  dataSource={atcDataList}
                  columns={atcColumns}
                  onRow={(record) => ({
                    onClick: () => {
                      const layers = map.current.getLayers().getArray();
                      if (layers.length > 0) {
                        layers.forEach((item: any, index: any) => {
                          if (index > 3) {
                            item.getSource().refresh();
                          }
                        });
                      }
                      setInfoData(record);
                      setIsAtcInfoVisible(true);
                      setIsPilotInfoVisible(false);
                      flyTo(
                        map,
                        [
                          document.body.offsetWidth < 800
                            ? Number(record[6])
                            : Number(record[6]) + 0.05,
                          document.body.offsetWidth < 800
                            ? Number(record[5]) - 0.05
                            : Number(record[5]),
                        ],
                        Number(record[19]) <= 30
                          ? 12
                          : Number(record[19]) <= 50
                          ? 11
                          : Number(record[19]) <= 150
                          ? 10
                          : Number(record[19]) <= 300
                          ? 9
                          : Number(record[19]) <= 800
                          ? 8
                          : Number(record[19]) <= 1300
                          ? 7
                          : 6
                      );
                      if (document.body.offsetWidth < 800) {
                        setIsPilotListVisible(false);
                        setIsAtcListVisible(false);
                      }
                    },
                  })}
                />
              </Card>
            </div>
          ) : null}
        </div>
        {/* 管制详情弹出框 */}
        <Drawer
          title="管制详情"
          placement={document.body.offsetWidth < 800 ? "bottom" : "right"}
          onClose={() => {
            setIsAtcInfoVisible(false);
          }}
          getContainer={false}
          mask={false}
          className="overflow-hidden"
          style={{ position: "absolute" }}
          visible={isAtcInfoVisible}
        >
          <Row>
            <Col span={12}>
              <div className=" float-left">席位</div>
            </Col>
            <Col span={12}>
              <div className=" float-right">{infoData[0]}</div>
            </Col>
          </Row>
          <Row className="mt-3">
            <Col span={12}>
              <div className=" float-left">频率</div>
            </Col>
            <Col span={12}>
              <div className=" float-right">{infoData[4]}</div>
            </Col>
          </Row>
          <Row className="mt-3">
            <Col span={12}>
              <div className=" float-left">雷达范围</div>
            </Col>
            <Col span={12}>
              <div className=" float-right">{infoData[19]}</div>
            </Col>
          </Row>
          <Row className="mt-3">
            <Col span={12}>
              <div className=" float-left">管制员</div>
            </Col>
            <Col span={12}>
              <div className=" float-right">
                {infoData[1]}({infoData[2]})
              </div>
            </Col>
          </Row>
        </Drawer>
        {/* 机组详情弹出框 */}
        <Drawer
          title="机组详情"
          placement={document.body.offsetWidth < 800 ? "bottom" : "right"}
          onClose={() => {
            const layers = map.current.getLayers().getArray();
            if (layers.length > 0) {
              layers.forEach((item: any, index: any) => {
                if (index > 3) {
                  item.getSource().refresh();
                }
              });
            }
            setIsPilotInfoVisible(false);
          }}
          getContainer={false}
          mask={false}
          className="overflow-hidden"
          visible={isPilotInfoVisible}
        >
          <Row>
            <Col span={12}>
              <div className=" float-left">航班号</div>
            </Col>
            <Col span={12}>
              <div className=" float-right">{infoData[0]}</div>
            </Col>
          </Row>
          <Row className="mt-3">
            <Col span={12}>
              <div className=" float-left">起降机场</div>
            </Col>
            <Col span={12}>
              <div className=" float-right">
                <div className=" flex">
                  <span>{infoData[11]}</span>
                  <span>
                    <img className=" w-3 h-3 mt-1 mx-2" src={FlightImg} />
                  </span>
                  <span>{infoData[13]}</span>
                </div>
              </div>
            </Col>
          </Row>
          <Row className="mt-3">
            <Col span={12}>
              <div className=" float-left">机型</div>
            </Col>
            <Col span={12}>
              <div className=" float-right">{infoData[9]}</div>
            </Col>
          </Row>
          <Row className="mt-3">
            <Col span={12}>
              <div className=" float-left">飞行员</div>
            </Col>
            <Col span={12}>
              <div className=" float-right">
                {infoData[1]}({infoData[2]})
              </div>
            </Col>
          </Row>
          <Row className="mt-3">
            <Col span={12}>
              <div className=" float-left">速度</div>
            </Col>
            <Col span={12}>
              <div className=" float-right">{infoData[8]}kt</div>
            </Col>
          </Row>
          <Row className="mt-3">
            <Col span={12}>
              <div className=" float-left">应答机</div>
            </Col>
            <Col span={12}>
              <div className=" float-right">{infoData[17]}</div>
            </Col>
          </Row>
          <Row className="mt-3">
            <Col span={12}>
              <div className=" float-left">巡航高度</div>
            </Col>
            <Col span={12}>
              <div className=" float-right">{infoData[7]}ft</div>
            </Col>
          </Row>
          <Row className="mt-3">
            <Col span={12}>
              <div className=" float-left">航向</div>
            </Col>
            <Col span={12}>
              <div className=" float-right">
                {Math.round(
                  (((Number(infoData[38]) & 4092) >> 2) / 1024) * 360
                )}
              </div>
            </Col>
          </Row>
          <Row className="mt-3">
            <Col span={24}>
              <div className=" float-left">航路</div>
            </Col>
            <Col span={24}>
              <TextArea
                readOnly
                bordered={false}
                style={{ minWidth: "300px" }}
                autoSize={{ minRows: 2, maxRows: 10 }}
                className="text-zinc-400 text-md"
                value={infoData[30]}
              />
            </Col>
          </Row>
        </Drawer>
      </div>
    </div>
  );
}

export default MeMap;
