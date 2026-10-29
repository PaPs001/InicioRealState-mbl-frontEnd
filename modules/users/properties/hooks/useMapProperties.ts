import { useCallback, useEffect, useRef, useState } from "react";
import type { Region } from "react-native-maps";
import { useAuth } from "@/contexts/AuthContext";
import { getMapProperties, type MapFilters } from "@/lib/api/endpoints/catalog";
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

const DEBOUNCE_MS = 700;
const MIN_REQUEST_INTERVAL_MS = 3_000;
const CACHE_TTL_MS = 80_000;
const MAX_CACHED_AREAS = 20;

type Bounds = { west: number; south: number; east: number; north: number };
type CachedArea = {
  filtersKey: string;
  bounds: Bounds;
  properties: LocatedPropertyMarker[];
  expiresAt: number;
};

// Shared across map mounts, but never reused with a different session token.
let cacheToken: string | null = null;
let cachedAreas: CachedArea[] = [];
let lastRequestStartedAt = -Infinity;
let debugRequestCount = 0;

function logMap(event: string, details?: Record<string, unknown>) {
  if (__DEV__) console.log(`[Mapa] ${event}`, details ?? {});
}

function getBounds(region: Region, padding = 0): Bounds {
  const latitudeRadius = Math.abs(region.latitudeDelta) * (0.5 + padding);
  const longitudeRadius = Math.abs(region.longitudeDelta) * (0.5 + padding);
  return {
    west: Math.max(-180, region.longitude - longitudeRadius),
    south: Math.max(-90, region.latitude - latitudeRadius),
    east: Math.min(180, region.longitude + longitudeRadius),
    north: Math.min(90, region.latitude + latitudeRadius),
  };
}

function covers(outer: Bounds, inner: Bounds) {
  return outer.west <= inner.west && outer.east >= inner.east &&
    outer.south <= inner.south && outer.north >= inner.north;
}

function findCachedArea(bounds: Bounds, filtersKey: string) {
  cachedAreas = cachedAreas.filter((area) => area.expiresAt > Date.now());
  return cachedAreas.find((area) => area.filtersKey === filtersKey && covers(area.bounds, bounds));
}

export function useMapProperties(filters: MapFilters = {}) {
  const filtersKey = JSON.stringify({
    list: filters.list || undefined,
    zone: filters.zone || undefined,
    equiped: filters.equiped || undefined,
    bathrooms: filters.bathrooms,
    bedrooms: filters.bedrooms,
    parkings: filters.parkings,
  });
  const { authToken } = useAuth();
  const [properties, setProperties] = useState<LocatedPropertyMarker[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const requestIdRef = useRef(0);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const abortRef = useRef<AbortController | null>(null);

  const cancelPendingLoad = useCallback(() => {
    requestIdRef.current += 1;
    if (timerRef.current !== null) clearTimeout(timerRef.current);
    timerRef.current = null;
    if (abortRef.current) logMap("Solicitud cancelada por cambio de zona");
    abortRef.current?.abort();
    abortRef.current = null;
    setIsLoading(false);
  }, []);

  const loadProperties = useCallback((region: Region) => {
    cancelPendingLoad();
    if (!authToken) return;
    if (cacheToken !== authToken) {
      cacheToken = authToken;
      cachedAreas = [];
      lastRequestStartedAt = -Infinity;
    }
    const requestId = requestIdRef.current;
    const visibleBounds = getBounds(region);
    setError(null);
    const cached = findCachedArea(visibleBounds, filtersKey);
    if (cached) {
      logMap("Caché: sin solicitud al servidor", { propiedades: cached.properties.length });
      setProperties(cached.properties);
      return;
    }
    setIsLoading(true);
    const readyAt = Date.now() + DEBOUNCE_MS;
    logMap("Esperando fin del movimiento", { esperaMs: DEBOUNCE_MS });

    const run = async () => {
      if (requestId !== requestIdRef.current || cacheToken !== authToken) return;
      // Recheck the shared limit when the timer fires (another map may have loaded).
      const wait = Math.max(readyAt, lastRequestStartedAt + MIN_REQUEST_INTERVAL_MS) - Date.now();
      if (wait > 0) {
        logMap("Esperando límite entre solicitudes", { esperaMs: wait });
        timerRef.current = setTimeout(() => { void run(); }, wait);
        return;
      }
      timerRef.current = null;
      const reusable = findCachedArea(visibleBounds, filtersKey);
      if (reusable) {
        logMap("Caché: sin solicitud al servidor", { propiedades: reusable.properties.length });
        setProperties(reusable.properties);
        setIsLoading(false);
        return;
      }
      const bounds = getBounds(region, 0.25);
      const params = new URLSearchParams(
        Object.entries(bounds).map(([key, value]) => [key, String(value)]),
      );
      const controller = new AbortController();
      abortRef.current = controller;
      lastRequestStartedAt = Date.now();
      const startedAt = Date.now();
      const debugRequestId = ++debugRequestCount;
      logMap("Solicitud al servidor", { solicitud: debugRequestId, limites: bounds });
      try {
        const result = await getMapProperties(params, JSON.parse(filtersKey) as MapFilters, authToken, controller.signal);
        if (controller.signal.aborted || requestId !== requestIdRef.current || cacheToken !== authToken) return;
        if (!Array.isArray(result)) throw new Error("Invalid map response");
        const locatedProperties = result.filter(hasValidCoordinates);
        logMap("Respuesta recibida", {
          solicitud: debugRequestId,
          duracionMs: Date.now() - startedAt,
          propiedades: locatedProperties.length,
        });
        cachedAreas = [
          { bounds, filtersKey, properties: locatedProperties, expiresAt: Date.now() + CACHE_TTL_MS },
          ...cachedAreas.filter((area) => area.expiresAt > Date.now()),
        ].slice(0, MAX_CACHED_AREAS);
        setProperties(locatedProperties);
      } catch {
        if (!controller.signal.aborted && requestId === requestIdRef.current && cacheToken === authToken) {
          logMap("Error al cargar zona", { solicitud: debugRequestId });
          setError("No se pudieron cargar las propiedades de esta zona.");
        }
      } finally {
        if (requestId === requestIdRef.current) {
          abortRef.current = null;
          setIsLoading(false);
        }
      }
    };
    timerRef.current = setTimeout(() => { void run(); }, DEBOUNCE_MS);
  }, [authToken, cancelPendingLoad, filtersKey]);

  useEffect(() => {
    cancelPendingLoad();
    setProperties([]);
    setError(null);
    return cancelPendingLoad;
  }, [filtersKey, cancelPendingLoad]);

  useEffect(() => {
    if (cacheToken !== authToken) {
      cacheToken = authToken;
      cachedAreas = [];
      lastRequestStartedAt = -Infinity;
    }
    setProperties([]);
    setError(null);
    setIsLoading(false);
    return () => {
      requestIdRef.current += 1;
      if (timerRef.current !== null) clearTimeout(timerRef.current);
      timerRef.current = null;
      abortRef.current?.abort();
      abortRef.current = null;
    };
  }, [authToken]);

  return { properties, error, isLoading, loadProperties, cancelPendingLoad };
}
