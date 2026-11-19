import type {
  GeoData,
  TypeListProperty,
} from "./property.model";

export interface PropertyEquipmentServiceResponse {
  id: string;
  _id: string;
  name: string;
  color: string;
}

export interface PropertyImageResponse {
  _id: string;
  key: string;
  url: string;
  zone?: string | null;
  contentType: string;
  originalName: string;
  category: string;
}

export type AmenitiesResponse = {
  name: string;
  color: string;
};

///// interace de respuesta del servicio del catalogo
export interface PropertyCatalogItemResponse {
  _id: string;
  notionId?: string;
  __v?: number;
  amenities: AmenitiesResponse[] | null;
  createdAt?: string;
  updatedAt?: string;
  notionOwnerId?: string | null;
  ownerId?: string | null;
  condo?: boolean | null;
  rentStartDate?: string | null;
  contractDate?: string | null;
  address: string;
  banner: boolean;
  bed: string | null;
  editedPhotos: string | null;
  googleDriveImages: string | null;
  id: string;
  isALand: boolean | null;
  isLand?: boolean | string | number | null;
  list: TypeListProperty;
  locationUrl: string | null;
  geoData?: GeoData | null;
  maxPrice: number | null;
  minPrice: number | null;
  name: string;
  offer: boolean;
  originalPhotos: string | null;
  owner: string | null;
  parking: string | null;
  priceData: string;
  priceSpecial: number | null;
  propertyAmenities: string | null;
  propertyArea: string | null;
  propertyDescription: string | null;
  propertyDimensions: string | null;
  propertyInformation: string | null;
  propertyPayment: string | null;
  propertyType?: string | null;
  propertyView: string | null;
  pool?: boolean | null;
  residentialDevelopment?: string | null;
  security24_7?: boolean | null;
  solarPanel?: string;
  status: string | null;
  urlImage: string | null;
  virtualRoute?: string | null;
  wc: string | null;
  zonaText: string | null;
  development: string;
  developmentAmenities: PropertyEquipmentServiceResponse[];
  detailedEquipment: PropertyEquipmentServiceResponse[];
  equipmentServices: PropertyEquipmentServiceResponse[];
}

///// interface para el endpoint de la propiedad seleccionada

export interface SelectedPropertyResponse extends Omit<PropertyCatalogItemResponse, "equipmentServices"> {
  titleApp: string | null;
  description: string | null;
  amenities: AmenitiesResponse[] | null;
  equipmentServices?: PropertyEquipmentServiceResponse[] | null;
  images?: PropertyImageResponse[] | null;
  Images?: PropertyImageResponse[] | null;
  geoData: GeoData;
}

///// interface para el endpoint de los markers del mapa
export interface PropertyMarkerResponse extends Pick<
  PropertyCatalogItemResponse,
  | "_id"
  | "id"
  | "name"
  | "priceData"
  | "parking"
  | "bed"
  | "wc"
  | "urlImage"
  | "solarPanel"
  | "propertyView"
  | "zonaText"
  | "address"
  | "list"
  | "status"
  | "equipmentServices"
  | "isALand"
  | "propertyAmenities"
  | "amenities"
  | "propertyType"
  | "development"
> {
  geoData: GeoData;
}

export interface CatalogFilterResponse {
  haveOtherPage: boolean;
  limit: number;
  nextCursor: string | null;
  properties: PropertyCatalogItemResponse[];
}
