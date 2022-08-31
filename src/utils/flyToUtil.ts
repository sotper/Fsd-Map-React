import { fromLonLat } from "ol/proj";

const flyTo = (map: any, point: any, zoom: number, duration: number = 1500) => {
  const view = map.current.getView();
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

const flyToPoint = (
  map: { current: { getView: () => any } },
  point: any,
  zoom: number,
  duration: number = 1500
) => {
  var to = fromLonLat(point);
  var view = map.current.getView();

  view.animate({
    center: to,
    zoom: zoom,
    duration: duration,
  });
};

export { flyTo, flyToPoint };
