import { coreApi } from "@/lib/api";
import { mapApiPropertyToProperty } from "@/lib/api/endpoints/catalog";
import type {
  Property,
  PropertyCatalogItemResponse,
  selectedPropertyBackendData,
} from "@/lib/types/property";

const AVAILABLE_PROPERTIES_ENDPOINT = "/users/properties/available";
const SELECTED_PROPERTY = "/users/properties/";
const detailCache = new Map<
  string,
  { data: selectedPropertyBackendData; expires: number }
>();
const pendingDetails = new Map<string, Promise<selectedPropertyBackendData>>();
let cacheToken: string | null | undefined;

export function getCachedSelectedProperty(propertyId: string, token: string) {
  if (cacheToken !== token) {
    detailCache.clear();
    pendingDetails.clear();
    cacheToken = token;
  }
  const entry = detailCache.get(propertyId);
  return entry && entry.expires > Date.now() ? entry.data : null;
}

export async function getAvailableModuleProperties(
  token?: string | null,
): Promise<Property[]> {
  const data = await coreApi<PropertyCatalogItemResponse[]>(
    AVAILABLE_PROPERTIES_ENDPOINT,
    {
      method: "GET",
      token: token ?? undefined,
    },
  );

  return data.map((item) => {
    const property = mapApiPropertyToProperty(item);
    const parkingAmenity = item.parking
      ? `Estacionamiento ${item.parking}`
      : null;
    const amenities = parkingAmenity
      ? [...property.amenities, parkingAmenity]
      : property.amenities;

    return {
      ...property,
      amenities,
      features: amenities,
    };
  });
}

export async function getSelectedProperty(
  propertyId: string,
  token?: string | null,
  refresh = false,
): Promise<selectedPropertyBackendData> {
  const cached = getCachedSelectedProperty(propertyId, token ?? "");
  if (cached && !refresh) return cached;
  const pending = pendingDetails.get(propertyId);
  if (pending) return pending;
  const request = coreApi<selectedPropertyBackendData>(
    `${SELECTED_PROPERTY}${encodeURIComponent(propertyId)}`,
    {
      method: "GET",
      token: token ?? undefined,
    },
  )
    .then((data) => {
      if (cacheToken === (token ?? "")) {
        if (detailCache.size >= 30)
          detailCache.delete(detailCache.keys().next().value!);
        detailCache.set(propertyId, {
          data,
          expires: Date.now() + 2 * 60 * 1000,
        });
      }
      return data;
    })
    .finally(() => {
      if (pendingDetails.get(propertyId) === request)
        pendingDetails.delete(propertyId);
    });
  pendingDetails.set(propertyId, request);
  return request;
}
