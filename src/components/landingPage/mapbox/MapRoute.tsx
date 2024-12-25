import React from "react";
import { Layer, Source, LayerProps } from "react-map-gl";
import { useAtom } from "jotai";
import { directionAtom } from "~/store/atom";

const MapRoute: React.FC = () => {
  const [direction] = useAtom(directionAtom);

  const layerStyle: LayerProps = {
    type: "line",
    layout: {
      "line-join": "round",
      "line-cap": "round",
    },
    paint: {
      "line-color": "#38bdf8",
      "line-width": 4,
    },
  };

  return (
    <div>
      <Source
        type="geojson"
        data={{
          type: "Feature",
          geometry: {
            type: "LineString",
            coordinates: direction,
          },
          properties: {},
        }}
      >
        <Layer {...layerStyle} />
      </Source>
    </div>
  );
};

export default MapRoute;
