import type { Filters } from "@/lib/api/endpoints/catalog";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";

import type { Property } from "@/lib/types";
import {
  findPropertyById,
  getAvailableProperties,
  loadCatalogPropertiesWithFilter,
} from "@/lib/services/property-domain";
import { getUserProperties } from "@/lib/services/user-properties";

type CatalogCacheEntry = {
  key: string;
  properties: Property[];
  cursor: string | null;
  haveOtherPage: boolean;
};

type PropertyStateParams = {
  authToken: string | null;
  currentUserId?: string | null;
};

export function usePropertyState(params: PropertyStateParams) {
  const { authToken, currentUserId } = params;
  const [catalogProperties, setCatalogProperties] = useState<Property[]>([]);
  const [catalogResetVersion, setCatalogResetVersion] = useState(0);
  const [isCatalogLoading, setIsCatalogLoading] = useState(false);
  const [hasLoadedCatalog, setHasLoadedCatalog] = useState(false);
  const [catalogFilters, setCatalogFilters] = useState<Filters | null>(null);
  const [catalogError, setCatalogError] = useState<string | null>(null);
  const [catalogCursor, setCatalogCursor] = useState<string | null>(null);
  const [hasMoreCatalog, setHasMoreCatalog] = useState(false);
  const requestVersion = useRef(0);
  const activeKey = useRef<string | null>(null);
  const snapshot = useRef<CatalogCacheEntry | null>(null);
  const lastRequest = useRef<{ filters: Filters; append: boolean } | null>(
    null,
  );
  // Keep properties and their matching continuation cursor together.
  const catalogCache = useRef<
    Partial<Record<"rent" | "sale", CatalogCacheEntry>>
  >({});
  const pending = useRef<{
    key: string;
    promise: Promise<boolean>;
    controller: AbortController;
  } | null>(null);

  const userProperties = useMemo(
    () => getUserProperties(currentUserId),
    [currentUserId],
  );

  const availableProperties = useMemo(
    () =>
      getAvailableProperties({
        catalogProperties,
        currentUserId,
        hasLoadedCatalog,
      }),
    [catalogProperties, currentUserId, hasLoadedCatalog],
  );

  const getPropertyById = useCallback(
    (id: string) =>
      findPropertyById({
        id,
        catalogProperties,
      }),
    [catalogProperties],
  );

  const resetPropertyState = useCallback(() => {
    requestVersion.current += 1;
    pending.current?.controller.abort();
    activeKey.current = null;
    snapshot.current = null;
    lastRequest.current = null;
    catalogCache.current = {};
    pending.current = null;
    setCatalogProperties([]);
    setCatalogCursor(null);
    setHasMoreCatalog(false);
    setHasLoadedCatalog(false);
    setCatalogFilters(null);
    setCatalogError(null);
    setIsCatalogLoading(false);
  }, []);

  useEffect(() => {
    resetPropertyState();
  }, [authToken, resetPropertyState]);
  useEffect(
    () => () => {
      requestVersion.current += 1;
      pending.current?.controller.abort();
    },
    [],
  );

  const loadCatalogProperties = useCallback(
    (
      filters: Filters = {},
      force = false,
      append = false,
    ): Promise<boolean> => {
      if (!authToken) return Promise.resolve(false);

      const normalized = {
        list: filters.list || undefined,
        zone: filters.zone || undefined,
        equiped: filters.equiped || undefined,
        bedrooms: filters.bedrooms ?? undefined,
        bathRooms: filters.bathRooms ?? undefined,
        parkings: filters.parkings ?? undefined,
        limit: filters.limit ?? 10,
        order: filters.order ?? "asc",
      };

      const key = JSON.stringify(normalized);

      if (append && pending.current) 
        return Promise.resolve(false);

      if (!append && pending.current?.key === key)
        return pending.current.promise;

      if (!append && !force && !pending.current && activeKey.current === key)
        return Promise.resolve(true);

      const list =
        normalized.list === "rent" || normalized.list === "sale"
          ? normalized.list
          : null;
      
      const cached = list ? catalogCache.current[list] : undefined;

      if (!append && !force && cached?.key === key) {
        requestVersion.current += 1;
        pending.current?.controller.abort();
        pending.current = null;
        activeKey.current = key;
        snapshot.current = cached;
        setCatalogProperties(cached.properties);
        setCatalogResetVersion((version) => version + 1);
        setCatalogCursor(cached.cursor);
        setHasMoreCatalog(cached.haveOtherPage);
        setCatalogFilters(normalized);
        setHasLoadedCatalog(true);
        setCatalogError(null);
        setIsCatalogLoading(false);
        return Promise.resolve(true);
      }

      lastRequest.current = {
        filters: { ...normalized, cursor: append ? filters.cursor : undefined },
        append,
      };

      const version = ++requestVersion.current;
      pending.current?.controller.abort();
      const controller = new AbortController();
      setIsCatalogLoading(true);
      setCatalogError(null);
      const promise = (async () => {
        try {
          const page = await loadCatalogPropertiesWithFilter(
            { ...normalized, cursor: append ? filters.cursor : undefined },
            authToken,
            controller.signal,
          );

          if (version !== requestVersion.current) return false;

          if (page.haveOtherPage && (!page.cursor || (append && page.cursor === filters.cursor)))
            throw new Error("Catalog response has no advancing cursor");

          const previous = snapshot.current;
          const combined =
            append && previous?.key === key
              ? [...previous.properties, ...page.properties]
              : page.properties;

          const seenIds = new Set<string>();
          const properties = combined.filter((property) => {
            const id = property._id || property.id;
            if (seenIds.has(id)) return false;
            seenIds.add(id);
            return true;
          });

          snapshot.current = {
            key,
            properties,
            cursor: page.cursor,
            haveOtherPage: page.haveOtherPage && Boolean(page.cursor),
          };

          setCatalogProperties(properties);
          if (!append) setCatalogResetVersion((version) => version + 1);
          setCatalogCursor(page.cursor);
          setHasMoreCatalog(page.haveOtherPage && Boolean(page.cursor));
          setCatalogFilters(normalized);
          setHasLoadedCatalog(true);
          activeKey.current = key;
          if (list) {
            catalogCache.current[list] = {
              key,
              properties,
              cursor: page.cursor,
              haveOtherPage: page.haveOtherPage && Boolean(page.cursor),
            };
          }
          return true;
        } catch {
          if (version === requestVersion.current) {
            setCatalogError(
              "No se pudieron cargar las propiedades. Intenta nuevamente.",
            );
          }
          return false;
        } finally {
          if (version === requestVersion.current) {
            setIsCatalogLoading(false);
            pending.current = null;
          }
        }
      })();

      pending.current = { key, promise, controller };
      return promise;
    },
    [authToken],
  );

  const loadMoreCatalogProperties = useCallback(() => {
    if (!hasMoreCatalog || !catalogCursor || !catalogFilters || pending.current || catalogError)
      return Promise.resolve(false);

    return loadCatalogProperties(
      { ...catalogFilters, cursor: catalogCursor },
      true,
      true,
    );
  }, [
    hasMoreCatalog,
    catalogCursor,
    catalogFilters,
    catalogError,
    loadCatalogProperties,
  ]);

  const retryCatalogPage = useCallback(() => {
    const request = lastRequest.current;
    if (!request || pending.current) return Promise.resolve(false);
    return loadCatalogProperties(request.filters, true, request.append);
  }, [loadCatalogProperties]);

  return {
    catalogProperties,
    catalogResetVersion,
    hasMoreCatalog,
    loadMoreCatalogProperties,
    retryCatalogPage,
    catalogFilters,
    catalogError,
    isCatalogLoading,
    hasLoadedCatalog,
    userProperties,
    availableProperties,
    getPropertyById,
    loadCatalogProperties,
    resetPropertyState,
  };
}

export default usePropertyState;
