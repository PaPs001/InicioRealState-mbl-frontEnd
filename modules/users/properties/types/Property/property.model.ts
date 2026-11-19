import { SvgProps } from "react-native-svg";
import { ComponentType } from "react";

export type PropertyDetailRoom = {
  id: string;
  name: string;
  image: string;
  images: string[];
};

export type TypeListProperty = "rent" | "sale" | undefined;

export type AmenitiesMapped = {
  name: string;
  color: string;
  icons?: ComponentType<SvgProps>;
  last?: boolean;
  onPress?: () => void
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
  equipmentServices?: AmenitiesMapped[];
  propertyView?: string;
  hasSolarPanel?: boolean;
  flex?: number;
  balcony?: number;
  hasMantenance?: boolean;
  propertyType?: string;
  development?: string 
}

////// interface de propiedad seleccionada para mapear
export interface SelectedPropertyMapped extends PropertyCard2 {
  geoData?: GeoData;
  amenities: AmenitiesMapped[];
  titleApp?: string;
  descriptionProperty?: string;
  rooms: PropertyDetailRoom[];
  amenitiesImages: PropertyDetailRoom[];
  images: string[];
  previewImages: string[];
  developmentAmenities: AmenitiesMapped[];
  detailedEquipment: AmenitiesMapped[];
  titleCode: string;
  locationURL: string;
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
