import type { PropertyCatalogItemResponse } from "./property.response";

export type TypeListProperty = "rent" | "sale" | undefined;

export type PropertieImagesMapped = {
  key: string;
  url: string;
  contentType: string;
  zone: string;
  name: string;
};

export type AmenitiesMapped = {
  name: string;
  color: string;
};

///// Interface para la tarjeta de propiedad mapeada
export interface PropertyCard2 {
  id: string;
  _id?: string;
  title?: string;
  address?: string;
  price?: string;
  bedrooms?: number;
  bathrooms?: number;
  parkings?: number;
  isAland?: boolean | null;
  typeListProperty?: TypeListProperty;
  propertyImage?: string;
  statusAmenitie?: string;
  statusProperty?: string;
  zone?: string;
  amenities?: AmenitiesMapped[];
  propertyView?: string;
  hasSolarPanel?: boolean;
  flex?: number;
  balcony?: number;
  hasMantenance?: boolean;
}

////// interface de propiedad seleccionada para mapear
export interface SelectedPropertyMapped extends PropertyCatalogItemResponse {
  geoData: GeoData;
  titleApp: string;
  descriptionProperty: string;
  hasMantenimiento: boolean;
  Images: PropertieImagesMapped[];
}

//// Para el mapa y ubicacion de las propiedades
export interface LocationsData {
  type: "Point";
  /** GeoJSON order: [longitude, latitude]. */
  coordinates: [number, number];
}
export interface GeoData {
  place: string | null;
  placeId: string | null;
  locations: LocationsData;
  formatAddress: string | null;
}

export type PropertyMarkerCard = PropertyCard2 & { geoData: GeoData };

export interface CatalogPropertyPage {
  properties: PropertyCard2[];
  cursor: string | null;
  haveOtherPage: boolean;
  limit: number;
}
