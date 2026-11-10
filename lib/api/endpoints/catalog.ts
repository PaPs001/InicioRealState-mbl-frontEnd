import { coreApi } from "../client";
import { mapApiPropertyToProperty } from "@/lib/utils/property-catalog";
import type {
  CatalogFilterResponse,
  PropertyMarker,
} from "@/lib/types/property";

export { mapApiPropertyToProperty } from "@/lib/utils/property-catalog";

export async function getMapProperties(
  params: URLSearchParams,
  propertyFilters: MapFilters = {},
  token?: string,
  signal?: AbortSignal,
): Promise<PropertyMarker[]> {
  try {
    const query = new URLSearchParams(params.toString());

    Object.entries(propertyFilters).forEach(([key, value]) => {
      if (value !== undefined && value !== "") {
        query.set(key, String(value));
      }
    });
    const path = `/users/properties/bounds?${query.toString()}`;

    const data = await coreApi<PropertyMarker[]>(path, {
      method: "GET",
      token,
      signal,
    });
    return data;
  } catch (error) {
    throw error;
  }
}

export type TypesOfProperties = {
  rent: number;
  sale: number;
};

type PropertiesCountResponse = {
  renta: number;
  venta: number;
};

export async function getPropertiesCount(
  token?: string,
): Promise<TypesOfProperties> {
  const data = await coreApi<PropertiesCountResponse>(
    "/users/properties/counts",
    {
      method: "GET",
      token,
    },
  );
  return {
    rent: data.renta,
    sale: data.venta,
  };
}

export type Orders =
  | "asc"
  | "desc"
  | "rent_under_10"
  | "rent_under_20"
  | "rent_over_20";

export interface Filters {
  zone?: string;
  list?: string;
  equiped?: string;
  bedrooms?: number;
  bathRooms?: number;
  parkings?: number;
  limit?: number;
  order?: Orders;
  cursor?: string;
}

export interface MapFilters extends Filters {
  bathrooms?: number;
  bedrooms?: number;
  parkings?: number;
}

export async function getFiltersProperties(
  propertyFilters: Filters,
  token?: string,
  signal?: AbortSignal,
) {
  try {
    const params = new URLSearchParams();
    const filters = {
      ...propertyFilters,
      limit: propertyFilters.limit ?? 10,
    };
    
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== "") {
        params.append(key, String(value));
      }
    });

    const path = `/users/filter/properties?${params.toString()}`;
    const data = await coreApi<CatalogFilterResponse>(path, {
      token,
      signal,
    });

    if (!Array.isArray(data.properties))
      throw new Error("Filtered properties response must be an array");
    const properties = data.properties.map(mapApiPropertyToProperty);
    const cursor = data.nextCursor;
    const haveOtherPage = data.haveOtherPage;
    return { properties, cursor, haveOtherPage, limit: data.limit };
  } catch (error) {
    throw error;
  }
}
