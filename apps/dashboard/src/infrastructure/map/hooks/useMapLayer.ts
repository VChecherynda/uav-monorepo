"use client";

import { useEffect } from "react";
import {
  GeoJSONSourceSpecification,
  LayerSpecification,
  GeoJSONSource,
} from "maplibre-gl";
import { useMap } from "./useMap";

type LayerConfig = Omit<LayerSpecification, "source">;

export const useMapLayer = ({
  data,
  sourceId,
  layers,
}: {
  data: GeoJSONSourceSpecification["data"];
  sourceId: string;
  layers: LayerConfig[];
}) => {
  const map = useMap();

  useEffect(() => {
    map.addSource(sourceId, {
      type: "geojson",
      data,
    });

    layers.forEach((layer) => {
      map.addLayer({
        ...layer,
        source: sourceId,
      } as LayerSpecification);
    });

    return () => {
      if (!map.getStyle()) return;
      layers.forEach((layer) => {
        map.removeLayer(layer.id);
      });
      map.removeSource(sourceId);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps -- layer lifetime = component lifetime; layers/sourceId are render-constant
  }, [map]);

  useEffect(() => {
    const _source = map.getSource(sourceId) as GeoJSONSource;
    if (!_source) return;
    _source.setData(data);
    // eslint-disable-next-line react-hooks/exhaustive-deps -- layer lifetime = component lifetime; sourceId are render-constant
  }, [data, map]);
};
