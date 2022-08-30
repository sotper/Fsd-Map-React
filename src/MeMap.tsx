import React, { createRef, lazy, useEffect, useRef, useState } from "react";
import { Map, View, Feature } from "ol";
import { Tile as TileLayer, Vector as VectorLayer } from "ol/layer";
import XYZ from "ol/source/XYZ";
import "ol/ol.css";
import { fromLonLat } from "ol/proj";
import {
  GetAirportsLonAndLatApi,
  GetAirportText,
  GetMapText,
  GetnavigationLonAndLatApi,
} from "./api/map";
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
// import navigationData from "@/assets/navigation.json";

function MeMap() {
  const map = useRef<any>();
  const MapElement = createRef<HTMLDivElement>();
  let AtcSource: any = null;
  let AtcRangeSource: any = null;
  let PilotSource: any = null;
  let AtcLayer: any = null;
  let AtcRangeLayer: any = null;
  let PilotLayer: any = null;
  let AirportPlannedTrackLayer: any = null;
  let AirportPlannedTrackSource: any = null;
  let AirportPlannedTrackLlLayer: any = null;
  let AirportPlannedTrackLlSource: any = null;
  const [time, setTime] = useState<any>();
  const [infoData, setInfoData] = useState<string[]>([]);
  const [i, setI] = useState<number>(1);
  const [atcDataList, setAtcDataList] = useState<string[][]>([]);
  const [PilotDataList, setPilotDataList] = useState<string[][]>([]);

  const [isPilotInfoVisible, setIsPilotInfoVisible] = useState<boolean>(false);
  const [isPilotListVisible, setIsPilotListVisible] = useState<boolean>(false);
  const [isWidthMobile, setIsWidthMobile] = useState<boolean>(false);
  const [isAtcListVisible, setIsAtcListVisible] = useState<boolean>(false);
  const [isAirportPlannedTrackVisible, setIsAirportPlannedTrackVisible] =
    useState<boolean>(false);
  const [AirportPlannedTrackData, setAirportPlannedTrackData] = useState<
    number[][]
  >([]);
  const [isAtcInfoVisible, setIsAtcInfoVisible] = useState<boolean>(false);

  const initMap = () => {
    map.current = new Map({
      target: "map",
      layers: [
        new TileLayer({
          source: new XYZ({
            url: "https://map.geoq.cn/ArcGIS/rest/services/ChinaOnlineStreetPurplishBlue/MapServer/tile/{z}/{y}/{x}",
          }),
        }),
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
              setInfoData(data);
              setIsAtcInfoVisible(false);
              setIsPilotInfoVisible(true);
              GetAirportsLonAndLat(data[11], data[13], data[5], data[6]);
              //   flyToPoint(
              //     [Number(data[6]), Number(data[5])],
              //     map.current.getView().getZoom(),
              //     1000
              //   );
            }
            if (data[3] === "ATC") {
              const layers = map.current.getLayers().getArray();
              if (layers.length > 0) {
                layers.forEach((item: any, index: any) => {
                  if (index > 1) {
                    item.getSource().refresh(); //这句代码
                  }
                });
              }
              setInfoData(data);
              setIsAtcInfoVisible(true);
              setIsPilotInfoVisible(false);
              flyToPoint(
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
  const flyToPoint = (point: any, zoom: number, duration: number = 1500) => {
    var to = fromLonLat(point);
    var view = map.current.getView();

    view.animate({
      center: to,
      zoom: zoom,
      duration: duration,
    });
  };
  const flyTo = (point: any, zoom: number, duration: number = 1500) => {
    // var to = fromLonLat(point);
    // var view = map.current.getView();

    // view.animate({
    //   center: to,
    //   zoom: zoom,
    //   duration: duration,
    // });
    // const duration1 = 2000;
    const view = map.current.getView();
    // const zoom1 = view.getZoom();
    let parts = 2;
    let called = false;
    function callback(complete: any) {
      --parts;
      if (called) {
        return;
      }
      if (parts === 0 || !complete) {
        called = true;
        // done(complete);
      }
    }
    view.animate(
      {
        center: fromLonLat(point),
        duration: duration,
      },
      callback
    );
    view.animate(
      {
        zoom: zoom - 1,
        duration: duration / 2,
      },
      {
        zoom: zoom,
        duration: duration / 2,
      },
      callback
    );
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
      setAtcSource(atcData);
      setPilotSource(pilotData);
      setAtcDataList(atcData);
      setPilotDataList(pilotData);
    } catch (error) {}
  };
  const setAtcSource = (data: string[][]) => {
    if (AtcSource) {
      AtcSource.clear();
    }
    if (AtcRangeSource) {
      AtcRangeSource.clear();
    }
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
    AtcSource = new VectorSource({
      features: _AtcFeatures,
    });
    AtcLayer = new VectorLayer({
      source: AtcSource,
    });
    AtcLayer.setZIndex(99);
    AtcRangeSource = new VectorSource({
      features: _AtcRangeFeatures,
    });
    AtcRangeLayer = new VectorLayer({
      source: AtcRangeSource,
    });
    // AtcRangeLayer.setZIndex(1);
    map.current.addLayer(AtcLayer);
    map.current.addLayer(AtcRangeLayer);
  };
  const setPilotSource = (data: string[][]) => {
    if (PilotSource) {
      PilotSource.clear();
    }
    const _PilotFeatures = data.map((item) => {
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
    PilotSource = new VectorSource({
      features: _PilotFeatures,
    });
    PilotLayer = new VectorLayer({
      source: PilotSource,
    });
    map.current.addLayer(PilotLayer);
  };

  const addAirportPlannedTrackSource = (data: number[][], ll: any) => {
    console.log(data);

    if (AirportPlannedTrackSource) {
      AirportPlannedTrackSource.clear();
    }
    if (AirportPlannedTrackLlSource) {
      AirportPlannedTrackLlSource.clear();
    }
    const routeData: any[] = [];
    const routeDataIsLl: any[] = [];
    routeDataIsLl.push(fromLonLat([data[0][1], data[0][0]]));
    routeDataIsLl.push(
      fromLonLat([data[data.length - 1][1], data[data.length - 1][0]])
    );
    data.map((item) => {
      routeData.push(fromLonLat([item[1], item[0]]));
    });
    const _feature = new Feature({
      title: "111",
      geometry: new LineString(routeData),
    });
    _feature.setStyle(
      new Style({
        stroke: new Stroke({
          width: 2,
          color: "#717171",
        }),
      })
    );
    console.log([
      ll,
      fromLonLat([data[data.length - 1][1], data[data.length - 1][0]]),
    ]);

    const _featureLl = new Feature({
      title: "111",
      geometry: new LineString([
        ll,
        fromLonLat([data[data.length - 1][1], data[data.length - 1][0]]),
      ]),
    });
    _featureLl.setStyle(
      new Style({
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
        geometry: new Point(item),
      });
      if (index === 0) {
        _feature.setStyle(
          new Style({
            image: new Icon({
              src: UpAirportImg,
            }),
          })
        );
      }
      if (index === 1) {
        _feature.setStyle(
          new Style({
            image: new Icon({
              src: DownAirportImg,
            }),
          })
        );
      }

      return _feature;
    });
    AirportPlannedTrackSource = new VectorSource({
      features: [_feature, _featureLl],
    });
    AirportPlannedTrackLayer = new VectorLayer({
      source: AirportPlannedTrackSource,
    });
    AirportPlannedTrackLlSource = new VectorSource({
      features: _AirportPlannedTrackFeatures,
    });
    AirportPlannedTrackLlLayer = new VectorLayer({
      source: AirportPlannedTrackLlSource,
    });
    map.current.addLayer(AirportPlannedTrackLayer);
    map.current.addLayer(AirportPlannedTrackLlLayer);
  };
  // const getNavigationData = (navigation: string) => {
  //   let data: number[] = [];
  //   let dd: {
  //     title: string;
  //     lon: number;
  //     lat: number;
  //   }[] = [];
  //   const navigationDataList: any = navigationData;
  //   navigationDataList.map((item: string[]) => {
  //     if (item[0] === navigation) {
  //       data = [Number(item[1]), Number(item[2])];
  //       dd.push({
  //         title: item[0],
  //         lon: Number(item[1]),
  //         lat: Number(item[2]),
  //       });
  //     }
  //   });
  //   return data;
  // };
  // const getNavigationDataList: any = (dataList: string) => {
  //   const data: string[] = dataList.split(" ");
  //   let res: number[][] = [];
  //   data.map((item: string) => {
  //     let d = getNavigationData(item);
  //     if (d[0] !== undefined || d[1] !== undefined) {
  //       res.push(d);
  //     }
  //   });

  //   return res;
  // };

  const GetAirportsLonAndLat = async (
    upAirport: string,
    downAirport: string,
    lon: string,
    lat: string
  ) => {
    try {
      const resUpAirportData: any = await GetAirportsLonAndLatApi(upAirport);
      const resDownAirportData: any = await GetAirportsLonAndLatApi(
        downAirport
      );
      // setAirportPlannedTrackData([
      //   [Number(resUpAirportData[1]), Number(resUpAirportData[2])],
      //   ...getNavigationDataList(route),
      //   [Number(resDownAirportData[1]), Number(resDownAirportData[2])],
      // ]);

      addAirportPlannedTrackSource(
        [
          [Number(resUpAirportData[1]), Number(resUpAirportData[2])],
          // ...getNavigationDataList(route),
          [Number(resDownAirportData[1]), Number(resDownAirportData[2])],
        ],
        fromLonLat([Number(lat), Number(lon)])
      );
    } catch (error) {}
  };

  // const GetNavigationLonAndLat = async (navigation: string) => {
  //   try {

  //   } catch (error) {}
  // };

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
              <Tag color={"blue"}>划行中</Tag>
            ) : (
              <Tag color={"rgb(0,176,240)"}>持飞中</Tag>
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
        <div
          id="map"
          ref={MapElement}
          style={{
            width: "100vw",
            height: "100vh",
          }}
        ></div>
        {/* 顶部 */}
        <div
          className="absolute top-0 left-0"
          style={{ width: document.body.offsetWidth < 800 ? "100%" : "400px" }}
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
          <Row>
            <Col>
              <Tooltip placement="topLeft" title="在线机组列表">
                <Button
                  style={{
                    marginTop: "15px",
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
        {/* 机组列表 */}
        {isPilotListVisible ? (
          <div
            className="absolute top-0 left-0 sm:ml-14 w-full sm:w-auto"
            style={{
              marginTop: document.body.offsetWidth < 800 ? "200px" : "100px",
            }}
          >
            <Card
              bodyStyle={{ padding: 0 }}
              title="在线机组列表"
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
                    GetAirportsLonAndLat(
                      record[11],
                      record[13],
                      record[5],
                      record[6]
                    );
                    flyToPoint(
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
            className="absolute top-0 left-0 sm:ml-14 w-full sm:w-96"
            style={{
              marginTop: document.body.offsetWidth < 800 ? "200px" : "100px",
            }}
          >
            <Card
              bodyStyle={{ padding: 0 }}
              title="在线管制列表"
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
                // scroll={{ x: true }}
                columns={atcColumns}
                onRow={(record) => ({
                  onClick: () => {
                    setInfoData(record);
                    setIsAtcInfoVisible(true);
                    setIsPilotInfoVisible(false);
                    const layers = map.current.getLayers().getArray();
                    if (layers.length > 0) {
                      layers.forEach((item: any, index: any) => {
                        if (index > 1) {
                          item.getSource().refresh(); //这句代码
                        }
                      });
                    }
                    flyTo(
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
          const layers = map.current.getLayers().getArray();
          if (layers.length > 0) {
            layers.forEach((item: any, index: any) => {
              if (index > 1) {
                item.getSource().refresh(); //这句代码
              }
            });
          }
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
          setIsPilotInfoVisible(false);
          const layers = map.current.getLayers().getArray();
          if (layers.length > 0) {
            layers.forEach((item: any, index: any) => {
              if (index > 1) {
                item.getSource().refresh(); //这句代码
              }
            });
          }
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
              {Math.round((((Number(infoData[38]) & 4092) >> 2) / 1024) * 360)}
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
  );
}

export default MeMap;
