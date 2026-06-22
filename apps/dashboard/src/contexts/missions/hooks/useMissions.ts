import { useQuery } from "@tanstack/react-query";
import { fetchMissions } from "../api/fetchMissions";
import { useEffect } from "react";
import { useMissionsStore } from "../stores/useMissionsStore";

export const useMissions = () => {
  const setMissions = useMissionsStore((s) => s.setMissions);

  const query = useQuery({
    queryKey: ["missions"],
    queryFn: fetchMissions,
  });

  useEffect(() => {
    if (query.data) {
      setMissions(query.data);
    }
  }, [query.data, setMissions]);

  return {
    isLoading: query.isLoading,
    error: query.error,
  };
};
