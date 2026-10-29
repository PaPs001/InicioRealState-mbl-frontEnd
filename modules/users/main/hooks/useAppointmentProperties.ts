import { useEffect, useState } from "react";
import { getFiltersProperties } from "@/lib/api/endpoints/catalog";
import { useSessionDomain } from "@/contexts/auth/use-session-domain";
import type { Property } from "@/lib/types";
import { getPropertyDisplayName } from "../utils/dashboard-formatters";

const CACHE_TTL_MS = 30_000;
type Entry = { properties: Property[]; expiresAt: number };
const cache = new Map<string, Entry>();
let cacheToken: string | null = null;

export function useAppointmentProperties(appointmentType?: string | null, enabled = false) {
  const { authToken } = useSessionDomain();
  const type = appointmentType?.trim().toLowerCase();
  const list = type === "renta" ? "rent" : type === "venta" ? "sale" : undefined;
  const key = list ?? "all";
  const [result, setResult] = useState<{
    key: string; token: string; properties: Property[]; error: string | null;
  } | null>(null);

  useEffect(() => {
    if (cacheToken !== authToken) {
      cache.clear();
      cacheToken = authToken;
    }
    setResult(null);
    if (!enabled || !authToken) return;
    for (const [cacheKey, entry] of cache) {
      if (entry.expiresAt <= Date.now()) cache.delete(cacheKey);
    }
    const cached = cache.get(key);
    if (cached) {
      setResult({ key, token: authToken, properties: cached.properties, error: null });
      return;
    }
    const controller = new AbortController();
    void getFiltersProperties({ list }, authToken, controller.signal)
      .then(properties => {
        if (controller.signal.aborted || cacheToken !== authToken) return;
        const byId = new Map<string, Property>();
        for (const property of properties) {
          const id = property.id || property._id;
          if (id && !byId.has(id)) byId.set(id, property);
        }
        const options = [...byId.values()].sort((a, b) =>
          getPropertyDisplayName(a).localeCompare(getPropertyDisplayName(b)),
        );
        cache.set(key, { properties: options, expiresAt: Date.now() + CACHE_TTL_MS });
        setResult({ key, token: authToken, properties: options, error: null });
      })
      .catch(() => {
        if (!controller.signal.aborted && cacheToken === authToken) {
          setResult({ key, token: authToken, properties: [], error: "No se pudieron cargar las propiedades. Cierra y vuelve a abrir el formulario para reintentar." });
        }
      });
    return () => controller.abort();
  }, [authToken, enabled, key, list]);

  const current = enabled && result?.key === key && result.token === authToken ? result : null;
  return {
    filteredAppointmentPropertyOptions: current?.properties ?? [],
    isCatalogLoading: enabled && Boolean(authToken) && !current,
    error: current?.error ?? null,
  };
}
