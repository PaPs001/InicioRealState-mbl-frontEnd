import { useCallback, useEffect, useRef, useState } from "react";
import type { Region } from "react-native-maps";
import { useAuth } from "@/contexts/AuthContext";
import { getMapProperties } from "@/lib/api/endpoints/catalog";
import type { LocatedPropertyMarker, PropertyMarker } from "@/lib/types";

function hasValidCoordinates(
  property: PropertyMarker,
): property is LocatedPropertyMarker {
  const location = property.geoData?.locations;
  if (location?.type !== "Point" || !Array.isArray(location.coordinates))
    return false;
  const [longitude, latitude] = location.coordinates;
  return (
    location.coordinates.length === 2 &&
    typeof longitude === "number" &&
    Number.isFinite(longitude) &&
    typeof latitude === "number" &&
    Number.isFinite(latitude) &&
    longitude >= -180 &&
    longitude <= 180 &&
    latitude >= -90 &&
    latitude <= 90
  );
}

export function useMapProperties() {
  const { authToken } = useAuth();
  const [properties, setProperties] = useState<LocatedPropertyMarker[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const requestIdRef = useRef(0);

  const loadProperties = useCallback(
    async (region: Region) => {
      if (!authToken) return;
      const requestId = ++requestIdRef.current;
      const { latitude, longitude, latitudeDelta, longitudeDelta } = region;
      const params = new URLSearchParams({
        west: String(Math.max(-180, longitude - longitudeDelta / 2)),
        south: String(Math.max(-90, latitude - latitudeDelta / 2)),
        north: String(Math.min(90, latitude + latitudeDelta / 2)),
        east: String(Math.min(180, longitude + longitudeDelta / 2)),
      });

      setError(null);
      setIsLoading(true);
      try {
        const result = await getMapProperties(params, authToken);

        if (!Array.isArray(result)) throw new Error("Invalid map response");
        if (requestId !== requestIdRef.current) return;
        const locatedProperties = result.filter(hasValidCoordinates);
        setProperties(locatedProperties);
      } catch {
        if (requestId !== requestIdRef.current) return;
        setError("No se pudieron cargar las propiedades de esta zona.");
      } finally {
        if (requestId === requestIdRef.current) setIsLoading(false);
      }
    },
    [authToken],
  );

  useEffect(() => {
    return () => {
      requestIdRef.current += 1;
    };
  }, [loadProperties]);

  return { properties, error, isLoading, loadProperties };
}
