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
      try {
        const result = await getMapProperties(params, authToken);

        if (!Array.isArray(result)) throw new Error("Invalid map response");
        if (requestId !== requestIdRef.current) return;
        const locatedProperties = result.filter(hasValidCoordinates);
        setProperties(locatedProperties);
      } catch {
        if (requestId !== requestIdRef.current) return;
        setError("No se pudieron cargar las propiedades de esta zona.");
      }
    },
    [authToken],
  );

  useEffect(() => {
    const groups = new Map<string, LocatedPropertyMarker[]>();
    for (const property of properties) {
      const key = property.geoData.locations.coordinates.join(",");
      const group = groups.get(key) ?? [];
      group.push(property);
      groups.set(key, group);
    }

    const locations = [...groups.values()].map((group) => {
      const [longitude, latitude] = group[0].geoData.locations.coordinates;
      return {
        longitude,
        latitude,
        cantidad: group.length,
        propiedades: group.map((property) => ({
          id: property.id,
          _id: property._id,
          nombre: property.name,
        })),
      };
    });

    console.log("[Mapa] Propiedades agrupadas por coordenadas exactas:", {
      totalPropiedades: properties.length,
      ubicacionesUnicas: locations.length,
      ubicacionesCompartidas: locations.filter((location) => location.cantidad > 1),
      ubicaciones: locations,
    });
  }, [properties]);

  useEffect(() => {
    return () => {
      requestIdRef.current += 1;
    };
  }, [loadProperties]);

  return { properties, error, loadProperties };
}
