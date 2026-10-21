import {
  getCachedSelectedProperty,
  getSelectedProperty,
} from "../services/properties.service";
import { useEffect, useState } from "react";
import { cacheUploadedFile } from "@/lib/services/uploaded-file-cache";
import { useAuth } from "@/contexts/AuthContext";
import {
  mapApiPropertyToDetail,
  type PropertyDetail,
} from "../mappers/detail.mappers";

export function useSelectedProperty(propertyId?: string) {
  const { authToken } = useAuth();

  const [property, setProperty] = useState<PropertyDetail | null>(null);
  const [isLoading, setIsloading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [errorCode, setErrorCode] = useState<string | null>(null);
  const [refreshVersion, setRefreshVersion] = useState(0);
  const [isRefreshing, setIsRefreshing] = useState(false);

  useEffect(() => {
    if (!propertyId || !authToken) {
      setProperty(null);
      setIsloading(false);
      setErrorCode(!propertyId ? "PROPERTY_ID_MISSING" : "AUTH_REQUIRED");
      setError(
        !propertyId
          ? "No se indicó una propiedad"
          : "Inicia sesión para consultar la propiedad",
      );
      return;
    }

    let active = true;

    async function loadProperty(id: string, token: string) {
      setError(null);
      setErrorCode(null);

      try {
        const cached = getCachedSelectedProperty(id, token);
        setIsloading(!cached);
        setProperty(cached ? mapApiPropertyToDetail(cached) : null);
        const data = await getSelectedProperty(id, token, refreshVersion > 0);

        const resolvedImages = new Map<string, string>();
        await Promise.all((data.images ?? []).map(async (image) => {
          if (!image.key || !image.encrypted) return;
          try {
            const localUri = await cacheUploadedFile({
              storageKey: image.key,
              token,
              namespace: "property-images",
              contentType: image.contentType,
            });
            resolvedImages.set(image.key, localUri);
          } catch (error) {
            console.warn("No se pudo cargar una imagen de la propiedad:", error);
          }
        }));

        if (active) setProperty(mapApiPropertyToDetail(data, resolvedImages));
      } catch (error) {
        if (active) {
          const failure = error && typeof error === "object" ? error : null;
          const status = failure && "status" in failure ? failure.status : null;
          const message = failure && "message" in failure ? failure.message : null;
          const isNetworkError =
            typeof message === "string" && /network|fetch|internet/i.test(message);
          setErrorCode(
            typeof status === "number"
              ? `HTTP_${status}`
              : isNetworkError ? "NETWORK_ERROR" : "PROPERTY_LOAD_FAILED",
          );
          setError(
            isNetworkError
              ? "No se pudo conectar con el servidor. Revisa tu conexión a internet."
              : typeof message === "string" && message.trim()
                ? message.trim().slice(0, 240)
                : "Ocurrió un error al obtener o procesar los datos de la propiedad.",
          );
        }
      } finally {
        if (active) setIsloading(false);
        if (active) setIsRefreshing(false);
      }
    }

    void loadProperty(propertyId, authToken);

    return () => {
      active = false;
    };
  }, [propertyId, authToken, refreshVersion]);

  return {
    property,
    isLoading,
    error,
    errorCode,
    isRefreshing,
    refresh: () => {
      setIsRefreshing(true);
      setRefreshVersion((value) => value + 1);
    },
  };
}
