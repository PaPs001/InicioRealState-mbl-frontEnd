import { GeoData } from "@/lib/types";
import {
  PropertyCard,
} from "../types/Property/property.model";
import {
  PropertyCatalogItemResponse,
  PropertyMarkerResponse,
} from "../types/Property/property.response";
import * as normalizeFunctions from "@/lib/utils/property-catalog";

type CardSource = Omit<PropertyMarkerResponse, "geoData">;

export function mapBaseCard(item: CardSource): PropertyCard {
  const price = normalizeFunctions.formatPriceData(item.priceData);
  const bed = normalizeFunctions.formattedBed(item.bed);
  return {
    _id: item._id,
    id: item.id,
    title: item.name,
    address: item.address,
    price: price, //// necesitamos formatear a formato de numero
    bedrooms: bed.bedrooms, //// mismo caso
    bathrooms: normalizeFunctions.parseCount(item.wc),
    parkings: normalizeFunctions.parseCount(item.parking), /// estos tres son el mismo caso
    isAland: item.isALand,
    typeListProperty: item.list,
    propertyImage: item.urlImage || undefined,
    statusAmenitie: normalizeFunctions.formatText(item.propertyAmenities),
    statusProperty: normalizeFunctions.formatText(item.status),
    zone: normalizeFunctions.formatText(item.zonaText),
    amenities: item.equipmentServices,
    propertyView: normalizeFunctions.formatText(item.propertyView),
    hasSolarPanel: normalizeFunctions.extractBoolean(item.solarPanel),
    flex: bed.flex,
    balcony: bed.balcony,
  };
}

export function mapApiPropertyToCard(
  item: PropertyCatalogItemResponse,
): PropertyCard {
  return mapBaseCard(item);
}

export type PropertyMarkerCard = PropertyCard & { geoData: GeoData };

export function mapApiMarkerToCard(
  item: PropertyMarkerResponse,
): PropertyMarkerCard {
  return {
    ...mapBaseCard(item),
    geoData: item.geoData,
  };
}
