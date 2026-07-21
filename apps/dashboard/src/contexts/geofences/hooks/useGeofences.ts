import { useQuery } from "@tanstack/react-query";
import { fetchGeofences } from "../api/fetchGeofences";
import { Geofence } from "@uav/shared";

const EMPTY: Geofence[] = [];

export const useGeofences = () => {
  const query = useQuery({
    queryKey: ["geofences"],
    queryFn: fetchGeofences,
  });

  return query.data ?? EMPTY;
};
