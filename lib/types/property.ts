/**
 * Tipos de Propiedades
 */

export type PropertyType = "house" | "apartment" | "land";
export type PropertyStatus =
  | "owned"
  | "for_sale"
  | "for_rent"
  | "rented"
  | "available"
  | "pending_sale"
  | "pending_rent";

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
  ownerId?: string;
  agentId?: string;
  monthlyRent?: number;
  purchasedWithUs?: boolean;
  createdAt: string;
  propertyDescription?: string;
  titlePropertie?: string;
}

export interface PropertyCatalogItemResponse {
  _id: string;
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

export interface selectedPropertyBackendData extends PropertyCatalogItemResponse {
  propertyDescription: string | null;
  propertyTitle: string | null;
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
