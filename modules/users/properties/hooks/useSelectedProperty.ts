import { getSelectedProperty } from "../services/properties.service";
import { useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import {
  mapApiPropertyToDetail,
  type PropertyDetail,
} from "../mappers/detail.mappers";

export function useSelectedProperty(propertyId?: string) {
  const { authToken } = useAuth();

  const [property, setProperty] = useState<PropertyDetail | null>(null);
  const [isLoading, setIsloading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!propertyId || !authToken) return;

    let active = true;

    async function loadProperty(id: string, token: string) {
      setIsloading(true);
      setError(null);
      setProperty(null);

      try {
        const data = await getSelectedProperty(id, token);

        if (active) setProperty(mapApiPropertyToDetail(data));
      } catch (error) {
        if (active) {
          setError(
            error instanceof Error
              ? error.message
              : "No se pudo cargar la propiedad",
          );
        }
      } finally {
        if (active) setIsloading(false);
      }
    }

    void loadProperty(propertyId, authToken);

    return () => {
      active = false;
    };
  }, [propertyId, authToken]);

  return {
    property,
    isLoading,
    error,
  };
}
