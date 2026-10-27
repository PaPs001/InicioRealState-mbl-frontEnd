/**
 * Tipos de Propiedades
 */

///// Interfaz del formato de la respuesta del servidor 
export interface PropertyCatalogItemResponse {
  _id: string;
  notionId?: string;
  __v?: number;
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
  isALand: boolean | string | number | null;
  isLand?: boolean | string | number | null;
  list: "sale" | "rent" | string;
  locationUrl: string | null;
  geoData?: GeoData | null;
  maxPrice: number | null;
  minPrice: number | null;
  name: string;
  offer: boolean;
  originalPhotos: string | null;
  owner: string | null;
  parking: string | null;
  priceData: string | null;
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
  solarPanel?: string | null;
  status: string | null;
  urlImage: string | null;
  virtualRoute?: string | null;
  wc: string | null;
  zonaText: string | null;
}

/// aqui comienzan los tipos definidos para el catalogo
export type PropertyType = "house" | "apartment" | "land";
export type PropertyStatus =
  | "owned"
  | "for_sale"
  | "for_rent"
  | "rented"
  | "available"
  | "pending_sale"
  | "pending_rent";

export type TypeListProperty = "rent" | "sale";
export type Images = {
  key: string;
  url: string;
  contentType: string;
  zone: string;
  name: string;
};


//// aqui terminan los tipos


///// aqui empiezan las interfaces

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

export interface ListingCardProperty {
  id: string;
  _id: string;
  titleListing: string;
  address: string;
  price: number;
  bedrooms: number;
  bathrooms: number;
  parkings: number;
  isAland: boolean | null;
  typeListProperty: TypeListProperty;
  propertyImage: string;
  statusAmenitie: string;
  statusProperty: string;
  zone: string;
  amenities: string[];
  propertyView: string;
  hasSolarPanel: boolean;
}

export interface DatePropertyCard extends Pick<
  ListingCardProperty,
  | "id"
  | "_id"
  | "titleListing"
  | "price"
  | "address"
  | "propertyImage"
  | "zone"
  | "statusAmenitie"
  | "statusProperty"
> {}

export interface SelectedProperty extends ListingCardProperty {
  geoData: GeoData;
  titleApp: string;
  descriptionProperty: string;
  hasMantenimiento: boolean;
  images: Images[];
}

export type PropertyMarker = Pick<ListingCardProperty, "_id" | "id"> & {
  geoData?: GeoData | null;
};

export type LocatedPropertyMarker = PropertyMarker & { geoData: GeoData };

export interface Property {
  id: string;
  _id?: string;
  title: string;
  address: string;
  city: string;
  price: number;
  priceLabel?: string;
  currentValue?: number;
  type: PropertyType;
  status: PropertyStatus;
  listingType?: "rent" | "sale";
  amenities: string[];
  bedrooms?: number;
  bathrooms?: number;
  parking?: number;
  view?: string;
  isFurnished?: boolean;
  furnishedLabel?: string;
  solarPanelLabel?: string;
  sqMeters: number;
  size: number;
  description?: string;
  features?: string[];
  images?: string[];
  googleDriveImages?: string;
  locationUrl?: string;
  geoData?: GeoData | null;
  ownerId?: string;
  agentId?: string;
  monthlyRent?: number;
  purchasedWithUs?: boolean;
  createdAt: string;
  propertyDescription?: string;
  titlePropertie?: string;
}

export type AmenitiesEstructure = {
  name: string;
  color: string;
};

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
  amenitieName?: string | null;
  contentType: string;
  size: number;
  originalName: string;
  encrypted: boolean;
  category: string;
}

export interface selectedPropertyBackendData extends PropertyCatalogItemResponse {
  titleApp: string | null;
  description: string | null;
  amenities: AmenitiesEstructure[] | null;
  equipmentServices?: PropertyEquipmentServiceResponse[] | null;
  images?: PropertyImageResponse[] | null;
  geoData: GeoData;
}

export interface PropertyEarnings {
  propertyId: string;
  totalEarnings: number;
  monthlyEarnings: number;
  occupancyRate: number;
  lastPaymentDate?: string;
  nextPaymentDate?: string;
  paymentHistory: {
    month: string;
    amount: number;
    status: "paid" | "pending" | "late";
  }[];
}

export interface ActiveRental {
  id: string;
  propertyId: string;
  tenantId: string;
  landlordId: string;
  agentId: string;
  startDate: string;
  endDate: string;
  monthlyRent: number;
  paymentDay: number;
  depositAmount: number;
  rules: string[];
  utilities: {
    electricity: { provider: string; phone: string; accountNumber?: string };
    water: { provider: string; phone: string; accountNumber?: string };
    gas: { provider: string; phone: string; accountNumber?: string };
    internet?: { provider: string; phone: string; accountNumber?: string };
  };
  documents: RegistrationDocument[];
  status: "active" | "ending_soon" | "ended";
}

export interface RegistrationDocument {
  id: string;
  name: string;
  type: string;
  url: string;
  uploadDate: string;
  status: "pending" | "approved" | "rejected";
}

export interface SaleRentRegistration {
  id: string;
  propertyId: string;
  agentId: string;
  type: "sale" | "rent";
  transactionAmount: number;
  originalPrice?: number;
  priceChangeReason?: string;
  startDate?: string;
  endDate?: string;
  duration?: number;
  commissionRate: number;
  commissionAmount: number;
  commissionChangeReason?: string;
  isExternalProperty: boolean;
  isSharedCommission: boolean;
  sharedAgentId?: string;
  sharedAgentName?: string;
  sharedCommissionRate?: number;
  sharedCommissionChangeReason?: string;
  agentCommission?: number;
  sharedAgentCommission?: number;
  referralCode?: string;
  referralValid: boolean;
  referralUserId?: string;
  referralUserName?: string;
  referralAmount?: number;
  clientName: string;
  clientPhone: string;
  clientEmail?: string;
  documents: RegistrationDocument[];
  pendingDocuments: string[];
  status: "pending_review" | "approved" | "rejected" | "suspended";
  rejectionReason?: string;
  createdDate: string;
  reviewedDate?: string;
  reviewedBy?: string;
  notes?: string;
}

export type ListingProperty = {
  id: string;
  title: string;
  code: string;
  city: string;
  price: number;
  priceLabel?: string;
  listingType?: Property["listingType"];
  view?: string;
  description?: string;
  solarPanelLabel?: string;
  propertyType: Property["type"];
  googleDriveImages?: string;
  locationUrl?: string;
  geoData?: GeoData | null;
  bedrooms: string;
  bedroomsCount: number;
  bathrooms: string;
  bathroomsCount: number;
  parking: string;
  parkingCount: number;
  isFurnished: boolean;
  furnishedLabel?: string;
  isLand: boolean;
  image?: string;
  tags: string[];
  status: Property["status"];
  propertyDescription?: string;
  titlePropertie?: string;
};


//// aqui terminan las interfaces
